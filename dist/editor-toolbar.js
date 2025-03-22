/**
 * The EditorToolbar class is the implementation of the editor toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */
import { Toolbar } from './toolbar.js';
import { appendDivTo, appendSpanTo } from './utils/functions.js';
export class EditorToolbar extends Toolbar {
    constructor(div, app, panel) {
        let editorXml = `${app.host}/icons/toolbar/editor-xml.png`;
        let editorXmlValidate = `${app.host}/icons/toolbar/validate.png`;
        let editorXmlForce = `${app.host}/icons/toolbar/force.png`;
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
        this.xmlEditorEnable = appendDivTo(this.layoutControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorXml})` } });
        appendSpanTo(this.xmlEditorEnable, { class: `vrv-tooltip` }, "Open or close the XML editor");
        this.xmlEditorOrientation = appendDivTo(this.layoutControls, { class: `vrv-btn-icon-large` });
        appendSpanTo(this.xmlEditorOrientation, { class: `vrv-tooltip` }, "Change the divider orientation");
        this.xmlEditorValidate = appendDivTo(this.layoutControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorXmlValidate})` } });
        appendSpanTo(this.xmlEditorValidate, { class: `vrv-tooltip` }, "Validate and refresh rendering ('Shift-Ctrl-V')");
        this.xmlEditorForce = appendDivTo(this.layoutControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${editorXmlForce})` } });
        appendSpanTo(this.xmlEditorForce, { class: `vrv-tooltip` }, "By-pass XML validation and force reload");
        appendDivTo(this.element, { class: `vrv-h-separator` });
        this.notes = appendDivTo(this.element, { class: `vrv-btn-text`, 'data-before': `Notes` });
        appendDivTo(this.element, { class: `vrv-h-separator` });
        this.controlEvents = appendDivTo(this.element, { class: `vrv-btn-text`, 'data-before': `Control events` });
        // binding
        this.panel.eventManager.bind(this.xmlEditorEnable, 'click', this.panel.onToggle);
        this.panel.eventManager.bind(this.xmlEditorOrientation, 'click', this.panel.onToggleOrientation);
        this.eventManager.bind(this.xmlEditorValidate, 'click', this.onTriggerValidation);
        this.panel.eventManager.bind(this.xmlEditorForce, 'click', this.panel.onForceReload);
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
        let iconsLayoutV = `${this.app.host}/icons/toolbar/layout-v.png`;
        const isHorizontal = (this.app.options.editorSplitterHorizontal) ? true : false;
        const isToggled = this.panel.xmlEditorView.isEnabled() ? true : false;
        const isAutoMode = this.panel.xmlEditorView.isAutoMode() ? true : false;
        const isEdited = this.panel.xmlEditorView.isEdited() ? true : false;
        if (isHorizontal) {
            this.xmlEditorOrientation.style.backgroundImage = `url(${iconsLayoutV})`;
        }
        else {
            this.xmlEditorOrientation.style.backgroundImage = `url(${iconsLayoutH})`;
        }
        if (isToggled) {
            this.xmlEditorEnable.classList.add('toggled');
            this.xmlEditorValidate.style.display = (isAutoMode) ? 'none' : 'block';
            this.xmlEditorForce.style.display = 'block';
            this.xmlEditorOrientation.style.display = 'block';
        }
        else {
            this.xmlEditorEnable.classList.remove('toggled');
            this.xmlEditorValidate.style.display = 'none';
            this.xmlEditorForce.style.display = 'none';
            this.xmlEditorOrientation.style.display = 'none';
        }
        this.updateToolbarBtn(this.xmlEditorOrientation, isToggled);
        this.updateToolbarBtn(this.xmlEditorEnable, true);
        this.updateToolbarBtn(this.xmlEditorValidate, isToggled);
        this.updateToolbarBtn(this.xmlEditorForce, isEdited);
        /*
        this.updateToolbarToggleBtn(this.notes, (this.selectedElementType === "NOTES"));
        this.updateToolbarToggleBtn(this.controlEvents, (this.selectedElementType === "CONTROLEVENTS"));

        // Disable hairpin for now
        this.updateToolbarGrp(this.hairpinFormControls, false);
        //this.updateToolbarGrp( this.hairpinFormControls, ["CONTROLEVENTS", "hairpin"].includes( this.selectedElementType ) );
        this.updateToolbarGrp(this.controlEventControls, ["CONTROLEVENTS", "dir", "dynam", "hairpin", "tempo", "pedal"].includes(this.selectedElementType));
        this.updateToolbarGrp(this.stemControls, ["NOTES", "note", "chord"].includes(this.selectedElementType));
        */
        // Hide everything for now
        this.notes.style.display = 'none';
        this.controlEvents.style.display = 'none';
        this.controlEventControls.style.display = 'none';
        this.stemControls.style.display = 'none';
        this.hairpinFormControls.style.display = 'none';
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
        this.updateToolbarBtn(this.xmlEditorOrientation, false);
        this.updateToolbarBtn(this.xmlEditorEnable, false);
        this.updateToolbarBtn(this.xmlEditorValidate, false);
        this.updateToolbarBtn(this.xmlEditorForce, false);
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
    onTriggerValidation(e) {
        if (this.panel.xmlEditorView && this.panel.xmlEditorView.isEdited()) {
            this.panel.xmlEditorView.triggerValidation();
        }
    }
}
//# sourceMappingURL=editor-toolbar.js.map