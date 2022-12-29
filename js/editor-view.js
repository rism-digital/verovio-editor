/**
 * The EditorView class implements editor interactions, such as selecting and dragging.
 * It uses a responsive layout. 
 */

import { ResponsiveView } from '../js-dist/responsive-view.js';
import { Cursor } from './cursor.js';
import { ActionManager } from '../js-dist/action-manager.js';

import { elt } from './utils/functions.js';

import * as soundsImport from './utils/sounds.js';

export class EditorView extends ResponsiveView
{
    constructor( div, app, verovio )
    {
        super( div, app, verovio )

        this.sounds = soundsImport;

        // add the svgOverlay for dragging
        this.ui.svgOverlay = elt( 'div', { class: `vrv-svg-overlay`, style: `position: absolute` } );
        this.element.appendChild( this.ui.svgOverlay );

        this.ui.cursor = elt( 'div', { class: `vrv-editor-cursor` } );
        this.element.appendChild( this.ui.cursor );
        this.cursor = new Cursor( this.ui.cursor, this );

        // synchronized scrolling between svg overlay and wrapper
        this.eventManager.bind( this.ui.svgOverlay, 'scroll', this.scrollListener );
        this.eventManager.bind( this.ui.svgOverlay, 'mouseleave', this.mouseLeaveListener );
        this.eventManager.bind( this.ui.svgOverlay, 'mouseenter', this.mouseEnterListener );

        // For dragging
        this.mouseMoveTimer = false;
        this.draggingActive = false;
        this.highlightedCache = [];

        // For note playback
        this.lastNote = {};
        this.audio = new Audio();

        // EditorAction
        this.actionManager = new ActionManager( this );
    }

    ////////////////////////////////////////////////////////////////////////
    // Overwriting methods
    ////////////////////////////////////////////////////////////////////////

    updateSVGDimensions()
    {
        super.updateSVGDimensions();

        if ( this.ui && this.ui.svgOverlay )
        {
            this.ui.svgOverlay.style.height = this.svgWrapper.style.height;
            this.ui.svgOverlay.style.width = this.svgWrapper.style.width;
        }
    }

    initCursor()
    {
        const svgRoot = this.svgWrapper.querySelector( 'svg' );
        if ( !svgRoot ) return;

        const top = this.element.getBoundingClientRect().top;
        const left = this.element.getBoundingClientRect().left;
        this.cursor.init( svgRoot, top, left );
    }

    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////

    async renderPage( lightEndLoading = false, createOverlay = true )
    {
        const svg = await this.verovio.renderToSVG( this.currentPage );
        this.svgWrapper.innerHTML = svg;
        this.initCursor();

        // create the overlay if necessary
        if ( createOverlay ) 
        {
            this.createOverlay();
        }
        //  make sure highlights are up to date
        this.reapplyHighlights();

        if ( lightEndLoading ) this.app.endLoading( true );
    }

    async updateMEI()
    {
        const mei = await this.verovio.getMEI( {} );
        this.app.mei = mei;
        let event = new CustomEvent( 'onUpdateData', {
            detail: {
                currentId: this.currentId,
                caller: this
            }
        } );
        this.app.customEventManager.dispatch( event );
    }

    async setCurrent( id )
    {
        this.currentId = id;
        const pageWithElement = await this.verovio.getPageWithElement( id );
        if ( ( pageWithElement > 0 ) && ( pageWithElement != this.currentPage ) )
        {
            this.currentPage = pageWithElement;
            let event = new CustomEvent( 'onPage' );
            this.app.customEventManager.dispatch( event );;
        }
        this.resetHighlights();
        this.activateHighlight( id )
    }

