/**
 * The ResponsiveView class implements a dynamic rendering view fitting and adjusting to the view port.
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
import { EditorView } from './editor-view.js';
import { VerovioView } from './verovio-view.js';
import { appendDivTo } from './utils/functions.js';
export class ResponsiveView extends VerovioView {
    constructor(div, app, verovio) {
        super(div, app, verovio);
        // initializes ui underneath the parent element, as well as Verovio communication
        this.svgWrapper = appendDivTo(this.element, { class: `vrv-svg-wrapper` });
        this.midiIds = [];
    }
    ////////////////////////////////////////////////////////////////////////
    // VerovioView update methods
    ////////////////////////////////////////////////////////////////////////
    updateView(update_1) {
        return __awaiter(this, arguments, void 0, function* (update, lightEndLoading = true) {
            switch (update) {
                case (VerovioView.Update.Activate):
                    yield this.updateActivate();
                    break;
                case (VerovioView.Update.LoadData):
                    yield this.updateLoadData();
                    break;
                case (VerovioView.Update.Resized):
                    yield this.updateResized();
                    break;
                case (VerovioView.Update.Update):
                    yield this.updateUpdateData();
                    break;
                case (VerovioView.Update.Zoom):
                    yield this.updateZoom();
                    break;
            }
            this.app.endLoading(lightEndLoading);
        });
    }
    updateActivate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.app.verovioOptions.adjustPageHeight = true;
            this.app.verovioOptions.breaks = 'auto';
            this.app.verovioOptions.footer = 'none';
            this.app.verovioOptions.scale = this.currentScale;
            this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale);
            this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale);
            this.app.verovioOptions.justifyVertically = false;
            this.app.midiPlayer.view = this;
            this.midiIds = [];
            if (this.app.verovioOptions.pageHeight !== 0) {
                yield this.verovio.setOptions(this.app.verovioOptions);
            }
        });
    }
    updateLoadData() {
        return __awaiter(this, void 0, void 0, function* () {
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
                    yield this.verovio.setOptions(this.app.verovioOptions);
                }
                if (this.app.pageCount > 0) {
                    yield this.verovio.setOptions(this.app.verovioOptions);
                    yield this.verovio.redoLayout(this.app.verovioOptions);
                    this.app.pageCount = yield this.verovio.getPageCount();
                    if (this.currentPage > this.app.pageCount) {
                        this.currentPage = this.app.pageCount;
                    }
                    yield this.renderPage();
                }
            }
        });
    }
    updateResized() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLoadData();
        });
    }
    updateUpdateData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verovio.loadData(this.app.mei);
            this.app.pageCount = yield this.verovio.getPageCount();
            yield this.updateLoadData();
        });
    }
    updateZoom() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLoadData();
        });
    }
    renderPage() {
        return __awaiter(this, arguments, void 0, function* (lightEndLoading = false) {
            const svg = yield this.verovio.renderToSVG(this.currentPage);
            this.svgWrapper.innerHTML = svg;
            if (lightEndLoading)
                this.app.endLoading(true);
        });
    }
    midiUpdate(time) {
        return __awaiter(this, void 0, void 0, function* () {
            //const animateStart = document.getElementById( "highlighting-start" );
            let vrvTime = Math.max(0, time - 500);
            let elementsAtTime = yield this.app.verovio.getElementsAtTime(vrvTime);
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
                        let note = this.svgWrapper.querySelector('#' + noteId);
                        if (note)
                            note.style.filter = "";
                    }
                }
                ;
                this.midiIds = elementsAtTime.notes;
                for (let i = 0, len = this.midiIds.length; i < len; i++) {
                    let note = this.svgWrapper.querySelector('#' + this.midiIds[i]);
                    if (note)
                        note.style.filter = "url(#highlighting)";
                    //if ( note ) animateStart.beginElement();
                }
                ;
            }
        });
    }
    midiStop() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0, len = this.midiIds.length; i < len; i++) {
                let note = this.svgWrapper.querySelector('#' + this.midiIds[i]);
                if (note)
                    note.style.filter = "";
            }
            ;
            this.midiIds = [];
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    updateSVGDimensions() {
        this.svgWrapper.style.height = this.element.style.height;
        this.svgWrapper.style.width = this.element.style.width;
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onPage(e) {
        if (!super.onPage(e))
            return false;
        //console.debug("ResponsiveView::onPage");
        this.renderPage(true);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////
    scrollListener(e) {
        let element = e.target;
        this.svgWrapper.scrollTop = element.scrollTop;
        this.svgWrapper.scrollLeft = element.scrollLeft;
    }
}
//# sourceMappingURL=responsive-view.js.map