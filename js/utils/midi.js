/**
 * The VerovioMessenger class manages the communication between the views and the Verovio worker.
 * A VerovioMessenger instance can be registered by multiple views but only one view is supposed to be active at the time. 
 * A VerovioMessenger owns one worker.
 */

export const midiPlayerServer = 'https://www.verovio.org/javascript/midi-player-wasm';
//export const midiPlayerServer = 'http://localhost:31338/midi-player';

/************************************************************************/
// Emscripten variables and callback - cannot be renamed
/************************************************************************/

window.ULONG_MAX = 4294967295;
window._EM_signalStop = 0;
window._EM_seekSamples = ULONG_MAX;

export function loadScript( url, callback, caller )
{
    // Adding the script tag to the head as suggested before
    var head = document.head;
    var script = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;
    script.caller = caller;

    // Fire the loading
    head.appendChild( script );
}

window.processAudio = function ( buffer_loc, size ) 
{
    let buffer = circularBuffer.prepare();
    let left_buffer_f32 = buffer.getChannelData( 0 );
    let right_buffer_f32 = buffer.getChannelData( 1 );

    // Copy emscripten memory (OpenAL stereo16 format) to JS
    for ( let i = 0; i < size; i++ )
    {
        left_buffer_f32[i] = MidiPlayerModule.HEAP16[( buffer_loc >> 1 ) + 2 * i + 0] / 32768;
        right_buffer_f32[i] = MidiPlayerModule.HEAP16[( buffer_loc >> 1 ) + 2 * i + 1] / 32768;
    }
}

window.updateProgress = function ( current, total ) 
{
    if ( !midiPlayer ) return;

    midiPlayer.currentSamples = current;
    midiPlayer.totalSamples = total;
    midiPlayer.currentTimeStr = samplesToTime( current );
    midiPlayer.totalTimeStr = samplesToTime( total );

    let update = Math.floor( current * 1000 / SAMPLE_RATE / midiPlayer.updateRate );
    if ( midiPlayer.lastUpdate > update )
    {
        midiPlayer.lastUpdate = 0;
    }
    if ( update > midiPlayer.lastUpdate )
    {
        midiPlayer.onUpdate( update * midiPlayer.updateRate );
    }
    midiPlayer.lastUpdate = update;
}

window.completeConversion = function ( status )
{
    if ( !midiPlayer ) return;

    midiPlayer.drainBuffer = true;
    //console.debug('completeConversion', midiPlayer.midiName);
    midiPlayer.convertionJob = null;
    // Not a pause
    if ( _EM_signalStop != 2 )
    {
        setTimeout( midiPlayer.stop(), 1000 );
    }
}

let midiPlayer = null;

export let MidiPlayerModule = {
    locateFile: function ( s )
    {
        //console.log( s );
        return `${ midiPlayerServer }/${ s }`;
    },
    noInitialRun: true,
    totalDependencies: 1,
    monitorRunDependencies: function ( left )
    {
        //console.log(this.totalDependencies);
        //console.log(left);
        if ( ( left == 0 ) && !midiPlayer.isLoaded )
        {
            //console.log( "MidiPlayer is loaded", completeConversion );
            midiPlayer.isLoaded = true;
        }
    }
};

export function onMidiLoaded()
{
    midiPlayer = this.caller;
    MidiModule( MidiPlayerModule );
}

/************************************************************************/
// Circular Web Audio Buffer Queue
/************************************************************************/

class CircularAudioBuffer
{
    constructor( slots, audioCtx )
    {
        // number of buffers
        this.slots = slots || 24;
        this.audioCtx = audioCtx;
        this.buffers = new Array( slots );

        this.reset();

        for ( let i = 0; i < this.slots; i++ )
        {
            let buffer = this.audioCtx.createBuffer( channels, BUFFER, SAMPLE_RATE );
            this.buffers[i] = buffer;
        }
    }

    reset()
    {
        this.used = 0;
        this.filled = 0;
    }

    filledBuffers()
    {
        let fills = this.filled - this.used;
        if ( fills < 0 ) fills += this.slots;
        return fills;

    }

    full()
    {
        return this.filledBuffers() >= this.slots - 1;
    }

    prepare()
    {
        if ( this.full() )
        {
            //console.log('buffers full!!')
            return;
        }
        let buffer = this.buffers[this.filled++];
        this.filled %= this.slots;
        return buffer;
    }

    use()
    {
        if ( !this.filledBuffers() )
        {
            return;
        }
        let buffer = this.buffers[this.used++];
        this.used %= this.slots;
        return buffer;
    }
}

/************************************************************************/
// Web Audio Stuff
/************************************************************************/

const SAMPLE_RATE = 44100;
const BUFFER = 4096;
const channels = 2;

let audioCtx;
let source;
let scriptNode;
let emptyBuffer;

export function initAudio()
{
    audioCtx = new ( window.AudioContext || window.webkitAudioContext )();
    scriptNode = audioCtx.createScriptProcessor( BUFFER, 0, channels );
    scriptNode.onaudioprocess = onAudioProcess;

    source = audioCtx.createBufferSource();
    window.circularBuffer = new CircularAudioBuffer( 8, audioCtx );
    emptyBuffer = audioCtx.createBuffer( channels, BUFFER, SAMPLE_RATE );

    source.connect( scriptNode );
    source.start( 0 );
    //console.debug("initAudio");
}

export function startAudio()
{
    scriptNode.connect( audioCtx.destination );
    //console.debug("startAudio");
}

export function pauseAudio()
{
    circularBuffer.reset();
    scriptNode.disconnect();
    //console.debug("pauseAudio");
}

export function samplesToTime( at ) 
{
    let in_s = Math.floor( at / SAMPLE_RATE );
    let s = in_s % 60;
    let min = in_s / 60 | 0;
    return min + ':' + ( s === 0 ? '00' : s < 10 ? '0' + s : s );
}

function onAudioProcess( audioProcessingEvent )
{
    let generated = circularBuffer.use();

    if ( !generated && midiPlayer.drainBuffer )
    {
        // wait for remaining buffer to drain before disconnect audio
        pauseAudio();
        midiPlayer.drainBuffer = false;
        return;
    }
    if ( !generated )
    {
        //console.log('buffer under run!!')
        generated = emptyBuffer;
    }

    let outputBuffer = audioProcessingEvent.outputBuffer;
    let offset = 0;
    if ( outputBuffer.copyToChannel !== undefined )
    {
        // Firefox -> about 50% faster than decoding
        outputBuffer.copyToChannel( generated.getChannelData( 0 ), 0, offset );
        outputBuffer.copyToChannel( generated.getChannelData( 1 ), 1, offset );
    } else
    {
        // Other browsers -> about 20 - 70% slower than decoding
        let leftChannel = outputBuffer.getChannelData( 0 );
        let rightChannel = outputBuffer.getChannelData( 1 );
        let generatedLeftChannel = generated.getChannelData( 0 );
        let generatedRightChannel = generated.getChannelData( 1 );
        let i;
        for ( i = 0; i < BUFFER; i++ )
        {
            leftChannel[i] = generatedLeftChannel[i];
            rightChannel[i] = generatedRightChannel[i];
        }
    }
}
