/**
 * The MidiToolbar class for controlling the MidiPlayer.
 */

import { Toolbar } from '../js-dist/toolbar.js';

import { elt } from './utils/functions.js';

export class MidiToolbar extends Toolbar
{
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
        this.ui.midiControls = elt( 'div', { class: `vrv-btn-group` } );
        this.app.toolbar.ui.midiPlayerSubToolbar.appendChild( this.ui.midiControls );
        //
        this.ui.midiControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.ui.play = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.play.style.backgroundImage = `url(${ iconsPlay })`;
        this.ui.midiControls.appendChild( this.ui.play );
        this.ui.pause = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.pause.style.backgroundImage = `url(${ iconsPause })`;
        this.ui.midiControls.appendChild( this.ui.pause );
        this.ui.stop = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.stop.style.backgroundImage = `url(${ iconsStop })`;
        this.ui.midiControls.appendChild( this.ui.stop );

        this.ui.progressControl = elt( 'div', { class: `vrv-midi-progress` } );
        this.ui.progressControl.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.ui.midiCurrentTime = elt( 'div', { class: `vrv-midi-current-time` } );
        this.ui.progressControl.appendChild( this.ui.midiCurrentTime );
        this.ui.midiBar = elt( 'div', { class: `vrv-midi-bar` } );
        this.ui.progressControl.appendChild( this.ui.midiBar );
        this.ui.midiBarPercent = elt( 'div', { class: `vrv-midi-bar-percent` } );
        this.ui.midiBar.appendChild( this.ui.midiBarPercent );
        this.ui.midiTotalTime = elt( 'div', { class: `vrv-midi-total-time` } );
        this.ui.progressControl.appendChild( this.ui.midiTotalTime );
        this.ui.midiControls.appendChild( this.ui.progressControl );

        // binding
        this.eventManager.bind( this.ui.play, 'click', this.onPlay );
        this.eventManager.bind( this.ui.pause, 'click', this.onPause );
        this.eventManager.bind( this.ui.stop, 'click', this.onStop );
        this.eventManager.bind( this.ui.midiBar, 'mousedown', this.onProgressBarDown );
        this.eventManager.bind( this.ui.midiBar, 'mousemove', this.onProgressBarMove );
        this.eventManager.bind( this.ui.midiBar, 'mouseup', this.onProgressBarUp );

        this.updateAll();
    }

    updateAll()
    {
        this.updateProgressBar();

        this.updateToolbarGrp( this.ui.midiControls, ( this.app.pageCount > 0 ) );
        this.updateToolbarBtnHide( this.ui.play, !this.playing || this.pausing );
        this.updateToolbarBtnHide( this.ui.pause, !this.pausing && this.playing );
        this.updateToolbarBtnHide( this.ui.stop, this.playing || this.pausing );
        this.updateToolbarGrp( this.ui.progressControl, this.playing || this.pausing );
    }

    updateProgressBar()
    {
        this.ui.midiTotalTime.innerHTML = this.midiPlayer.totalTimeStr;
        this.ui.midiCurrentTime.innerHTML = this.midiPlayer.currentTimeStr;
        let percent = ( this.midiPlayer.currentSamples === ULONG_MAX ) ? 0 : ( this.midiPlayer.currentSamples / this.midiPlayer.totalSamples * 100 );
        this.ui.midiBarPercent.style.width = `${ percent }%`;
    }

    updateDragging( pageX )
    {
        let posX = this.barDragStart + ( pageX - this.pageDragStart );
        if ( posX >= 0 && posX <= this.barWidth )
        {
            let percent = posX / this.barWidth;
            this.midiPlayer.currentSamples = percent * this.midiPlayer.totalSamples | 0;
            // Calling low-level callback
            updateProgress( this.midiPlayer.currentSamples, this.midiPlayer.totalSamples );
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Public method to be called by the user
    ////////////////////////////////////////////////////////////////////////

    onPlay( e )
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

    onPause( e )
    {
        this.midiPlayer.pause();
    }

    onStop( e )
    {
        this.midiPlayer.stop();
    }

    onProgressBarDown( e )
    {
        if ( this.midiPlayer.totalSamples === 0 ) return;

        this.pageDragStart = e.pageX;
        this.barDragStart = e.offsetX;
        this.updateDragging( e.pageX );
    }

    onProgressBarMove( e )
    {
        if ( this.pageDragStart !== 0 )
        {
            this.midiPlayer.pause();
            this.updateDragging( e.pageX );
        }
    }

    onProgressBarUp( e )
    {
        if ( this.pageDragStart === 0 ) return;
        if ( this.midiPlayer.totalSamples === 0 ) return;
        this.pageDragStart = 0;
        this.midiPlayer.play();
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate( e )
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("MidiToolbar::onActivate");

        this.updateAll();

        return true;
    }

    onEndLoading( e )
    {
        if ( !super.onEndLoading( e ) ) return false;
        //console.debug("MidiToolbar::onEndLoading");

        this.updateAll();

        return true;
    }

}
