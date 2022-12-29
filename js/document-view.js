/**
 * The DocumentView class implements a continuous document-like view of the MEI.
 * Rendering can be either in SVG or Canvas
 * For browser supporting it an IntersectionObserver is used to lazy-load the rendering of the pages.
 * When SVG rendering is use, a limited number of pages it keep in the DOM.
 */

import { VerovioView, VerovioViewUpdate } from '../js-dist/verovio-view.js';

import { elt } from './utils/functions.js';

export class DocumentView extends VerovioView
{
    constructor( div, app, verovio )
    {
        super( div, app, verovio );

        this.ui.docWrapper = elt( 'div', { class: `vrv-doc-wrapper`, style: `position: absolute` } );
        this.element.appendChild( this.ui.docWrapper );

        this.observer;
        try 
        {
            this.observer = new IntersectionObserver( this.handleObserver );
            this.observer.view = this;
            this.pruning = 0;
            this.observer.pruningMargin = 10;
            this.observer.view = this;
        }
        catch ( err ) 
        {
            console.info( "IntersectionObserver support is missing - loading all pages" );
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // VerovioView update methods
    ////////////////////////////////////////////////////////////////////////

    async updateView( update, lightEndLoading = true )
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
            case ( VerovioViewUpdate.Zoom ):
                await this.updateZoom();
                break;
        }
        this.app.endLoading( lightEndLoading );
    }

    async updateActivate()
    {
        while ( this.ui.docWrapper.firstChild )
        {
            this.ui.docWrapper.firstChild.remove();
        }


        this.app.settings.adjustPageHeight = false;
        this.app.settings.breaks = 'encoded';
        this.app.settings.footer = 'auto';
        this.app.settings.scale = 100;
        this.app.settings.pageHeight = 2970;
        this.app.settings.pageWidth = 2100;
        this.app.settings.justifyVertically = true;
    }

    async updateLoadData( redoLayout = true )
    {
        // We do not need to redo the layout when changing zoom with canvas
        if ( redoLayout )
        {
            await this.verovio.setOptions( this.app.settings );
            await this.verovio.redoLayout();
            const pageCount = await this.verovio.getPageCount();
            this.app.pageCount = pageCount;
        }

        while ( this.ui.docWrapper.firstChild )
        {
            this.ui.docWrapper.firstChild.remove();
        }

        await this.updateResized();

        if ( this.observer )
        {
            this.observer.lastPageIn = 0;
        }

        for ( let idx = 0; idx < this.app.pageCount; idx++ )
        {
            const pageWrapper = elt( 'div', { class: `vrv-page-wrapper` } );
            this.ui.docWrapper.appendChild( pageWrapper );

            pageWrapper.style.height = `${ this.ui.currentPageHeight }px`;
            pageWrapper.style.width = `${ this.ui.currentPageWidth }px`;
            pageWrapper.style.marginTop = `${ this.ui.currentDocMargin }px`;
            pageWrapper.style.marginBottom = `${ this.ui.currentDocMargin }px`;
            pageWrapper.style.border = `solid ${ this.app.options.documentViewPageBorder }px lightgray`;
            pageWrapper.dataset.page = idx + 1;

            if ( !this.app.options.documentViewSVG )
            {
                const img = elt( 'canvas', { class: `` } );
                let ctx = img.getContext( "2d" );
                ctx.canvas.width  = this.ui.currentPageWidth;
                ctx.canvas.height = this.ui.currentPageHeight;
                // font size between 10 and 25
                let fontSize = Math.max( this.currentScale, 10 );
                fontSize = Math.min( fontSize, 25 );
                ctx.font = `${fontSize}px Helvetica`;
                ctx.fillStyle = "grey";
                ctx.textAlign = "center";
                ctx.fillText( "Loading ...", this.ui.currentPageWidth / 2, this.ui.currentPageHeight / 6 );
                pageWrapper.appendChild( img );
            }

            if ( this.observer )
            {
                this.observer.observe( pageWrapper );
            }
            else
            {
                this.renderPage( idx + 1 );
            }
        }

    }

