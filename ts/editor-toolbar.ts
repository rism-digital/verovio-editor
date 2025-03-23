/**
 * The EditorToolbar class is the implementation of the editor toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */

import { ActionManager } from './action-manager.js';
import { App } from './app.js';
import { EditorPanel } from './editor-panel.js';
import { Toolbar } from './toolbar.js';

import { appendDivTo, appendSpanTo } from './utils/functions.js';

export class EditorToolbar extends Toolbar {
    app: App;
    panel: EditorPanel;
    selectedElementType: string;

    layoutControls: HTMLDivElement;
    xmlEditorEnable: HTMLDivElement;
    xmlEditorOrientation: HTMLDivElement;
    xmlEditorValidate: HTMLDivElement;
    xmlEditorForce: HTMLDivElement;
    notes: HTMLDivElement;
    controlEvents: HTMLDivElement;

    controlEventControls: HTMLDivElement;
    placeAbove: HTMLDivElement;
    placeBelow: HTMLDivElement;
    placeAuto: HTMLDivElement;

    hairpinFormControls: HTMLDivElement;
    formCres: HTMLDivElement;
    formDim: HTMLDivElement;

    stemControls: HTMLDivElement;
    stemDirUp: HTMLDivElement;
    stemDirDown: HTMLDivElement;
    stemDirAuto: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App, panel: EditorPanel) {
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

    updateAll(): void {
        let iconsLayoutH = `${this.app.host}/icons/toolbar/layout-h.png`;
        let iconsLayoutV = `${this.app.host}/icons/toolbar/layout-v.png`;

        const isHorizontal = (this.app.options.editorSplitterHorizontal) ? true : false;
        const isToggled = this.panel.xmlEditorView.isEnabled() ? true : false;
        const isAutoMode = this.panel.xmlEditorView.isAutoMode() ? true : false;
        const isEdited = this.panel.xmlEditorView.isEdited() ? true : false;
        if (isHorizontal) {
            this.xmlEditorOrientation.style.backgroundImage = `url(${iconsLayoutV})`
        }
        else {
            this.xmlEditorOrientation.style.backgroundImage = `url(${iconsLayoutH})`
        }
        // update toggled status
        this.updateToolbarBtnToggled(this.xmlEditorEnable, isToggled);
        // update display
        this.updateToolbarBtnDisplay(this.xmlEditorOrientation, isToggled);
        this.updateToolbarBtnDisplay(this.xmlEditorValidate, (isToggled && !isAutoMode));
        this.updateToolbarBtnDisplay(this.xmlEditorForce, isToggled);
        // update enabled status
        this.updateToolbarBtnEnabled(this.xmlEditorEnable, true);
        this.updateToolbarBtnEnabled(this.xmlEditorOrientation, isToggled);
        this.updateToolbarBtnEnabled(this.xmlEditorValidate, isToggled);
        this.updateToolbarBtnEnabled(this.xmlEditorForce, isEdited);

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

    bindEvents(actionManager: ActionManager): void {
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

    override onActivate(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        //console.debug("EditorToolbar::onActivate");

        this.updateAll();

        return true;
    }

    override onEndLoading(e: CustomEvent): boolean {
        if (!super.onEndLoading(e)) return false;
        //console.debug("EditorToolbar::onEndLoading");

        this.updateAll();

        return true;
    }

    override onSelect(e: CustomEvent): boolean {
        if (!super.onSelect(e)) return false;
        //console.debug("EditorToolbar::onSelect");

        this.selectedElementType = e.detail.elementType;
        this.updateAll();

        return true;
    }

    override onStartLoading(e: CustomEvent): boolean {
        if (!super.onStartLoading(e)) return false;
        //console.debug("EditorToolbar:onStartLoading");

        this.updateToolbarBtnEnabled(this.xmlEditorOrientation, false);
        this.updateToolbarBtnEnabled(this.xmlEditorEnable, false);
        this.updateToolbarBtnEnabled(this.xmlEditorValidate, false);
        this.updateToolbarBtnEnabled(this.xmlEditorForce, false);

        return true;
    }

    override onUpdateView(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        //console.debug("EditorToolbar::onUpdate");

        this.updateAll();

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    onNotes(e: Event): void {
        this.selectedElementType = "NOTES";
        this.updateAll();
    }

    onControlEvents(e: Event): void {
        this.selectedElementType = "CONTROLEVENTS";
        this.updateAll();
    }

    onTriggerValidation(e: Event): void {
        if (this.panel.xmlEditorView && this.panel.xmlEditorView.isEdited()) {
            this.panel.xmlEditorView.triggerValidation();
        }
    }
}