/**
 * The VerovioView class is the based class for other view implementation featuring Verovio rendering.
 * It should not be instantiated directly but only through inherited classes.
 * The VerovioView is attached to a VerovioMessenger.
 */

import { App } from './app.js';
import { GenericView } from './generic-view.js';
import { EventManager } from './event-manager.js';
import { VerovioWorkerProxy } from './worker-proxy.js';

export class VerovioView extends GenericView {
    app: App;
    verovio: VerovioWorkerProxy;
    eventManager: EventManager;
    currentId: string;
    currentPage: number;
    currentZoomIndex: number;
    currentScale: number;

    boundMouseMove: { (event: MouseEvent): void };
    boundMouseUp: { (event: MouseEvent): void };
    boundKeyDown: { (event: KeyboardEvent): void };
    boundResize: { (event: Event): void };

    constructor(div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy) {
        super(div, app);

        // VerovioMessenger object
        this.verovio = verovio;

        // One of the little quirks of writing in ES6, bind events
        this.eventManager = new EventManager(this);
        this.bindListeners(); // Document/Window-scoped events

        // Common members
        this.currentId = null;
        this.currentPage = 1;
        this.currentZoomIndex = this.app.currentZoomIndex;
        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
    }

    // Called to unsubscribe from all events. Probably a good idea to call this if the object is deleted.
    destroy(): void {
        this.eventManager.unbindAll();

        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchmove', this.boundMouseMove);
        document.removeEventListener('touchend', this.boundMouseUp);

        super.destroy()
    }

    parseAndScaleSVG(svgString: string, height: number, width: number): Node {
        const parser = new DOMParser();
        const svg: XMLDocument = parser.parseFromString(svgString, "text/xml");
        svg.firstElementChild.setAttribute(`height`, `${height}px`);
        svg.firstElementChild.setAttribute(`width`, `${width}px`);
        return svg.firstChild;
    }

    // Necessary for how ES6 "this" works inside events
    bindListeners(): void {
        this.boundKeyDown = (e: KeyboardEvent) => this.keyDownListener(e);
        this.boundMouseMove = (e: MouseEvent) => this.mouseMoveListener(e);
        this.boundMouseUp = (e: MouseEvent) => this.mouseUpListener(e);
        this.boundResize = (e: Event) => this.resizeComponents(e);
    }

    async updateView(update: VerovioView.Update, lightEndLoading: boolean = true): Promise<any> {
        console.debug("View::updateView should be overwritten");
        console.debug(update);
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onActivate(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        //console.debug("VerovioView::onActivate");

        this.updateView(VerovioView.Update.Activate);

        // This occurs when switching views
        if (e.detail && e.detail.loadData) {
            this.updateView(VerovioView.Update.LoadData, false);
        }

        return true;
    }

    override onLoadData(e: CustomEvent): boolean {
        if (!super.onLoadData(e)) return false;
        //console.debug("VerovioView::onLoadData");

        this.updateView(VerovioView.Update.LoadData, false);

        return true;
    }

    override onResized(e: CustomEvent): boolean {
        if (!super.onResized(e)) return false;
        //console.debug("VerovioView::onResized");

        this.updateView(VerovioView.Update.Resized);

        return true;
    }

    override onUpdateData(e: CustomEvent): boolean {
        if (!super.onUpdateData(e)) return false;
        //console.debug("VerovioView::onUpdateData");

        this.updateView(VerovioView.Update.Update);

        return true;
    }

    override onZoom(e: CustomEvent): boolean {
        if (!super.onZoom(e)) return false;
        //console.debug("VerovioView::onZoom");

        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];

        this.updateView(VerovioView.Update.Zoom);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////

    keyDownListener(e: KeyboardEvent): void { }

    mouseMoveListener(e: MouseEvent): void { }

    mouseUpListener(e: MouseEvent): void { }

    resizeComponents(e: Event): void { }
}

////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////

export namespace VerovioView {

    export enum Update {
        Activate,
        LoadData,
        Resized,
        Update,
        Zoom
    };

    export interface Options {
        adjustPageHeight?: boolean;
        breaks?: string;
        footer?: string;
        justifyVertically?: boolean;
        pageHeight: number;
        pageWidth: number;
        pageMarginLeft: number;
        pageMarginRight: number;
        pageMarginTop: number;
        pageMarginBottom: number;
        scale: number;
        xmlIdSeed: number;
    }
};
