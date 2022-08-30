/**
 * The ResponsiveView class implements a dynamic rendering view fitting and adjusting to the view port.
 */

import { EditorView } from './editor-view.js';
import { VerovioView } from './verovio-view.js';

import { elt } from './utils/functions.js';

export class ResponsiveView extends VerovioView
{
    constructor( div, app, verovio, options )
    {
        super( div, app, verovio, options )

        // initializes ui underneath the parent element, as well as Verovio communication
        this.ui.svgWrapper = elt( 'div', { class: `vrv-svg-wrapper` } );
        this.element.appendChild( this.ui.svgWrapper );

        this.midiIds = [];
    }

    ////////////////////////////////////////////////////////////////////////
    // VerovioView update methods
    ////////////////////////////////////////////////////////////////////////

    async updateView( update, lightEndLoading = true )
    {
        switch ( update )
        {
            case ( VerovioView.update.Activate ):
                await this.updateActivate();
                break;
            case ( VerovioView.update.LoadData ):
                await this.updateLoadData();
                break;
            case ( VerovioView.update.Resized ):
                await this.updateResized();
                break;
            case ( VerovioView.update.UpdateData ):
                await this.updateUpdateData();
                break;
            case ( VerovioView.update.Zoom ):
                await this.updateZoom();
                break;
        }
        this.app.endLoading( lightEndLoading );
    }

    async updateActivate()
    {
        this.app.settings.adjustPageHeight = true;
        this.app.settings.breaks = 'auto';
        this.app.settings.footer = 'none';
        this.app.settings.scale = this.currentScale;
        this.app.settings.pageHeight = this.ui.svgWrapper.clientHeight * ( 100 / this.app.settings.scale );
        this.app.settings.pageWidth = this.ui.svgWrapper.clientWidth * ( 100 / this.app.settings.scale );
        this.app.settings.justifyVertically = false;

        this.midiIds = [];

        if ( this.app.settings.pageHeight !== 0 )
        {
            await this.verovio.setOptions( this.app.settings );
        }
    }

    async updateLoadData()
    {
        if ( !( this instanceof EditorView ) )
        {
            this.element.style.height = this.element.parentElement.style.height;
            this.element.style.width = this.element.parentElement.style.width;
        }

        if ( this.ui && this.element && this.ui.svgWrapper )
        {
            this.updateSVGDimensions();
            // Reset pageHeight and pageWidth to match the effective scaled viewport width
            this.app.settings.scale = this.currentScale;
            this.app.settings.pageHeight = this.ui.svgWrapper.clientHeight * ( 100 / this.app.settings.scale );
            this.app.settings.pageWidth = this.ui.svgWrapper.clientWidth * ( 100 / this.app.settings.scale );
            // Not sure why we need to remove the top margin from the calculation... to be investigated
            this.app.settings.pageHeight -= ( this.app.settings.pageMarginTop ) * ( 100 / this.app.settings.scale );

            if ( this.app.settings.pageHeight !== 0 )
            {
                await this.verovio.setOptions( this.app.settings );
            }
            if ( this.app.pageCount > 0 )
            {
                await this.verovio.setOptions( this.app.settings );
                await this.verovio.redoLayout( this.app.settings );
                this.app.pageCount = await this.verovio.getPageCount();
                if ( this.currentPage > this.app.pageCount )
                {
                    this.currentPage = this.app.pageCount
                }
                await this.renderPage();
            }
        }
    }

    async updateResized() 
    {
        await this.updateLoadData();
    }

    async updateUpdateData()
    {
        await this.verovio.loadData( this.app.mei );
        this.app.pageCount = await this.verovio.getPageCount();
        await this.updateLoadData();
    }

    async updateZoom()
    {
        await this.updateLoadData();
    }

    async renderPage( lightEndLoading = false )
    {
        const svg = await this.verovio.renderToSVG( this.currentPage );
        this.ui.svgWrapper.innerHTML = svg;

        if ( lightEndLoading ) this.app.endLoading( true );
    }

    async midiUpdate( time )
    {
        //const animateStart = document.getElementById( "highlighting-start" );

        let vrvTime = Math.max( 0, time - 500 );
        let elementsAtTime = await this.app.verovio.getElementsAtTime( vrvTime );
        if ( Object.keys( elementsAtTime ).length === 0 || elementsAtTime.page === 0 )
        {
            //console.debug( "Nothing returned by getElementsAtTime" );
            return;
        }
        if ( elementsAtTime.page != this.currentPage )
        {
            this.currentPage = elementsAtTime.page;
            this.app.startLoading( "Loading content ...", true );
            let event = new CustomEvent( 'onPage' );
            this.app.customEventManager.dispatch( event );
        }
        if ( ( elementsAtTime.notes.length > 0 ) && ( this.midiIds != elementsAtTime.notes ) )
        {
            //updatePageOrScrollTo(elementsAtTime.notes[0]);
            for ( let i = 0, len = this.midiIds.length; i < len; i++ ) 
            {
                let noteid = this.midiIds[i];
                if ( elementsAtTime.notes.indexOf( noteid ) === -1 )
                {
                    let note = this.ui.svgWrapper.querySelector( '#' + noteid );
                    if ( note ) note.style.filter = "";
                }
            };
            this.midiIds = elementsAtTime.notes;
            for ( let i = 0, len = this.midiIds.length; i < len; i++ ) 
            {
                let note = this.ui.svgWrapper.querySelector( '#' + this.midiIds[i] );
                if ( note ) note.style.filter = "url(#highlighting)";
                //if ( note ) animateStart.beginElement();
            };
        }
    }

    async midiStop()
    {
        for ( let i = 0, len = this.midiIds.length; i < len; i++ ) 
        {
            let note = this.ui.svgWrapper.querySelector( '#' + this.midiIds[i] );
            if ( note ) note.style.filter = "";
        };
        this.midiIds = [];
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateSVGDimensions()
    {
        this.ui.svgWrapper.style.height = this.element.style.height;
        this.ui.svgWrapper.style.width = this.element.style.width;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onPage( e )
    {
        if ( !super.onPage( e ) ) return false;
        //console.debug("ResponsiveView::onPage");

        this.renderPage( true );

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////

    scrollListener( e )
    {
        this.ui.svgWrapper.scrollTop = e.target.scrollTop;
        this.ui.svgWrapper.scrollLeft = e.target.scrollLeft;
    }
}
