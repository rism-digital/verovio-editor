/**
 * The MidiPlayer class interfacing with lower level midi functions.
 */
import { onMidiLoaded } from '../js/utils/midi.js';
import { midiPlayerServer } from '../js/utils/midi.js';
import { MidiPlayerModule } from '../js/utils/midi.js';
import { initAudio, startAudio, loadScript } from '../js/utils/midi.js';
//let song = "data:audio/midi;base64,TVRoZAAAAAYAAQADAHhNVHJrAAAABAD/LwBNVHJrAAAJPR6QPkAekD4AAJBAQB6QQAAAkEJAHpBCAACQQ0AekEMAAJBFQB6QRQAAkEZAHpBGAACQQ0AekEMAAJBFQB6QRQAAkENAHpBDAACQQkAekEIAAJBAQB6QQAAAkD5AHpA+AACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBBQB6QQQAAkEBAHpBAAACQPkAekD4AAJA8QB6QPAAAkEZAHpBGAACQRUAekEUAAJBDQB6QQwAAkEpAHpBKAACQSEAekEgAAJBGQB6QRgAAkEpAHpBKAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBFQB6QRQAAkEZAHpBGAACQSEAekEgAAJBKQB6QSgAAkExAHpBMAACQTUA8kE0AAJBKQDyQSgA8kEpAPJBKAACQS0AekEsAAJBKQB6QSgAAkEhAHpBIAACQSkAekEoAAJBLQDyQSwAAkExAPJBMAACQTUAekE0AAJBMQB6QTAAAkEpAHpBKAACQTEAekEwAAJBNQDyQTQAAkE5APJBOAACQT0A8kE8AAJBKQB6QSgAAkEhAHpBIAACQSkAekEoAAJBLQB6QSwAAkE1AHpBNAACQSkAekEoAAJBLQB6QSwAAkEpAHpBKAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQT0AekE8AAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEpAHpBKAACQTEAekEwAAJBNQB6QTQAAkE9AHpBPAACQUUAekFEAAJBNQB6QTQAAkE9AHpBPAACQTUAekE0AAJBMQB6QTAAAkEpAHpBKAACQSUAekEkAAJBSQB6QUgAAkFFAHpBRAACQT0AekE8AAJBNQHiQTQAAkE1AHpBNAACQT0AekE8AAJBRQB6QUQAAkFJAHpBSAACQSUAekEkAAJBKQB6QSgAAkExAHpBMAACQSkAekEoAAJBJQDyQSQAAkEhAPJBIAACQR0AekEcAAJBIQB6QSAAAkEpAHpBKAACQSEAekEgAAJBHQDyQRwAAkEZAPJBGAACQRUA8kEUAAJBKQHiQSgAAkElAPJBJAACQRUA8kEUAAJBNQHiQTQAAkExAPJBMAACQRUA8kEUAAJBRQHiQUQAAkE9APJBPAACQT0A8kE8AAJBNQB6QTQAAkExAHpBMAACQTUAekE0AAJBKQB6QSgAAkExAHpBMAACQSUAekEkAAJBKQFqQSgAAkExAHpBMAACQTEBakEwAAJBKQB6QSgAAkEpAPJBKAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQRkAekEYAAJBIQB6QSAAAkEVAHpBFAACQRkAekEYAAJBFQB6QRQAAkENAHpBDAACQQUAekEEAAJBAQB6QQAAAkEpAHpBKAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBFQB6QRQAAkEdAHpBHAACQSEB4kEgAAJBIQB6QSAAAkEVAHpBFAACQR0AekEcAAJBIQB6QSAAAkEpAeJBKAACQSkAekEoAAJBDQB6QQwAAkEVAHpBFAACQR0AekEcAAJBIQB6QSAAAkEpAHpBKAACQS0AekEsAAJBIQB6QSAAAkEpAHpBKAACQSEAekEgAAJBHQB6QRwAAkEVAHpBFAACQQ0AekEMAAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEZAHpBGAACQREAekEQAAJBDQB6QQwAAkEFAHpBBAACQS0AekEsAAJBKQB6QSgAAkEhAHpBIAACQT0AekE8AAJBNQB6QTQAAkEtAHpBLAACQT0AekE8AAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEpAHpBKAACQS0AekEsAAJBNQB6QTQAAkE9AHpBPAACQUEAekFAAAJBHQDyQRwAAkEpAPJBKADyQQUA8kEEAAJA/QDyQPwAAkEhAPJBIAACQPkA8kD4AAJBHQDyQRwAAkEhAHpBIAACQQ0AekEMAAJBIQB6QSAAAkEpAHpBKAACQS0B4kEsAAJBLQB6QSwAAkEhAHpBIAACQSkAekEoAAJBLQB6QSwAAkE1AeJBNAACQTUA8kE0AAJBLQB6QSwAAkEpAHpBKAACQT0BakE8AAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEZAHpBGAACQRUAekEUAAJBDQB6QQwAAkEJAHpBCAACQRUAekEUAAJA/QB6QPwAAkD5AHpA+AACQQEAekEAAAJBCQB6QQgAAkENAHpBDAACQRUAekEUAAJBGQB6QRgAAkENAHpBDAACQRUAekEUAAJBDQB6QQwAAkEJAHpBCAACQQEAekEAAAJA+QB6QPgAAkEhAHpBIAACQRkAekEYAAJBFQB6QRQAAkENAHpBDAACQQUAekEEAAJBAQB6QQAAAkD5AHpA+AACQPEAekDwAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBKQB6QSgAAkEhAHpBIAACQRkAekEYAAJBKQB6QSgAAkEhAHpBIAACQRkAekEYAAJBFQB6QRQAAkEhAHpBIAACQRkAekEYAAJBFQB6QRQAAkENAHpBDAACQRkAekEYAAJBFQB6QRQAAkENAHpBDAACQQkAekEIAAJBFQB6QRQAAkENAHpBDAACQRUAekEUAAJBGQB6QRgAAkEhAHpBIAACQSkAekEoAAJBMQB6QTAAAkE5AHpBOAACQT0AekE8AAJBRQB6QUQAAkE5AHpBOAACQT0AekE8AAJBRQB6QUQAAkEpAeJBKAACQSkAekEoAAJBIQB6QSAAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEZAHpBGAACQRUAekEUAAJBIQB6QSAAAkEJAHpBCAACQRUAekEUAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBBQB6QQQAAkD9AHpA/AACQQ0AekEMAAJA9QB6QPQAAkENAHpBDAACQRUAekEUAAJBGQB6QRgAAkD5AHpA+AACQRUAekEUAAJBDQB6QQwAAkEJAHpBCAACQQ0CBcJBDAAD/LwBNVHJrAAAI5QCQK0B4kCsAPJA3QDyQNwAAkDZAHpA2AACQN0AekDcAAJA5QB6QOQAAkDdAHpA3AACQNkA8kDYAAJA1QDyQNQAAkDRAHpA0AACQNUAekDUAAJA3QB6QNwAAkDVAHpA1AACQNEA8kDQAAJAzQDyQMwAAkDJAPJAyAACQN0B4kDcAAJA2QDyQNgAAkDdAHpA3AACQMkAekDIAAJA0QB6QNAAAkDZAHpA2AACQN0AekDcAAJA5QB6QOQAAkDpAHpA6AACQN0AekDcAAJA5QB6QOQAAkDdAHpA3AACQNUAekDUAAJA0QB6QNAAAkDJAHpAyAACQPEAekDwAAJA6QB6QOgAAkDlAHpA5AACQN0AekDcAAJA1QB6QNQAAkDNAHpAzAACQMkAekDIAAJAwQB6QMAAAkDpAHpA6AACQOUAekDkAAJA3QB6QNwAAkD5AHpA+AACQPEAekDwAAJA6QB6QOgAAkD5AHpA+AACQPEAekDwAAJA6QB6QOgAAkDlAHpA5AACQPEAekDwAAJA6QB6QOgAAkDlAHpA5AACQN0AekDcAAJA5QB6QOQAAkDpAHpA6AACQPEAekDwAAJA+QB6QPgAAkDpAHpA6AACQPEA8kDwAAJAzQDyQMwAAkDVAPJA1AACQKUA8kCkAAJAuQDyQLgAAkDpAPJA6AACQOUA8kDkAAJA+QDyQPgAAkDpAPJA6AACQN0A8kDcAAJA5QDyQOQAAkC1APJAtAACQJkAekCYAAJAtQB6QLQAAkC9AHpAvAACQMUAekDEAAJAyQB6QMgAAkDRAHpA0AACQNUAekDUAAJAyQB6QMgAAkDRAHpA0AACQMkAekDIAAJAxQB6QMQAAkC9AHpAvAACQLUAekC0AAJA3QB6QNwAAkDVAHpA1AACQNEAekDQAAJAyQB6QMgAAkDBAHpAwAACQL0AekC8AAJAtQB6QLQAAkCtAHpArAACQNUAekDUAAJA0QB6QNAAAkDJAHpAyAACQOUAekDkAAJA3QB6QNwAAkDVAHpA1AACQOUAekDkAAJA3QB6QNwAAkDVAHpA1AACQNEAekDQAAJA3QB6QNwAAkDVAHpA1AACQNEAekDQAAJAyQB6QMgAAkDVAHpA1AACQNEAekDQAAJAyQB6QMgAAkDFAHpAxAACQNEAekDQAAJAyQB6QMgAAkDRAHpA0AACQNUAekDUAAJAyQB6QMgAAkDdAHpA3AACQOUAekDkAAJA8QB6QPAAAkDdAHpA3AACQPUAekD0AAJA5QB6QOQAAkDtAHpA7AACQPUAekD0AAJA+QB6QPgAAkDVAHpA1AACQN0AekDcAAJA5QB6QOQAAkDpAHpA6AACQNEAekDQAAJA1QB6QNQAAkDdAHpA3AACQOUA8kDkAAJAtQDyQLQAAkDJAeJAyAB6QMkAekDIAAJA0QB6QNAAAkDVAHpA1AACQN0AekDcAAJA5QB6QOQAAkDpAHpA6AACQN0AekDcAAJA8QDyQPAAAkDBAPJAwAACQNUA8kDUAAJAzQB6QMwAAkDJAHpAyAACQM0AekDMAAJA1QB6QNQAAkDdAHpA3AACQM0AekDMAAJA1QB6QNQAAkDNAHpAzAACQMkAekDIAAJAwQB6QMAAAkC9AHpAvAACQOEAekDgAAJA3QB6QNwAAkDVAHpA1AACQM0AekDMAAJAyQB6QMgAAkDBAHpAwAACQMkAekDIAAJAzQB6QMwAAkDVAHpA1AACQN0AekDcAAJA4QB6QOAAAkC9APJAvAACQK0A8kCsAPJArQDyQKwAAkCxAHpAsAACQK0AekCsAAJApQB6QKQAAkCtAHpArAACQLEA8kCwAAJAtQDyQLQAAkC5AHpAuAACQLUAekC0AAJArQB6QKwAAkC1AHpAtAACQLkA8kC4AAJAvQDyQLwAAkDBAHpAwAACQK0AekCsAAJAtQB6QLQAAkC9AHpAvAACQMEAekDAAAJAyQB6QMgAAkDNAHpAzAACQMEAekDAAAJAyQB6QMgAAkDBAHpAwAACQL0AekC8AAJAtQB6QLQAAkCtAHpArAACQNUAekDUAAJAzQB6QMwAAkDJAHpAyAACQMEAekDAAAJAuQB6QLgAAkCxAHpAsAACQK0AekCsAAJApQB6QKQAAkCdAHpAnAACQKUAekCkAAJArQB6QKwAAkCRAHpAkAACQMkAekDIAAJAzQB6QMwAAkDVAHpA1AACQN0AekDcAAJA4QB6QOAAAkDpAHpA6AACQN0AekDcAAJA4QB6QOAAAkDdAHpA3AACQNUAekDUAAJAzQB6QMwAAkDJAHpAyAACQPEAekDwAAJA6QB6QOgAAkDhAHpA4AACQN0AekDcAAJA1QB6QNQAAkDdAHpA3AACQOUAekDkAAJA6QB6QOgAAkDxAHpA8AACQPkAekD4AAJA6QB6QOgAAkDxAHpA8AACQOkAekDoAAJA5QB6QOQAAkDdAHpA3AACQNkAekDYAAJA/QB6QPwAAkD5AHpA+AACQPEAekDwAAJA6QHiQOgAAkDpAHpA6AACQPEAekDwAAJA+QB6QPgAAkD9AHpA/AACQNkAekDYAAJA3QB6QNwAAkDlAHpA5AACQN0AekDcAAJA2QDyQNgAAkDVAPJA1AACQNEAekDQAAJA1QB6QNQAAkDdAHpA3AACQNUAekDUAAJA0QDyQNAAAkDNAPJAzAACQMkA8kDIAAJA3QHiQNwAAkDZAPJA2AACQMkA8kDIAAJA6QHiQOgAAkDlAPJA5AACQMkA8kDIAAJA+QHiQPgAAkDxAPJA8AACQPEAekDwAAJA/QB6QPwAAkD5AHpA+AACQPEAekDwAAJA6QB6QOgAAkDlAHpA5AACQN0AekDcAAJA6QB6QOgAAkDNAeJAzAACQM0AekDMAAJAyQB6QMgAAkDBAHpAwAACQM0AekDMAAJAtQDyQLQAAkDJAPJAyAACQMkA8kDIAAJAwQDyQMAAAkC5APJAuAACQLUAekC0AAJArQB6QKwAAkDJAPJAyAACQJkA8kCYAAJArQIFwkCsAAP8vAA==";
const BASE64_MARKER = ';base64,';
export class MidiPlayer {
    constructor() {
        loadScript(`${midiPlayerServer}/wildwebmidi.js`, onMidiLoaded, this);
        this.isLoaded = false;
        this.isAudioInit = false;
        this.input = null;
        this.lastUpdate = 0;
        this.midiName = 'player.midi';
        this.convertionJob = null;
        this.currentSamples = window.ULONG_MAX;
        this.currentTimeStr = "0.00";
        this.totalSamples = 0;
        this.totalTimeStr = "0.00";
        this.updateRate = 50;
        this.drainBuffer = false;
        this.midiToolbar = null;
        // A view responding to midiUpdate and midiStop
        this.view = null;
    }
    ////////////////////////////////////////////////////////////////////////
    // Public method to be called by the user
    ////////////////////////////////////////////////////////////////////////
    playFile(midiFile) {
        if (!this.isLoaded) {
            console.warn("MidiPlayer is not loaded yet");
            this.input = midiFile;
        }
        else {
            let byteArray = this.convertDataURIToBinary(midiFile);
            if (this.totalSamples > 0) {
                this.stop();
                // a timeout is necessary because otherwise writing to the disk is not done
                const timerThis = this;
                setTimeout(function () {
                    timerThis.convertFile("player.midi", byteArray);
                }, 200);
            }
            else {
                this.convertFile("player.midi", byteArray);
            }
        }
    }
    play() {
        if (!this.isLoaded) {
            console.error("MidiPlayer is not loaded yet");
            return;
        }
        if (!this.isAudioInit) {
            initAudio();
            this.isAudioInit = true;
        }
        if (this.midiToolbar) {
            this.midiToolbar.pausing = false;
            this.midiToolbar.playing = true;
            this.midiToolbar.updateAll();
        }
        window._EM_seekSamples = this.currentSamples;
        if (this.convertionJob) {
            return;
        }
        window._EM_signalStop = 0;
        const timerThis = this;
        setTimeout(function () {
            timerThis.runConversion();
        }, 100);
    }
    stop() {
        window._EM_signalStop = 1;
        window._EM_seekSamples = 0;
        //@ts-ignore
        circularBuffer.reset();
        this.currentSamples = window.ULONG_MAX;
        this.currentTimeStr = "0.00";
        this.totalSamples = 0;
        this.totalTimeStr = "0.00";
        if (this.midiToolbar) {
            this.midiToolbar.pausing = false;
            this.midiToolbar.playing = false;
            this.midiToolbar.updateAll();
        }
        if (this.view)
            this.view.midiStop();
    }
    pause() {
        window._EM_signalStop = 2;
        //@ts-ignore
        circularBuffer.reset();
        if (this.midiToolbar) {
            this.midiToolbar.pausing = true;
            this.midiToolbar.playing = false;
            this.midiToolbar.updateAll();
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Internal methods for updating the UI
    ////////////////////////////////////////////////////////////////////////
    onUpdate(time) {
        this.midiToolbar.updateProgressBar();
        // add callback?
        if (this.view)
            this.view.midiUpdate(time);
    }
    ////////////////////////////////////////////////////////////////////////
    // Internal methods
    ////////////////////////////////////////////////////////////////////////
    runConversion() {
        this.convertionJob = {
            sourceMidi: this.midiName,
            targetWav: this.midiName.replace(/\.midi?$/i, '.wav'),
            targetPath: '',
            conversion_start: Date.now()
        };
        let sleep = 10;
        //@ts-ignore
        circularBuffer.reset();
        startAudio();
        //console.log( this.convertionJob );
        MidiPlayerModule.ccall('wildwebmidi', null, ['string', 'string', 'number'], [this.convertionJob.sourceMidi, this.convertionJob.targetPath, sleep], {
            async: true
        });
    }
    convertDataURIToBinary(dataURI) {
        let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        let base64 = dataURI.substring(base64Index);
        let raw = window.atob(base64);
        let rawLength = raw.length;
        let array = new Uint8Array(new ArrayBuffer(rawLength));
        for (let i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }
    convertFile(file, data) {
        this.midiName = file;
        this.input = null;
        //console.log('open ', this.midiName);
        MidiPlayerModule['FS'].writeFile(this.midiName, data, {
            encoding: 'binary'
        });
        this.play();
    }
}
