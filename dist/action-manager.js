var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventManager } from './event-manager.js';
class Call {
    constructor(method, args) {
        this.method = method;
        this.args = args;
    }
}
export class ActionManager {
    constructor(view) {
        // EditorView object
        this.view = view;
        this.cursorPointer = view.cursorPointer;
        this.verovio = view.verovio;
        this.eventManager = new EventManager(this);
        this.inProgress = false;
        this.delayedCalls = [];
    }
    ////////////////////////////////////////////////////////////////////////
    // Delayed calls
    ////////////////////////////////////////////////////////////////////////
    callDelayedCalls() {
        return __awaiter(this, void 0, void 0, function* () {
            //console.debug( this.delayedCalls.length );
            if (this.delayedCalls.length > 0) {
                const call = this.delayedCalls[0];
                this.delayedCalls.shift();
                yield call.method.apply(this, call.args);
            }
            else {
                yield this.commit();
            }
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Generic methods
    ////////////////////////////////////////////////////////////////////////
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.inProgress = true;
            const editorAction = { action: 'commit' };
            yield this.view.verovio.edit(editorAction);
            // WIP disable redo layout
            //await this.view.verovio.redoLayout();
            this.view.app.pageCount = yield this.view.verovio.getPageCount();
            if (this.view.currentPage > this.view.app.pageCount) {
                this.view.currentPage = this.view.app.pageCount;
            }
            yield this.view.renderPage(true);
            // WIP disable udpateMEI
            //this.view.updateMEI();
            this.inProgress = false;
            // Check that nothing was added in-between
            if (this.delayedCalls.length > 0) {
                yield this.callDelayedCalls();
            }
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            let chain = new Array();
            for (const item of this.cursorPointer.selectedItems) {
                if (!["note"].includes(item.elementType))
                    continue;
                chain.push({
                    action: 'delete',
                    param: {
                        elementId: item.elementId
                    }
                });
            }
            if (chain.length === 0)
                return;
            chain.push({ action: 'commit' });
            const editorAction = {
                action: 'chain',
                param: chain
            };
            yield this.view.verovio.edit(editorAction);
            yield this.view.verovio.redoLayout();
            yield this.view.renderPage(true);
            this.view.updateMEI();
        });
    }
    drag(x, y) {
        return __awaiter(this, void 0, void 0, function* () {
            let chain = new Array();
            for (const item of this.cursorPointer.selectedItems) {
                if (!["note"].includes(item.elementType))
                    continue;
                const editorAction = {
                    action: 'drag',
                    param: {
                        elementId: item.elementId,
                        x: item.elementX + x,
                        y: item.elementY + y
                    }
                };
                chain.push(editorAction);
            }
            if (chain.length === 0)
                return;
            const editorAction = {
                action: 'chain',
                param: chain
            };
            yield this.view.verovio.edit(editorAction);
            yield this.view.verovio.redoPagePitchPosLayout();
            yield this.view.renderPage(true, false);
        });
    }
    keyDown(key, shiftKey, ctrlKey) {
        var arguments_1 = arguments;
        return __awaiter(this, void 0, void 0, function* () {
            // keyDown events can 
            if (this.inProgress) {
                this.delayedCalls.push(new Call(this.keyDown, arguments_1));
                return;
            }
            this.inProgress = true;
            let chain = new Array();
            for (const item of this.cursorPointer.selectedItems) {
                if (!["note"].includes(item.elementType))
                    continue;
                const editorAction = {
                    action: 'keyDown',
                    param: {
                        elementId: item.elementId,
                        key: key,
                        shiftKey: shiftKey,
                        ctrlKey: ctrlKey
                    }
                };
                chain.push(editorAction);
            }
            if (chain.length === 0) {
                this.inProgress = false;
                return;
            }
            const editorAction = {
                action: 'chain',
                param: chain
            };
            yield this.view.verovio.edit(editorAction);
            // WIP disable redo layout
            //await this.view.verovio.redoPagePitchPosLayout();
            //await this.view.renderPage(true, false);
            this.inProgress = false;
            yield this.callDelayedCalls();
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Element specific methods
    ////////////////////////////////////////////////////////////////////////
    insertNote(x, y) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cursorPointer.inputMode)
                return;
            let chain = new Array();
            chain.push({
                action: 'insert',
                param: {
                    elementType: "note",
                    startid: this.cursorPointer.elementId
                }
            });
            chain.push({
                action: 'drag',
                param: {
                    elementId: "[chained-id]",
                    x: x,
                    y: y
                }
            });
            chain.push({ action: 'commit' });
            //console.debug( chain );
            const editorAction = {
                action: 'chain',
                param: chain
            };
            yield this.view.verovio.edit(editorAction);
            yield this.view.verovio.redoLayout();
            yield this.view.renderPage(true);
            this.view.updateMEI();
        });
    }
    formCres() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setAttrValue("form", "cres", ["hairpin"]);
        });
    }
    formDim() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setAttrValue("form", "dim", ["hairpin"]);
        });
    }
    placeAbove() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setAttrValue("place", "above", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
        });
    }
    placeBelow() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setAttrValue("place", "below", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
        });
    }
    placeAuto() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setAttrValue("place", "", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
        });
    }
    stemDirUp() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setAttrValue("stem.dir", "up", ["note", "chord"]);
        });
    }
    stemDirDown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setAttrValue("stem.dir", "down", ["note", "chord"]);
        });
    }
    stemDirAuto() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setAttrValue("stem.dir", "", ["note", "chord"]);
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            const editorAction = {
                action: 'commit'
            };
            yield this.view.verovio.edit(editorAction);
            yield this.view.updateLoadData();
            this.view.updateMEI();
        });
    }
    // helper
    setAttrValue(attribute_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (attribute, value, elementTypes = []) {
            let chain = new Array();
            for (const item of this.cursorPointer.selectedItems) {
                if (elementTypes.length > 0 && !elementTypes.includes(item.elementType))
                    continue;
                const editorAction = {
                    action: 'set',
                    param: {
                        elementId: item.elementId,
                        attribute: attribute,
                        value: value
                    }
                };
                chain.push(editorAction);
            }
            if (chain.length === 0)
                return;
            chain.push({ action: 'commit' });
            const editorAction = {
                action: 'chain',
                param: chain
            };
            yield this.view.verovio.edit(editorAction);
            // WIP disable redo layout
            //await this.view.verovio.redoLayout();
            yield this.view.renderPage(true);
            this.view.updateMEI();
        });
    }
}
//# sourceMappingURL=action-manager.js.map