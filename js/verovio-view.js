/**
 * The VerovioView class is the based class for other view implementation featuring Verovio rendering.
 * It should not be instanciated directly but only through inherited classes.
 * The VerovioView is attached to a VerovioMessenger.
 */

import { GenericView } from './generic-view.js';
import { EventManager } from './event-manager.js';
import { WorkerProxy } from './worker-proxy.js';

export class VerovioView extends GenericView
{
    constructor( div, app, verovio )
    {
        super( div, app );

        // VerovioMessenger object
        if ( !verovio || !( verovio instanceof WorkerProxy ) ) 
        {
            throw "All VerovioView objects must be initialized with a 'verovio' parameter that is an instance of the WorkerProxy class.";
        }
        this.verovio = verovio;

        // One of the little quirks of writing in ES6, bind events
        this.eventManager = new EventManager( this );
        this.bindListeners(); // Document/Window-scoped events

        // Common members
        this.currentId = null;
        this.currentPage = 1;
        this.currentZoomIndex = this.app.currentZoomIndex;
        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
    }

    // Called to unsubscribe from all events. Probably a good idea to call this if the object is deleted.
    destroy()
    {
        this.eventManager.unbindAll();
        this.events.unsubscribeAll();

        document.removeEventListener( 'mousemove', this.boundMouseMove );
        document.removeEventListener( 'mouseup', this.boundMouseUp );
        document.removeEventListener( 'touchmove', this.boundMouseMove );
        document.removeEventListener( 'touchend', this.boundMouseUp );

        super.destroy()
    }

    parseAndScaleSVG( svgString, height, width )
    {
        const parser = new DOMParser();
        const svg = parser.parseFromString( svgString, "text/xml" );
        svg.firstChild.setAttribute( `height`, `${ height }px` );
        svg.firstChild.setAttribute( `width`, `${ width }px` );
        return svg.firstChild;
    }

    // Necessary for how ES6 "this" works inside events
    bindListeners()
    {
        this.boundKeyDown = ( evt ) => this.keyDownListener( evt );
        this.boundMouseMove = ( evt ) => this.mouseMoveListener( evt );
        this.boundMouseUp = ( evt ) => this.mouseUpListener( evt );
        this.boundResize = ( evt ) => this.resizeComponents( evt );
    }

    async updateView( update )
    {
        console.debug( "View::updateView should be overwritten" );
        console.debug( update );
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate( e )
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("VerovioView::onActivate");

        this.updateView( VerovioView.update.Activate );

        // This occurs when switching views
        if ( e.detail && e.detail.loadData )
        {
            this.updateView( VerovioView.update.LoadData, false );
        }

        return true;
    }

    onLoadData( e )
    {
        if ( !super.onLoadData( e ) ) return false;
        //console.debug("VerovioView::onLoadData");

        this.updateView( VerovioView.update.LoadData, false );

        return true;
    }

    onResized( e )
    {
        if ( !super.onResized( e ) ) return false;
        //console.debug("VerovioView::onResized");

        this.updateView( VerovioView.update.Resized );

        return true;
    }

    onUpdateData( e )
    {
        if ( !super.onUpdateData( e ) ) return false;
        //console.debug("VerovioView::onUpdateData");

        this.updateView( VerovioView.update.UpdateData );

        return true;
    }

    onZoom( e )
    {
        if ( !super.onZoom( e ) ) return false;
        //console.debug("VerovioView::onZoom");

        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];

        this.updateView( VerovioView.update.Zoom );

        return true;
    }
}

VerovioView.update = {
    Activate: 1,
    LoadData: 2,
    Resized: 3,
    Update: 4,
    Zoom: 5
};