    async playNoteSound()
    {
        const attr = await this.app.verovio.getElementAttr( this.highlightedCache[0] );
        if ( !attr.pname || !attr.oct ) return;
        if ( ( this.lastNote.pname === attr.pname ) && ( this.lastNote.oct === attr.oct ) ) return;

        this.lastNote.pname = attr.pname;
        this.lastNote.oct = attr.oct;

        var midiBase = 0;
        switch ( attr.pname )
        {
            case 'd': midiBase = 2; break;
            case 'e': midiBase = 4; break;
            case 'f': midiBase = 5; break;
            case 'g': midiBase = 7; break;
            case 'a': midiBase = 9; break;
            case 'b': midiBase = 11; break;
        }
        if ( attr.accid )
        {
            if ( attr.accid == 'f' ) midiBase--;
            else if ( attr.accid == 's' ) midiBase++;
        }
        let midiPitch = midiBase + ( parseInt( attr.oct ) ) * 12;

        if ( midiPitch < 0 || midiPitch > 96 ) return;
        if ( this.lastNote.midiPitch === midiPitch ) return;

        this.lastNote.midiPitch = midiPitch;
        this.audio.src = eval( 'this.sounds.c' + midiPitch );
        this.audio.play();
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    createOverlay()
    {
        // Copy wrapper HTML to overlay
        this.ui.svgOverlay.innerHTML = this.svgWrapper.innerHTML;

        // Remove all the bounding boxes from the original wrapper because we do not want to highlight them
        for ( const node of this.svgWrapper.querySelectorAll( 'g.bounding-box' ) )
        {
            node.parentNode.removeChild( node );
        }

        // Make all /g, /path and /text transparent
        for ( const node of this.ui.svgOverlay.querySelectorAll( 'g, path, text' ) )
        {
            node.style.stroke = 'transparent';
            node.style.fill = 'transparent';
        }

        // Remove bouding boxes for /slur and /tie
        for ( const node of this.ui.svgOverlay.querySelectorAll( '.slur.bounding-box, .tie.bounding-box' ) )
        {
            node.parentNode.removeChild( node );
        }

        // Increase border for facilitating selection of some elements
        for ( const node of this.ui.svgOverlay.querySelectorAll( '.slur path, .tie path, .stem rect, .dots ellipse, .barLineAttr path' ) )
        {
            //node.style.stroke = 'red';
            node.style.strokeWidth = 90; // A default MEI unit
        }

        // Add event listeners for click on /g
        for ( const node of this.ui.svgOverlay.querySelectorAll( 'g' ) ) 
        {
            this.eventManager.bind( node, 'mousedown', this.mouseDownListener );
        }

        for ( const node of this.ui.svgOverlay.querySelectorAll( 'g.staff' ) ) 
        {
            this.eventManager.bind( node, 'mouseenter', this.mouseEnterListener );
        }

        // Add an event listener to the overlay of note input
        this.eventManager.bind( this.ui.svgOverlay, 'mousedown', this.mouseDownListener );

        this.reapplyHighlights();
    }

    activateHighlight( id )
    {
        if ( this.highlightedCache.indexOf( id ) === -1 )
        {
            this.highlightedCache.push( id );
        }
        this.reapplyHighlights();
    }

    reapplyHighlights()
    {
        if ( this.highlightedCache.length === 1 )
        {
            this.playNoteSound();
        }
        for ( const id of this.highlightedCache )
        {
            // Set the wrapper instance to be red
            this.highlightWithColor( this.svgWrapper.querySelector( '#' + id ), '#e60000' );
        }
    }

    resetHighlights()
    {
        for ( const id of this.highlightedCache )
        {
            // Remove the color
            this.highlightWithColor( this.svgWrapper.querySelector( '#' + id ), '' );
        }
        this.highlightedCache.length = 0;
    }

    highlightWithColor( g, color )
    {
        if ( !g ) return;

        for ( const node of g.querySelectorAll( '*:not(g)' ) )
        {
            // Do not highlight bounding boxes elements
            if ( node.parentNode.classList.contains( 'bounding-box' ) ) continue;
            node.style.fill = color;
            node.style.stroke = color;
        }
    }

    getClosestMEIElement( node, elementType = null )
    {
        if ( !node )
        {
            return null;
        }
        else if ( node.nodeName != "g" || node.classList.contains( 'bounding-box' ) || node.classList.contains( 'notehead' ) )
        {
            return this.getClosestMEIElement( node.parentNode, elementType );
        }
        else if ( elementType && !node.classList.contains( elementType ) )
        {
            return this.getClosestMEIElement( node.parentNode, elementType );
        }
        else
        {
            return node;
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onEndLoading( e )
    {
        if ( !super.onEndLoading( e ) ) return false;
        //console.debug("AppToolbar::onEndLoading");

        this.initCursor();

        return true;
    }

    onSelect( e )
    {
        if ( !super.onSelect( e ) ) return false;
        //console.debug("VerovioView::onSelect");

        this.setCurrent( e.detail.id );

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////

    keyDownListener( e )
    {
        //this.app.startLoading( "Editing...", true );
        //document.removeEventListener( 'keydown', this.boundKeyDown );
        // For now only up and down arrows
        if ( e.keyCode === 38 || e.keyCode === 40 )
        {
            this.actionManager.keyDown( e.keyCode, e.shiftKey, e.ctrlKey );
        }
        else if ( e.keyCode === 8 || e.keyCode === 46 )
        {
            this.actionManager.delete();
        }

        //document.addEventListener( 'keydown', this.boundKeyDown );
        //this.app.endLoading( true );
        event.preventDefault();
    }

    mouseDownListener( e )
    {
        this.draggingActive = false;
        this.lastNote = {};
        e.cancelBubble = true;

        // Note input
        if ( this.cursor.inputMode )
        {
            this.actionManager.insertNote( this.cursor.elementX, this.cursor.currentY );
            this.cursor.hide();
            return;
        }

        // Clicking on the overlay - nothing to do
        if ( e.target.parentNode === this.ui.svgOverlay )
        {
            return;
        }

        // Get MEI element
        let node = this.getClosestMEIElement( e.target );
        if ( !node || !node.attributes.id ) 
        {
            console.log( node, "MEI element not found or with no id" );
            return; // this should never happen, but as a safety 
        }

        const id = node.attributes.id.value;

        // Multiple selection - add it to the cursor
        if ( e.shiftKey )
        {
            this.activateHighlight( id );
            this.cursor.add( id, node );
            document.addEventListener( 'mousemove', this.boundMouseMove );
            document.addEventListener( 'mouseup', this.boundMouseUp );
            return;
        }

        this.cursor.hide();
        // More to reset here?
        document.removeEventListener( 'mousemove', this.boundMouseMove );
        document.removeEventListener( 'touchmove', this.boundMouseMove );

        let event = new CustomEvent( 'onSelect', {
            detail: {
                id: id,
                elementType: node.classList[0],
                caller: this
            }
        } );
        this.app.customEventManager.dispatch( event );

        this.resetHighlights();
        this.activateHighlight( id );
        this.cursor.initEvent( e, id, node );

        // we haven't started to drag yet, this might be just a selection
        document.addEventListener( 'mousemove', this.boundMouseMove );
        document.addEventListener( 'mouseup', this.boundMouseUp );
        document.addEventListener( 'touchmove', this.boundMouseMove );
        document.addEventListener( 'touchend', this.boundMouseUp );
    };

    mouseEnterListener( e )
    {
        document.addEventListener( 'keydown', this.boundKeyDown );
        //console.debug( "Hey!" );
        let node = this.getClosestMEIElement( e.target );
        if ( node && node.classList.contains( 'staff' ) )
        {
            this.cursor.staffEnter( node );
        }
    }

    mouseLeaveListener( e )
    {
        this.cursor.hide();
        document.removeEventListener( 'mouseup', this.boundMouseUp );
        document.removeEventListener( 'touchend', this.boundMouseUp );
        document.removeEventListener( 'mousemove', this.boundMouseMove );
        document.removeEventListener( 'touchmove', this.boundMouseMove );
        document.removeEventListener( 'keydown', this.boundKeyDown );
    }

    mouseMoveListener( e )
    {
        // Fire drag event only every 50ms
        if ( !this.mouseMoveTimer )
        {
            const timerThis = this;
            this.cursor.lastEvent = e;
            this.mouseMoveTimer = true;

            setTimeout( function ()
            {
                timerThis.mouseMoveTimer = false;
                if ( timerThis.cursor.lastEvent.buttons == 1 )
                {
                    timerThis.cursor.hide();
                    timerThis.cursor.moveToLastEvent( false );
                    timerThis.draggingActive = true; // we know we're dragging if this listener triggers
                    let distY = timerThis.cursor.currentY - timerThis.cursor.elementY;
                    timerThis.actionManager.drag( 0, distY );
                }
                else
                {
                    timerThis.cursor.moveToLastEvent();
                }

            }, 50 );
        }

        e.cancelBubble = true;
    };

    mouseUpListener( e )
    {
        //console.debug( "EditorView::mouseUpListener" );

        document.removeEventListener( 'mouseup', this.boundMouseUp );
        document.removeEventListener( 'touchend', this.boundMouseUp );

        if ( this.draggingActive === true )
        {
            //console.debug( "up - dragging" );
            //this.app.startLoading( "Updating content ...", true );

            this.draggingActive = false;
            document.removeEventListener( 'mousemove', this.boundMouseMove );
            document.removeEventListener( 'touchmove', this.boundMouseMove );

            const timerThis = this;

            // Since we are waiting to trigger the mousemove events, we also need to delay the mouseup
            setTimeout( function ()
            {
                timerThis.resetHighlights();
                timerThis.actionManager.update();

            }, 80 );

        }
    }

    scrollListener( e )
    {
        this.cursor.scrollTop = e.target.scrollTop;
        this.cursor.scrollLeft = e.target.scrollLeft;
        if ( this.cursor.lastEvent )
        {
            this.cursor.Update();
        }
        this.svgWrapper.scrollTop = e.target.scrollTop;
        this.svgWrapper.scrollLeft = e.target.scrollLeft;
    }
}