    async updateResized() 
    {
        this.element.style.height = this.element.parentElement.style.height;
        this.element.style.width = this.element.parentElement.style.width;

        if ( this.ui && this.ui.docWrapper )
        {
            this.ui.currentDocMargin = this.app.options.documentViewMargin * this.currentScale / 100;

            this.ui.currentPageWidth = this.app.settings.pageWidth * this.currentScale / 100;
            const docWidth = this.ui.currentPageWidth + 2 * this.ui.currentDocMargin + 2 * this.app.options.documentViewPageBorder;
            const elementWidth = parseInt( this.element.parentElement.style.width, 10 );
            this.ui.currentDocWidth = Math.max( elementWidth, docWidth );
            this.ui.docWrapper.style.width = `${ this.ui.currentDocWidth }px`;

            this.ui.currentPageHeight = this.app.settings.pageHeight * this.currentScale / 100;
            const docHeight = ( this.ui.currentPageHeight + this.ui.currentDocMargin + 2 * this.app.options.documentViewPageBorder ) * this.app.pageCount + this.ui.currentDocMargin;
            const elementHeight = parseInt( this.element.parentElement.style.height, 10 );
            this.ui.currentDocHeight = Math.max( elementHeight, docHeight );
            this.ui.docWrapper.style.height = `${ this.ui.currentDocHeight }px`;
        }
    }

    async updateZoom()
    {
        if ( this.app.options.documentViewSVG )
        {
            await this.updateResized();
            for ( let idx = 0; idx < this.app.pageCount; idx++ )
            {
                let page = this.ui.docWrapper.children[idx];
                page.style.height = `${ this.ui.currentPageHeight }px`;
                page.style.width = `${ this.ui.currentPageWidth }px`;
                page.style.marginTop = `${ this.ui.currentDocMargin }px`;
                page.style.marginBottom = `${ this.ui.currentDocMargin }px`;
                // This is the SVG content of the page
                if ( page.firstChild && page.firstChild )
                {
                    page.firstChild.setAttribute( `height`, `${ this.ui.currentPageHeight }px` );
                    page.firstChild.setAttribute( `width`, `${ this.ui.currentPageWidth }px` );
                }
            }
        }
        else
        {
            // With canvas have to just reload everything but without redoing the layout
            await this.updateLoadData( false );
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    async renderPage( pageIndex )
    {
        const svg = await this.verovio.renderToSVG( pageIndex );
        const page = this.ui.docWrapper.children[pageIndex - 1];

        // SVG
        if ( this.app.options.documentViewSVG )
        {
            const scaleSvg = this.parseAndScaleSVG( svg, this.ui.currentPageHeight, this.ui.currentPageWidth );
            this.ui.docWrapper.children[pageIndex - 1].appendChild( scaleSvg );


            // With SVG we need to prune the document
            clearTimeout( this.pruning );
            const timerThis = this;
            this.pruning = setTimeout( function ()
            {
                timerThis.pruneDocument();
            }, 200 );

        }

        // Canvas
        else
        {
            const canvas = page.firstElementChild;
            const ctx = canvas.getContext( "2d" );
            const DOMURL = self.URL || self.webkitURL;
            const img = new Image();

            const svgBlob = new Blob( [`${ svg }`], { type: "image/svg+xml" } );
            const svgUrl = DOMURL.createObjectURL( svgBlob );

            const originalHeight = this.app.settings.pageHeight;
            const originalWidth = this.app.settings.pageWidth;
            canvas.height = this.ui.currentPageHeight;
            canvas.width = this.ui.currentPageWidth;

            img.onload = function ()
            {
                ctx.drawImage( img, 0, 0, originalWidth, originalHeight, 0, 0, canvas.width, canvas.height );
            };

            img.src = svgUrl;
        }
    }

    handleObserver( entries, observer )
    {
        // Load page and update first and last page if necessary
        for ( let entry of entries )
        {
            if ( entry.isIntersecting )
            {
                observer.view.loadPage( entry.target );
                // Already load the next page (null if none)
                observer.view.loadPage( entry.target.nextSibling );
                // Keep the lastPageLoaded for pruning
                observer.lastPageIn = parseInt( entry.target.dataset.page );
            }
        }
    }

    loadPage( pageElement )
    {
        // This happens when loading the next page of the last page
        if ( pageElement === null ) return;

        if ( !pageElement.dataset.loaded )
        {
            // Mark it as loaded so we do not trigger it again
            pageElement.dataset.loaded = true;
            this.renderPage( pageElement.dataset.page );
        }
    }

    pruneDocument()
    {
        for ( let idx = 0; idx < this.app.pageCount; idx++ )
        {
            let page = this.ui.docWrapper.children[idx];
            if ( idx < this.observer.lastPageIn - this.observer.pruningMargin )
            {
                delete page.dataset.loaded;
                page.innerHTML = '';
            }
            if ( idx > this.observer.lastPageIn + this.observer.pruningMargin )
            {
                delete page.dataset.loaded;
                page.innerHTML = '';
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

}
