/**
 * The DocumentView class implements a continuous document-like view of the MEI.
 * Rendering can be either in SVG or Canvas
 * For browser supporting it an IntersectionObserver is used to lazy-load the rendering of the pages.
 * When SVG rendering is use, a limited number of pages it keep in the DOM.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { VerovioView, VerovioViewUpdate } from './verovio-view.js';
import { appendCanvasTo, appendDivTo } from './utils/functions.js';
class DocumentViewObserver extends IntersectionObserver {
    constructor(callback, view, options) {
        super(callback, options);
        this.pruningMargin = 10;
        this.lastPageIn = 0;
        this.view = view;
    }
}
export class DocumentView extends VerovioView {
    constructor(div, app, verovio) {
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
    updateView(update, lightEndLoading = true) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (update) {
                case (VerovioViewUpdate.Activate):
                    yield this.updateActivate();
                    break;
                case (VerovioViewUpdate.LoadData):
                    yield this.updateLoadData();
                    break;
                case (VerovioViewUpdate.Resized):
                    yield this.updateResized();
                    break;
                case (VerovioViewUpdate.Zoom):
                    yield this.updateZoom();
                    break;
            }
            this.app.endLoading(lightEndLoading);
        });
    }
    updateActivate() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.docWrapper.firstChild) {
                this.docWrapper.firstChild.remove();
            }
            this.app.settings.adjustPageHeight = false;
            this.app.settings.breaks = 'encoded';
            this.app.settings.footer = 'auto';
            this.app.settings.scale = 100;
            this.app.settings.pageHeight = 2970;
            this.app.settings.pageWidth = 2100;
            this.app.settings.justifyVertically = true;
        });
    }
    updateLoadData(redoLayout = true) {
        return __awaiter(this, void 0, void 0, function* () {
            // We do not need to redo the layout when changing zoom with canvas
            if (redoLayout) {
                yield this.verovio.setOptions(this.app.settings);
                yield this.verovio.redoLayout();
                const pageCount = yield this.verovio.getPageCount();
                this.app.pageCount = pageCount;
            }
            while (this.docWrapper.firstChild) {
                this.docWrapper.firstChild.remove();
            }
            yield this.updateResized();
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
        });
    }
    updateResized() {
        return __awaiter(this, void 0, void 0, function* () {
            this.element.style.height = this.element.parentElement.style.height;
            this.element.style.width = this.element.parentElement.style.width;
            if (this.ui && this.docWrapper) {
                this.currentDocMargin = this.app.options.documentViewMargin * this.currentScale / 100;
                this.currentPageWidth = this.app.settings.pageWidth * this.currentScale / 100;
                const docWidth = this.currentPageWidth + 2 * this.currentDocMargin + 2 * this.app.options.documentViewPageBorder;
                const elementWidth = parseInt(this.element.parentElement.style.width, 10);
                this.currentDocWidth = Math.max(elementWidth, docWidth);
                this.docWrapper.style.width = `${this.currentDocWidth}px`;
                this.currentPageHeight = this.app.settings.pageHeight * this.currentScale / 100;
                const docHeight = (this.currentPageHeight + this.currentDocMargin + 2 * this.app.options.documentViewPageBorder) * this.app.pageCount + this.currentDocMargin;
                const elementHeight = parseInt(this.element.parentElement.style.height, 10);
                this.currentDocHeight = Math.max(elementHeight, docHeight);
                this.docWrapper.style.height = `${this.currentDocHeight}px`;
            }
        });
    }
    updateZoom() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.app.options.documentViewSVG) {
                yield this.updateResized();
                for (let idx = 0; idx < this.app.pageCount; idx++) {
                    let page = this.docWrapper.children[idx];
                    page.style.height = `${this.currentPageHeight}px`;
                    page.style.width = `${this.currentPageWidth}px`;
                    page.style.marginTop = `${this.currentDocMargin}px`;
                    page.style.marginBottom = `${this.currentDocMargin}px`;
                    // This is the SVG content of the page
                    if (page.firstChild && page.firstChild) {
                        page.firstChild.setAttribute(`height`, `${this.currentPageHeight}px`);
                        page.firstChild.setAttribute(`width`, `${this.currentPageWidth}px`);
                    }
                }
            }
            else {
                // With canvas have to just reload everything but without redoing the layout
                yield this.updateLoadData(false);
            }
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    renderPage(pageIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const svg = yield this.verovio.renderToSVG(pageIndex);
            const page = this.docWrapper.children[pageIndex - 1];
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
                const canvas = page.firstElementChild;
                const ctx = canvas.getContext("2d");
                const DOMURL = self.URL || self.webkitURL;
                const img = new Image();
                const svgBlob = new Blob([`${svg}`], { type: "image/svg+xml" });
                const svgUrl = DOMURL.createObjectURL(svgBlob);
                const originalHeight = this.app.settings.pageHeight;
                const originalWidth = this.app.settings.pageWidth;
                canvas.height = this.currentPageHeight;
                canvas.width = this.currentPageWidth;
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, canvas.width, canvas.height);
                };
                img.src = svgUrl;
            }
        });
    }
    handleObserver(entries, observer) {
        // Load page and update first and last page if necessary
        for (let entry of entries) {
            if (entry.isIntersecting) {
                observer.view.loadPage(entry.target);
                // Already load the next page (null if none)
                observer.view.loadPage(entry.target.nextSibling);
                // Keep the lastPageLoaded for pruning
                observer.lastPageIn = parseInt(entry.target.dataset.page);
            }
        }
    }
    loadPage(pageElement) {
        // This happens when loading the next page of the last page
        if (pageElement === null)
            return;
        if (!pageElement.dataset.loaded) {
            // Mark it as loaded so we do not trigger it again
            pageElement.dataset.loaded = "true";
            this.renderPage(pageElement.dataset.page);
        }
    }
    pruneDocument() {
        for (let idx = 0; idx < this.app.pageCount; idx++) {
            let page = this.docWrapper.children[idx];
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
}
