/**
 * The ResponsiveView class implements a dynamic rendering view fitting and adjusting to the view port.
 */

import { App } from './app.js'
import { EditorView } from './editor-view.js';
import { VerovioView } from './verovio-view.js';

import { VerovioWorkerProxy } from './worker-proxy.js';
import { appendDivTo } from './utils/functions.js';

export class ResponsiveView extends VerovioView {
    svgWrapper: HTMLDivElement;
    midiIds: Array<number>;

    constructor(div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy) {
        super(div, app, verovio)

        // initializes ui underneath the parent element, as well as Verovio communication
        this.svgWrapper = appendDivTo(this.element, { class: `vrv-svg-wrapper` });

        this.midiIds = [];
    }

    ////////////////////////////////////////////////////////////////////////
    // VerovioView update methods
    ////////////////////////////////////////////////////////////////////////

    override async updateView(update: VerovioView.Update, lightEndLoading = true): Promise<any> {
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
                await this.updateUpdateData();
                break;
            case (VerovioView.Update.Zoom):
                await this.updateZoom();
                break;
        }
        this.app.endLoading(lightEndLoading);
    }

    async updateActivate(): Promise<any> {
        this.app.verovioOptions.adjustPageHeight = true;
        this.app.verovioOptions.breaks = 'auto';
        this.app.verovioOptions.footer = 'none';
        this.app.verovioOptions.scale = this.currentScale;
        this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale);
        this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale);
        this.app.verovioOptions.justifyVertically = false;

        this.midiIds = [];

        if (this.app.verovioOptions.pageHeight !== 0) {
            await this.verovio.setOptions(this.app.verovioOptions);
        }
    }

    async updateLoadData(): Promise<any> {
        if (!(this instanceof EditorView)) {
            this.element.style.height = this.element.parentElement.style.height;
            this.element.style.width = this.element.parentElement.style.width;
        }

        if (this.ui && this.element && this.svgWrapper) {
            this.updateSVGDimensions();
            // Reset pageHeight and pageWidth to match the effective scaled viewport width
            this.app.verovioOptions.scale = this.currentScale;
            this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale);
            this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale);
            // Not sure why we need to remove the top margin from the calculation... to be investigated
            this.app.verovioOptions.pageHeight -= (this.app.verovioOptions.pageMarginTop) * (100 / this.app.verovioOptions.scale);

            if (this.app.verovioOptions.pageHeight !== 0) {
                await this.verovio.setOptions(this.app.verovioOptions);
            }
            if (this.app.pageCount > 0) {
                await this.verovio.setOptions(this.app.verovioOptions);
                await this.verovio.redoLayout(this.app.verovioOptions);
                this.app.pageCount = await this.verovio.getPageCount();
                if (this.currentPage > this.app.pageCount) {
                    this.currentPage = this.app.pageCount
                }
                await this.renderPage();
            }
        }
    }

    async updateResized(): Promise<any> {
        await this.updateLoadData();
    }

    async updateUpdateData(): Promise<any> {
        await this.verovio.loadData(this.app.mei);
        this.app.pageCount = await this.verovio.getPageCount();
        await this.updateLoadData();
    }

    async updateZoom(): Promise<any> {
        await this.updateLoadData();
    }

    async renderPage(lightEndLoading: boolean = false): Promise<any> {
        const svg = await this.verovio.renderToSVG(this.currentPage);
        this.svgWrapper.innerHTML = svg;

        if (lightEndLoading) this.app.endLoading(true);
    }

    async midiUpdate(time: number): Promise<any> {
        //const animateStart = document.getElementById( "highlighting-start" );

        let vrvTime = Math.max(0, time - 500);
        let elementsAtTime = await this.app.verovio.getElementsAtTime(vrvTime);
        if (Object.keys(elementsAtTime).length === 0 || elementsAtTime.page === 0) {
            //console.debug( "Nothing returned by getElementsAtTime" );
            return;
        }
        if (elementsAtTime.page != this.currentPage) {
            this.currentPage = elementsAtTime.page;
            this.app.startLoading("Loading content ...", true);
            let event = new CustomEvent('onPage');
            this.app.customEventManager.dispatch(event);
        }
        if ((elementsAtTime.notes.length > 0) && (this.midiIds != elementsAtTime.notes)) {
            //updatePageOrScrollTo(elementsAtTime.notes[0]);
            for (let i = 0, len = this.midiIds.length; i < len; i++) {
                let noteId = this.midiIds[i];
                if (elementsAtTime.notes.indexOf(noteId) === -1) {
                    let note = <SVGElement>this.svgWrapper.querySelector('#' + noteId);
                    if (note) note.style.filter = "";
                }
            };
            this.midiIds = elementsAtTime.notes;
            for (let i = 0, len = this.midiIds.length; i < len; i++) {
                let note = <SVGElement>this.svgWrapper.querySelector('#' + this.midiIds[i]);
                if (note) note.style.filter = "url(#highlighting)";
                //if ( note ) animateStart.beginElement();
            };
        }
    }

    async midiStop(): Promise<any> {
        for (let i = 0, len = this.midiIds.length; i < len; i++) {
            let note = <SVGElement>this.svgWrapper.querySelector('#' + this.midiIds[i]);
            if (note) note.style.filter = "";
        };
        this.midiIds = [];
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateSVGDimensions(): void {
        this.svgWrapper.style.height = this.element.style.height;
        this.svgWrapper.style.width = this.element.style.width;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onPage(e: CustomEvent): boolean {
        if (!super.onPage(e)) return false;
        //console.debug("ResponsiveView::onPage");

        this.renderPage(true);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////

    scrollListener(e: UIEvent): void {
        let element = (e.target as HTMLElement);
        this.svgWrapper.scrollTop = element.scrollTop;
        this.svgWrapper.scrollLeft = element.scrollLeft;
    }
}
