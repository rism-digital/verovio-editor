/**
 * The DocumentView class implements a continuous document-like view of the MEI.
 * Rendering can be either in SVG or Canvas
 * For browser supporting it an IntersectionObserver is used to lazy-load the rendering of the pages.
 * When SVG rendering is use, a limited number of pages it keep in the DOM.
 */

import { App } from './app.js';
import { VerovioView } from './verovio-view.js';
import { VerovioWorkerProxy } from './worker-proxy.js';

import { appendCanvasTo, appendDivTo } from './utils/functions.js';

class DocumentViewObserver extends IntersectionObserver {
    public pruningMargin: number;
    public lastPageIn: number;
    public view: DocumentView;

    constructor(callback: any, view: DocumentView, options?: object) {
        super(callback, options);
        this.pruningMargin = 10;
        this.lastPageIn = 0;
        this.view = view;
    }
}

export class DocumentView extends VerovioView {
    observer: DocumentViewObserver;
    pruning: number;
    currentPageHeight: number;
    currentPageWidth: number;
    currentDocHeight: number;
    currentDocWidth: number;
    currentDocMargin: number;

    docWrapper: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy) {
        super(div, app, verovio);

        this.docWrapper = appendDivTo(this.element, { class: `vrv-doc-wrapper`, style: { position: `absolute` } });

        this.observer;
        try {
            this.observer = new DocumentViewObserver(this.handleObserver, this);
            this.pruning = 0;
        }
        catch (err) {
            console.info("IntersectionObserver support is missing - loading all pages");
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // VerovioView update methods
    ////////////////////////////////////////////////////////////////////////

    override async updateView(update: VerovioView.Update, lightEndLoading: boolean = true): Promise<any> {
        console.log(update);
        switch (update) {
            case (VerovioView.Update.Activate):
                await this.updateActivate();
                break;
            case (VerovioView.Update.LoadData):
                await this.updateLoadData();
                break;
            case (VerovioView.Update.Resized):
                await this.updateResized();
                break;
            case (VerovioView.Update.Update):
                await this.updateLoadData();
                break;
            case (VerovioView.Update.Zoom):
                await this.updateZoom();
                break;
        }
        this.app.endLoading(lightEndLoading);
    }

    async updateActivate(): Promise<any> {
        while (this.docWrapper.firstChild) {
            this.docWrapper.firstChild.remove();
        }


        this.app.verovioOptions.adjustPageHeight = false;
        this.app.verovioOptions.breaks = 'encoded';
        this.app.verovioOptions.footer = 'auto';
        this.app.verovioOptions.scale = 100;
        this.app.verovioOptions.pageHeight = 2970;
        this.app.verovioOptions.pageWidth = 2100;
        this.app.verovioOptions.justifyVertically = true;
    }

    async updateLoadData(redoLayout = true): Promise<any> {
        // We do not need to redo the layout when changing zoom with canvas
        if (redoLayout) {
            await this.verovio.setOptions(this.app.verovioOptions);
            await this.verovio.redoLayout();
            const pageCount = await this.verovio.getPageCount();
            this.app.pageCount = pageCount;
        }

        while (this.docWrapper.firstChild) {
            this.docWrapper.firstChild.remove();
        }

        await this.updateResized();

        if (this.observer) {
            this.observer.lastPageIn = 0;
        }

        for (let idx = 0; idx < this.app.pageCount; idx++) {
            const pageWrapper = appendDivTo(this.docWrapper, { class: `vrv-page-wrapper` });

            pageWrapper.style.height = `${this.currentPageHeight}px`;
            pageWrapper.style.width = `${this.currentPageWidth}px`;
            pageWrapper.style.marginTop = `${this.currentDocMargin}px`;
            pageWrapper.style.marginBottom = `${this.currentDocMargin}px`;
            pageWrapper.style.border = `solid ${this.app.options.documentViewPageBorder}px lightgray`;
            pageWrapper.dataset.page = (idx + 1).toString();

            if (!this.app.options.documentViewSVG) {
                const img = appendCanvasTo(pageWrapper, { class: `` });
                let ctx = img.getContext("2d");
                ctx.canvas.width = this.currentPageWidth;
                ctx.canvas.height = this.currentPageHeight;
                // font size between 10 and 25
                let fontSize = Math.max(this.currentScale, 10);
                fontSize = Math.min(fontSize, 25);
                ctx.font = `${fontSize}px Helvetica`;
                ctx.fillStyle = "grey";
                ctx.textAlign = "center";
                ctx.fillText("Loading ...", this.currentPageWidth / 2, this.currentPageHeight / 6);
                pageWrapper.appendChild(img);
            }

            if (this.observer) {
                this.observer.observe(pageWrapper);
            }
            else {
                this.renderPage(idx + 1);
            }
        }

    }

    async updateResized(): Promise<any> {
        this.element.style.height = this.element.parentElement.style.height;
        this.element.style.width = this.element.parentElement.style.width;

        if (this.ui && this.docWrapper) {
            this.currentDocMargin = this.app.options.documentViewMargin * this.currentScale / 100;

            this.currentPageWidth = this.app.verovioOptions.pageWidth * this.currentScale / 100;
            const docWidth = this.currentPageWidth + 2 * this.currentDocMargin + 2 * this.app.options.documentViewPageBorder;
            const elementWidth = parseInt(this.element.parentElement.style.width, 10);
            this.currentDocWidth = Math.max(elementWidth, docWidth);
            this.docWrapper.style.width = `${this.currentDocWidth}px`;

            this.currentPageHeight = this.app.verovioOptions.pageHeight * this.currentScale / 100;
            const docHeight = (this.currentPageHeight + this.currentDocMargin + 2 * this.app.options.documentViewPageBorder) * this.app.pageCount + this.currentDocMargin;
            const elementHeight = parseInt(this.element.parentElement.style.height, 10);
            this.currentDocHeight = Math.max(elementHeight, docHeight);
            this.docWrapper.style.height = `${this.currentDocHeight}px`;
        }
    }

    async updateZoom(): Promise<any> {
        if (this.app.options.documentViewSVG) {
            await this.updateResized();
            for (let idx = 0; idx < this.app.pageCount; idx++) {
                let page = <HTMLElement>this.docWrapper.children[idx];
                page.style.height = `${this.currentPageHeight}px`;
                page.style.width = `${this.currentPageWidth}px`;
                page.style.marginTop = `${this.currentDocMargin}px`;
                page.style.marginBottom = `${this.currentDocMargin}px`;
                // This is the SVG content of the page
                if (page.firstChild && page.firstChild) {
                    (<Element>page.firstChild).setAttribute(`height`, `${this.currentPageHeight}px`);
                    (<Element>page.firstChild).setAttribute(`width`, `${this.currentPageWidth}px`);
                }
            }
        }
        else {
            // With canvas have to just reload everything but without redoing the layout
            await this.updateLoadData(false);
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    async renderPage(pageIndex): Promise<any> {
        const svg: string = await this.verovio.renderToSVG(pageIndex);
        const page: Element = this.docWrapper.children[pageIndex - 1];

        // SVG
        if (this.app.options.documentViewSVG) {
            const scaleSvg = this.parseAndScaleSVG(svg, this.currentPageHeight, this.currentPageWidth);
            this.docWrapper.children[pageIndex - 1].appendChild(scaleSvg);


            // With SVG we need to prune the document
            clearTimeout(this.pruning);
            const timerThis = this;
            this.pruning = setTimeout(function () {
                timerThis.pruneDocument();
            }, 200);

        }

        // Canvas
        else {
            const canvas: HTMLCanvasElement = <HTMLCanvasElement>page.firstElementChild;
            const ctx = canvas.getContext("2d");
            const domURL = self.URL || self.webkitURL;
            const img = new Image();

            const svgBlob = new Blob([`${svg}`], { type: "image/svg+xml" });
            const svgUrl = domURL.createObjectURL(svgBlob);

            const originalHeight = this.app.verovioOptions.pageHeight;
            const originalWidth = this.app.verovioOptions.pageWidth;
            canvas.height = this.currentPageHeight;
            canvas.width = this.currentPageWidth;

            img.onload = function () {
                ctx.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, canvas.width, canvas.height);
            };

            img.src = svgUrl;
        }
    }

    handleObserver(entries: Array<IntersectionObserverEntry>, observer: DocumentViewObserver): void {
        // Load page and update first and last page if necessary
        for (let entry of entries) {
            if (entry.isIntersecting) {
                observer.view.loadPage(<HTMLElement>entry.target);
                // Already load the next page (null if none)
                observer.view.loadPage(<HTMLElement>entry.target.nextSibling);
                // Keep the lastPageLoaded for pruning
                observer.lastPageIn = parseInt((<HTMLElement>entry.target).dataset.page);
            }
        }
    }

    loadPage(pageElement: HTMLElement): void {
        // This happens when loading the next page of the last page
        if (pageElement === null) return;

        if (!pageElement.dataset.loaded) {
            // Mark it as loaded so we do not trigger it again
            pageElement.dataset.loaded = "true";
            this.renderPage(pageElement.dataset.page);
        }
    }

    pruneDocument(): void {
        for (let idx = 0; idx < this.app.pageCount; idx++) {
            let page = <HTMLElement>this.docWrapper.children[idx];
            if (idx < this.observer.lastPageIn - this.observer.pruningMargin) {
                delete page.dataset.loaded;
                page.innerHTML = '';
            }
            if (idx > this.observer.lastPageIn + this.observer.pruningMargin) {
                delete page.dataset.loaded;
                page.innerHTML = '';
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

}
