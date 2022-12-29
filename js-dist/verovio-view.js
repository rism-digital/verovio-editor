/**
 * The VerovioView class is the based class for other view implementation featuring Verovio rendering.
 * It should not be instanciated directly but only through inherited classes.
 * The VerovioView is attached to a VerovioMessenger.
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
import { GenericView } from './generic-view.js';
import { EventManager } from './event-manager.js';
export class VerovioView extends GenericView {
    constructor(div, app, verovio) {
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
    destroy() {
        this.eventManager.unbindAll();
        //this.events.unsubscribeAll();
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchmove', this.boundMouseMove);
        document.removeEventListener('touchend', this.boundMouseUp);
        super.destroy();
    }
    parseAndScaleSVG(svgString, height, width) {
        const parser = new DOMParser();
        const svg = parser.parseFromString(svgString, "text/xml");
        svg.firstElementChild.setAttribute(`height`, `${height}px`);
        svg.firstElementChild.setAttribute(`width`, `${width}px`);
        return svg.firstChild;
    }
    // Necessary for how ES6 "this" works inside events
    bindListeners() {
        this.boundKeyDown = (e) => this.keyDownListener(e);
        this.boundMouseMove = (e) => this.mouseMoveListener(e);
        this.boundMouseUp = (e) => this.mouseUpListener(e);
        this.boundResize = (e) => this.resizeComponents(e);
    }
    updateView(update, lightEndLoading = true) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug("View::updateView should be overwritten");
            console.debug(update);
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("VerovioView::onActivate");
        this.updateView(VerovioViewUpdate.Activate);
        // This occurs when switching views
        if (e.detail && e.detail.loadData) {
            this.updateView(VerovioViewUpdate.LoadData, false);
        }
        return true;
    }
    onLoadData(e) {
        if (!super.onLoadData(e))
            return false;
        //console.debug("VerovioView::onLoadData");
        this.updateView(VerovioViewUpdate.LoadData, false);
        return true;
    }
    onResized(e) {
        if (!super.onResized(e))
            return false;
        //console.debug("VerovioView::onResized");
        this.updateView(VerovioViewUpdate.Resized);
        return true;
    }
    onUpdateData(e) {
        if (!super.onUpdateData(e))
            return false;
        //console.debug("VerovioView::onUpdateData");
        this.updateView(VerovioViewUpdate.Update);
        return true;
    }
    onZoom(e) {
        if (!super.onZoom(e))
            return false;
        //console.debug("VerovioView::onZoom");
        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
        this.updateView(VerovioViewUpdate.Zoom);
        return true;
    }
}
export var VerovioViewUpdate;
(function (VerovioViewUpdate) {
    VerovioViewUpdate[VerovioViewUpdate["Activate"] = 0] = "Activate";
    VerovioViewUpdate[VerovioViewUpdate["LoadData"] = 1] = "LoadData";
    VerovioViewUpdate[VerovioViewUpdate["Resized"] = 2] = "Resized";
    VerovioViewUpdate[VerovioViewUpdate["Update"] = 3] = "Update";
    VerovioViewUpdate[VerovioViewUpdate["Zoom"] = 4] = "Zoom";
})(VerovioViewUpdate || (VerovioViewUpdate = {}));
;
