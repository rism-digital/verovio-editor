/**
 * The MidiToolbar class for controlling the MidiPlayer.
 */

import { MidiPlayer } from '../js/midi-player.js';
import { Toolbar } from './toolbar.js';

import { appendDivTo } from './utils/functions.js';

export class MidiToolbar extends Toolbar
{
    midiPlayer: MidiPlayer;
    playing: boolean;
    pausing: boolean;
    pageDragStart: number;
    barDragStart: number;
    barWidth: number;

    midiControls: HTMLDivElement;
    play: HTMLDivElement;
    pause: HTMLDivElement;
    stop: HTMLDivElement;
    progressControl: HTMLDivElement;
    midiCurrentTime: HTMLDivElement;
    midiBar: HTMLDivElement;
    midiBarPercent: HTMLDivElement;
    midiTotalTime: HTMLDivElement;

    constructor( div, app, midiPlayer )
    {
        let iconsPlay =  '/icons/toolbar/play.png';
        let iconsPause =  '/icons/toolbar/pause.png';
        let iconsStop =  '/icons/toolbar/stop.png';

        super( div, app );

        this.active = true;

        this.midiPlayer = midiPlayer;
        this.midiPlayer.midiToolbar = this;

        this.pausing = false;
        this.playing = false;

        this.pageDragStart = 0;
        this.barDragStart = 0;
        // set in the css in .vrv-midi-bar via $midibar-width
        this.barWidth = 200;

        // sub-toolbar in application 
        this.midiControls = appendDivTo(this.app.toolbar.midiPlayerSubToolbar, { class: `vrv-btn-group` });
        appendDivTo(this.midiControls, { class: `vrv-h-separator` });
        
        this.play = appendDivTo( this.midiControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${iconsPlay})` } } );
        
        this.pause = appendDivTo( this.midiControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${iconsPause})` } } );

        this.stop = appendDivTo( this.midiControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${iconsStop})` } });

        this.progressControl = appendDivTo(this.midiControls, { class: `vrv-midi-progress` });
        appendDivTo(this.progressControl, { class: `vrv-h-separator` });
        
        this.midiCurrentTime = appendDivTo( this.progressControl, { class: `vrv-midi-current-time` } );
        this.midiBar = appendDivTo( this.progressControl, { class: `vrv-midi-bar` } );
        this.midiBarPercent = appendDivTo( this.midiBar, { class: `vrv-midi-bar-percent` } );
        this.midiTotalTime = appendDivTo( this.progressControl, { class: `vrv-midi-total-time` } );

        // binding
        this.eventManager.bind( this.play, 'click', this.onPlay );
        this.eventManager.bind( this.pause, 'click', this.onPause );
        this.eventManager.bind( this.stop, 'click', this.onStop );
        this.eventManager.bind( this.midiBar, 'mousedown', this.onProgressBarDown );
        this.eventManager.bind( this.midiBar, 'mousemove', this.onProgressBarMove );
        this.eventManager.bind( this.midiBar, 'mouseup', this.onProgressBarUp );

        this.updateAll();
    }

    updateAll()
    {
        this.updateProgressBar();

        this.updateToolbarGrp( this.midiControls, ( this.app.pageCount > 0 ) );
        this.updateToolbarBtnHide( this.play, !this.playing || this.pausing );
        this.updateToolbarBtnHide( this.pause, !this.pausing && this.playing );
        this.updateToolbarBtnHide( this.stop, this.playing || this.pausing );
        this.updateToolbarGrp( this.progressControl, this.playing || this.pausing );
    }

    updateProgressBar()
    {
        this.midiTotalTime.innerHTML = this.midiPlayer.totalTimeStr;
        this.midiCurrentTime.innerHTML = this.midiPlayer.currentTimeStr;
        let percent = ( this.midiPlayer.currentSamples === window.ULONG_MAX ) ? 0 : ( this.midiPlayer.currentSamples / this.midiPlayer.totalSamples * 100 );
        this.midiBarPercent.style.width = `${ percent }%`;
    }

    updateDragging( pageX )
    {
        let posX = this.barDragStart + ( pageX - this.pageDragStart );
        if ( posX >= 0 && posX <= this.barWidth )
        {
            let percent = posX / this.barWidth;
            this.midiPlayer.currentSamples = percent * this.midiPlayer.totalSamples | 0;
            // Calling low-level callback
            window.updateProgress( this.midiPlayer.currentSamples, this.midiPlayer.totalSamples );
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Public method to be called by the user
    ////////////////////////////////////////////////////////////////////////

    onPlay( e: MouseEvent ): void
    {
        if ( this.pausing )
        {
            this.midiPlayer.play();
        }
        else
        {
            this.app.playMEI();
        }
    }

    onPause( e: MouseEvent ): void
    {
        this.midiPlayer.pause();
    }

    onStop( e: MouseEvent ): void
    {
        this.midiPlayer.stop();
    }

    onProgressBarDown( e: MouseEvent ): void
    {
        if ( this.midiPlayer.totalSamples === 0 ) return;

        this.pageDragStart = e.pageX;
        this.barDragStart = e.offsetX;
        this.updateDragging( e.pageX );
    }

    onProgressBarMove( e: MouseEvent ): void
    {
        if ( this.pageDragStart !== 0 )
        {
            this.midiPlayer.pause();
            this.updateDragging( e.pageX );
        }
    }

    onProgressBarUp( e: MouseEvent ): void
    {
        if ( this.pageDragStart === 0 ) return;
        if ( this.midiPlayer.totalSamples === 0 ) return;
        this.pageDragStart = 0;
        this.midiPlayer.play();
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate( e: CustomEvent ): boolean
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("MidiToolbar::onActivate");

        this.updateAll();

        return true;
    }

    onEndLoading( e: CustomEvent ): boolean
    {
        if ( !super.onEndLoading( e ) ) return false;
        //console.debug("MidiToolbar::onEndLoading");

        this.updateAll();

        return true;
    }

}
