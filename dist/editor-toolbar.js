/**
 * The EditorToolbar class is the implementation of the editor toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */
import { Toolbar } from './toolbar.js';
import { appendDivTo } from './utils/functions.js';
export class EditorToolbar extends Toolbar {
    constructor(div, app, panel) {
        let editorStemDirUp = `${app.host}/icons/editor/stem-dir-up.png`;
        let editorStemDirDown = `${app.host}/icons/editor/stem-dir-down.png`;
        let editorStemDirAuto = `${app.host}/icons/editor/stem-dir-auto.png`;
        let editorPlaceBelow = `${app.host}/icons/editor/place-below.png`;
        let editorPlaceAuto = `${app.host}/icons/editor/place-auto.png`;
        let editorPlaceAbove = `${app.host}/icons/editor/place-above.png`;
        let editorFormDim = `${app.host}/icons/editor/form-dim.png`;
        let editorFormCres = `${app.host}/icons/editor/form-cres.png`;
        super(div, app);
        this.panel = panel;
        this.active = true;
        this.selectedElementType = null;
        // sub-toolbar in application 
        this.layoutControls = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.layoutControls, { class: `vrv-h-separator` });
        this.panelShow = appendDivTo(this.layoutControls, { class: `vrv-btn-icon-large` });
        this.panelOrientation = appendDivTo(this.layoutControls, { class: `vrv-btn-icon-large` });
        appendDivTo(this.element, { class: `vrv-h-separator` });
        this.notes = appendDivTo(this.element, { class: `vrv-btn-text`, 'data-before': `Notes` });
        appendDivTo(this.element, { class: `vrv-h-separator` });
        this.controlEvents = appendDivTo(this.element, { class: `vrv-btn-text`, 'data-before': `Control events` });
        // binding
        this.panel.eventManager.bind(this.panelShow, 'click', this.panel.onToggle);
        this.panel.eventManager.bind(this.panelOrientation, 'click', this.panel.onToggleOrientation);
        this.eventManager.bind(this.notes, 'click', this.onNotes);
        this.eventManager.bind(this.controlEvents, 'click', this.onControlEvents);
        // controlEventControls
        this.controlEventControls = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.controlEventControls, { class: `vrv-h-separator` });
        this.placeAbove = appendDivTo(this.controlEventControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorPlaceAbove})` } });
        this.placeBelow = appendDivTo(this.controlEventControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorPlaceBelow})` } });
        this.placeAuto = appendDivTo(this.controlEventControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorPlaceAuto})` } });
        // hairpinFormControls
        this.hairpinFormControls = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.hairpinFormControls, { class: `vrv-h-separator` });
        this.formCres = appendDivTo(this.hairpinFormControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorFormCres})` } });
        this.formDim = appendDivTo(this.hairpinFormControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorFormDim})` } });
        // stemControls
        this.stemControls = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.stemControls, { class: `vrv-h-separator` });
        this.stemDirUp = appendDivTo(this.stemControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorStemDirUp})` } });
        this.stemDirDown = appendDivTo(this.stemControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorStemDirDown})` } });
        this.stemDirAuto = appendDivTo(this.stemControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorStemDirAuto})` } });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    updateAll() {
        let iconsLayoutH = `${this.app.host}/icons/toolbar/layout-h.png`;
        let iconsEditorXML = `${this.app.host}/icons/toolbar/editor-xml.png`;
        let iconsLayoutV = `${this.app.host}/icons/toolbar/layout-v.png`;
        this.panelShow.style.backgroundImage = `url(${iconsEditorXML})`;
        let toggleOrientation = (this.app.options.editorSplitterHorizontal) ? true : false;
        let toggle = this.panel.xmlEditorView.isEnabled() ? true : false;
        if (toggleOrientation) {
            this.panelOrientation.style.backgroundImage = `url(${iconsLayoutV})`;
        }
        else {
            this.panelOrientation.style.backgroundImage = `url(${iconsLayoutH})`;
        }
        if (toggle) {
            this.panelShow.classList.add('toggled');
            this.panelOrientation.style.display = 'block';
        }
        else {
            this.panelShow.classList.remove('toggled');
            this.panelOrientation.style.display = 'none';
        }
        this.updateToolbarBtn(this.panelOrientation, toggle);
        this.updateToolbarBtn(this.panelShow, true);
        this.updateToolbarToggleBtn(this.notes, (this.selectedElementType === "NOTES"));
        this.updateToolbarToggleBtn(this.controlEvents, (this.selectedElementType === "CONTROLEVENTS"));
        // Disable hairpin for now
        this.updateToolbarGrp(this.hairpinFormControls, false);
        //this.updateToolbarGrp( this.ui.hairpinFormControls, ["CONTROLEVENTS", "hairpin"].includes( this.selectedElementType ) );
        this.updateToolbarGrp(this.controlEventControls, ["CONTROLEVENTS", "dir", "dynam", "hairpin", "tempo", "pedal"].includes(this.selectedElementType));
        this.updateToolbarGrp(this.stemControls, ["NOTES", "note", "chord"].includes(this.selectedElementType));
    }
    bindEvents(actionManager) {
        actionManager.eventManager.bind(this.formCres, 'click', actionManager.formCres);
        actionManager.eventManager.bind(this.formDim, 'click', actionManager.formDim);
        actionManager.eventManager.bind(this.placeAbove, 'click', actionManager.placeAbove);
        actionManager.eventManager.bind(this.placeBelow, 'click', actionManager.placeBelow);
        actionManager.eventManager.bind(this.placeAuto, 'click', actionManager.placeAuto);
        actionManager.eventManager.bind(this.stemDirUp, 'click', actionManager.stemDirUp);
        actionManager.eventManager.bind(this.stemDirDown, 'click', actionManager.stemDirDown);
        actionManager.eventManager.bind(this.stemDirAuto, 'click', actionManager.stemDirAuto);
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("EditorToolbar::onActivate");
        this.updateAll();
        return true;
    }
    onEndLoading(e) {
        if (!super.onEndLoading(e))
            return false;
        //console.debug("EditorToolbar::onEndLoading");
        this.updateAll();
        return true;
    }
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        //console.debug("EditorToolbar::onSelect");
        this.selectedElementType = e.detail.elementType;
        this.updateAll();
        return true;
    }
    onStartLoading(e) {
        if (!super.onStartLoading(e))
            return false;
        //console.debug("EditorToolbar:onStartLoading");
        this.updateToolbarBtn(this.panelOrientation, false);
        this.updateToolbarBtn(this.panelShow, false);
        return true;
    }
    onUpdateView(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("EditorToolbar::onUpdate");
        this.updateAll();
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    onNotes(e) {
        this.selectedElementType = "NOTES";
        this.updateAll();
    }
    onControlEvents(e) {
        this.selectedElementType = "CONTROLEVENTS";
        this.updateAll();
    }
}
//# sourceMappingURL=editor-toolbar.js.map