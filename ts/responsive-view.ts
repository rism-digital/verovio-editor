/**
 * The ResponsiveView class implements a dynamic rendering view fitting and adjusting to the view port.
 */

import { App } from '../js/app.js'
import { EditorView } from '../js/editor-view.js';
import { VerovioView, VerovioViewUpdate } from './verovio-view.js';

import { elt } from '../js/utils/functions.js';
import { VerovioWorkerProxy } from './worker-proxy.js';
import { appendDivTo } from './utils/functions.js';

export class ResponsiveView extends VerovioView
{
    svgWrapper: HTMLDivElement;
    midiIds: Array<number>;

    constructor( div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy )
    {
        super( div, app, verovio )

        // initializes ui underneath the parent element, as well as Verovio communication
        this.svgWrapper = appendDivTo( this.element, { class: `vrv-svg-wrapper` } );

        this.midiIds = [];
    }

    ////////////////////////////////////////////////////////////////////////
    // VerovioView update methods
    ////////////////////////////////////////////////////////////////////////

    async updateView( update: VerovioViewUpdate, lightEndLoading = true )
    {
        switch ( update )
        {
            case ( VerovioViewUpdate.Activate ):
                await this.updateActivate();
                break;
            case ( VerovioViewUpdate.LoadData ):
                await this.updateLoadData();
                break;
            case ( VerovioViewUpdate.Resized ):
                await this.updateResized();
                break;
            case ( VerovioViewUpdate.Update ):
                await this.updateUpdateData();
                break;
            case ( VerovioViewUpdate.Zoom ):
                await this.updateZoom();
                break;
        }
        this.app.endLoading( lightEndLoading );
    }

    async updateActivate(): Promise<any>
    {
        this.app.settings.adjustPageHeight = true;
        this.app.settings.breaks = 'auto';
        this.app.settings.footer = 'none';
        this.app.settings.scale = this.currentScale;
        this.app.settings.pageHeight = this.svgWrapper.clientHeight * ( 100 / this.app.settings.scale );
        this.app.settings.pageWidth = this.svgWrapper.clientWidth * ( 100 / this.app.settings.scale );
        this.app.settings.justifyVertically = false;

        this.midiIds = [];

        if ( this.app.settings.pageHeight !== 0 )
        {
            await this.verovio.setOptions( this.app.settings );
        }
    }

    async updateLoadData(): Promise<any>
    {
        if ( !( this instanceof EditorView ) )
        {
            this.element.style.height = this.element.parentElement.style.height;
            this.element.style.width = this.element.parentElement.style.width;
        }

        if ( this.ui && this.element && this.svgWrapper )
        {
            this.updateSVGDimensions();
            // Reset pageHeight and pageWidth to match the effective scaled viewport width
            this.app.settings.scale = this.currentScale;
            this.app.settings.pageHeight = this.svgWrapper.clientHeight * ( 100 / this.app.settings.scale );
            this.app.settings.pageWidth = this.svgWrapper.clientWidth * ( 100 / this.app.settings.scale );
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

    async updateResized(): Promise<any>
    {
        await this.updateLoadData();
    }

    async updateUpdateData(): Promise<any>
    {
        await this.verovio.loadData( this.app.mei );
        this.app.pageCount = await this.verovio.getPageCount();
        await this.updateLoadData();
    }

    async updateZoom(): Promise<any>
    {
        await this.updateLoadData();
    }

    async renderPage( lightEndLoading: boolean = false ): Promise<any>
    {
        const svg = await this.verovio.renderToSVG( this.currentPage );
        this.svgWrapper.innerHTML = svg;

        if ( lightEndLoading ) this.app.endLoading( true );
    }

    async midiUpdate( time: number ): Promise<any>
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
                    let note = <SVGElement>this.svgWrapper.querySelector( '#' + noteid );
                    if ( note ) note.style.filter = "";
                }
            };
            this.midiIds = elementsAtTime.notes;
            for ( let i = 0, len = this.midiIds.length; i < len; i++ ) 
            {
                let note = <SVGElement>this.svgWrapper.querySelector( '#' + this.midiIds[i] );
                if ( note ) note.style.filter = "url(#highlighting)";
                //if ( note ) animateStart.beginElement();
            };
        }
    }

    async midiStop(): Promise<any>
    {
        for ( let i = 0, len = this.midiIds.length; i < len; i++ ) 
        {
            let note = <SVGElement>this.svgWrapper.querySelector( '#' + this.midiIds[i] );
            if ( note ) note.style.filter = "";
        };
        this.midiIds = [];
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateSVGDimensions(): void
    {
        this.svgWrapper.style.height = this.element.style.height;
        this.svgWrapper.style.width = this.element.style.width;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onPage( e: CustomEvent ): boolean
    {
        if ( !super.onPage( e ) ) return false;
        //console.debug("ResponsiveView::onPage");

        this.renderPage( true );

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////

    scrollListener( e: UIEvent ): void
    {
        let element = (e.target as HTMLElement);
        console.log(element);
        this.svgWrapper.scrollTop = element.scrollTop;
        this.svgWrapper.scrollLeft = element.scrollLeft;
    }
}
