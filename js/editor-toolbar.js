/**
 * The EditorToolbar class is the implementation of the editor toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */

import { Toolbar } from '../js-dist/toolbar.js' ; 

import { elt } from './utils/functions.js';

export class EditorToolbar extends Toolbar
{
    constructor( div, app, panel )
    {        
        let editorStemDirUp =  '/icons/editor/stem-dir-up.png' ; 
        let editorStemDirDown =  '/icons/editor/stem-dir-down.png' ; 
        let editorStemDirAuto =  '/icons/editor/stem-dir-auto.png' ; 
        let editorPlaceBelow =  '/icons/editor/place-below.png' ; 
        let editorPlaceAuto =  '/icons/editor/place-auto.png' ; 
        let editorPlaceAbove =  '/icons/editor/place-above.png' ; 
        let editorFormDim =  '/icons/editor/form-dim.png' ; 
        let editorFormCres =  '/icons/editor/form-cres.png' ; 


        super( div, app );

        this.panel = panel;

        this.active = true;

        this.selectedElementType = null;

        // sub-toolbar in application 
        this.ui.layoutControls = elt( 'div', { class: `vrv-btn-group` } );
        // this.app.toolbar.ui.editorSubToolbar.appendChild( this.ui.layoutControls );
        this.element.appendChild( this.ui.layoutControls );
        //
        this.ui.layoutControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.ui.panelOrientation = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.layoutControls.appendChild( this.ui.panelOrientation );
        this.ui.panelShow = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.layoutControls.appendChild( this.ui.panelShow );
        //
        //this.app.toolbar.ui.editorSubToolbar.appendChild( elt( 'div', { class: `vrv-h-separator` } ) )
        this.element.appendChild( elt( 'div', { class: `vrv-h-separator` } ) )
        this.ui.notes = elt( 'div', { class: `vrv-btn-text` } );
        this.ui.notes.setAttribute( "data-before", "Notes" );
        //this.app.toolbar.ui.editorSubToolbar.appendChild( this.ui.notes );
        this.element.appendChild( this.ui.notes );

        //this.app.toolbar.ui.editorSubToolbar.appendChild( elt( 'div', { class: `vrv-h-separator` } ) )
        this.element.appendChild( elt( 'div', { class: `vrv-h-separator` } ) )
        this.ui.controlEvents = elt( 'div', { class: `vrv-btn-text` } );
        this.ui.controlEvents.setAttribute( "data-before", "Control events" );
        //this.app.toolbar.ui.editorSubToolbar.appendChild( this.ui.controlEvents );
        this.element.appendChild( this.ui.controlEvents );


        // binding
        this.panel.eventManager.bind( this.ui.panelOrientation, 'click', this.panel.onToggleOrientation );
        this.panel.eventManager.bind( this.ui.panelShow, 'click', this.panel.onToggle );
        this.eventManager.bind( this.ui.notes, 'click', this.onNotes );
        this.eventManager.bind( this.ui.controlEvents, 'click', this.onControlEvents );

        // conroleEventControls
        this.ui.controlEventControls = elt( 'div', { class: `vrv-btn-group` } );
        this.element.appendChild( this.ui.controlEventControls );
        this.ui.controlEventControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.ui.placeAbove = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.placeAbove.style.backgroundImage = `url(${ editorPlaceAbove })`;
        this.ui.controlEventControls.appendChild( this.ui.placeAbove );
        this.ui.placeBelow = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.placeBelow.style.backgroundImage = `url(${ editorPlaceBelow })`;
        this.ui.controlEventControls.appendChild( this.ui.placeBelow );
        this.ui.placeAuto = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.placeAuto.style.backgroundImage = `url(${ editorPlaceAuto })`;
        this.ui.controlEventControls.appendChild( this.ui.placeAuto );

        // hairpinFormControls
        this.ui.hairpinFormControls = elt( 'div', { class: `vrv-btn-group` } );
        this.element.appendChild( this.ui.hairpinFormControls );
        this.ui.hairpinFormControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.ui.formCres = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.formCres.style.backgroundImage = `url(${ editorFormCres })`;
        this.ui.hairpinFormControls.appendChild( this.ui.formCres );
        this.ui.formDim = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.formDim.style.backgroundImage = `url(${ editorFormDim })`;
        this.ui.hairpinFormControls.appendChild( this.ui.formDim );

        // stemControls
        this.ui.stemControls = elt( 'div', { class: `vrv-btn-group` } );
        this.element.appendChild( this.ui.stemControls );
        this.ui.stemControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.ui.stemDirUp = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.stemDirUp.style.backgroundImage = `url(${ editorStemDirUp })`;
        this.ui.stemControls.appendChild( this.ui.stemDirUp );
        this.ui.stemDirDown = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.stemDirDown.style.backgroundImage = `url(${ editorStemDirDown })`;
        this.ui.stemControls.appendChild( this.ui.stemDirDown );
        this.ui.stemDirAuto = elt( 'div', { class: `vrv-btn-icon-large` } );
        this.ui.stemDirAuto.style.backgroundImage = `url(${ editorStemDirAuto })`;
        this.ui.stemControls.appendChild( this.ui.stemDirAuto );
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateAll()
    {
        let iconsLayoutH =  '/icons/toolbar/layout-h.png' ; 
        let iconsLayoutToggle =  '/icons/toolbar/layout-toggle.png' ; 
        let iconsLayoutToggleV =  '/icons/toolbar/layout-toggle-v.png' ; 
        let iconsLayoutUnToggle =  '/icons/toolbar/layout-un-toggle.png' ; 
        let iconsLayoutUnToggleV =  '/icons/toolbar/layout-un-toggle-v.png' ; 
        let iconsLayoutV =  '/icons/toolbar/layout-v.png' ; 

        let toggleOrientation = ( this.app.options.editorSplitterHorizontal ) ? true : false;
        let toggle = ( this.app.options.editorSplitterShow ) ? true : false;
        if ( toggleOrientation )
        {
            this.ui.panelOrientation.style.backgroundImage = `url(${ iconsLayoutV })`
            this.ui.panelShow.style.backgroundImage = toggle ? `url(${ iconsLayoutUnToggle })` : `url(${ iconsLayoutToggle })`;
        }
        else
        {
            this.ui.panelOrientation.style.backgroundImage = `url(${ iconsLayoutH })`
            this.ui.panelShow.style.backgroundImage = toggle ? `url(${ iconsLayoutUnToggleV })` : `url(${ iconsLayoutToggleV })`;
        }
        this.updateToolbarBtn( this.ui.panelOrientation, toggle );
        this.updateToolbarBtn( this.ui.panelShow, true );

        this.updateToolbarToggleBtn( this.ui.notes, ( this.selectedElementType === "NOTES" ) );
        this.updateToolbarToggleBtn( this.ui.controlEvents, ( this.selectedElementType === "CONTROLEVENTS" ) );

        // Disable hairpin for now
        this.updateToolbarGrp( this.ui.hairpinFormControls, false );
        //this.updateToolbarGrp( this.ui.hairpinFormControls, ["CONTROLEVENTS", "hairpin"].includes( this.selectedElementType ) );
        this.updateToolbarGrp( this.ui.controlEventControls, ["CONTROLEVENTS", "dir", "dynam", "hairpin", "tempo", "pedal"].includes( this.selectedElementType ) );
        this.updateToolbarGrp( this.ui.stemControls, ["NOTES", "note", "chord"].includes( this.selectedElementType ) );
    }

    bindEvents( actionManager )
    {
        actionManager.eventManager.bind( this.ui.formCres, 'click', actionManager.formCres );
        actionManager.eventManager.bind( this.ui.formDim, 'click', actionManager.formDim );

        actionManager.eventManager.bind( this.ui.placeAbove, 'click', actionManager.placeAbove );
        actionManager.eventManager.bind( this.ui.placeBelow, 'click', actionManager.placeBelow );
        actionManager.eventManager.bind( this.ui.placeAuto, 'click', actionManager.placeAuto );

        actionManager.eventManager.bind( this.ui.stemDirUp, 'click', actionManager.stemDirUp );
        actionManager.eventManager.bind( this.ui.stemDirDown, 'click', actionManager.stemDirDown );
        actionManager.eventManager.bind( this.ui.stemDirAuto, 'click', actionManager.stemDirAuto );
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate( e )
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("EditorToolbar::onActivate");

        this.updateAll();

        return true;
    }

    onEndLoading( e )
    {
        if ( !super.onEndLoading( e ) ) return false;
        //console.debug("EditorToolbar::onEndLoading");

        this.updateAll();

        return true;
    }

    onSelect( e )
    {
        if ( !super.onSelect( e ) ) return false;
        //console.debug("EditorToolbar::onSelect");

        this.selectedElementType = e.detail.elementType;
        this.updateAll();

        return true;
    }

    onStartLoading( e )
    {
        if ( !super.onStartLoading( e ) ) return false;
        //console.debug("EditorToolbar:onStartLoading");

        this.updateToolbarBtn( this.ui.panelOrientation, false );
        this.updateToolbarBtn( this.ui.panelShow, false );

        return true;
    }

    onUpdateView( e )
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("EditorToolbar::onUpdate");

        this.updateAll();

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    onNotes( e )
    {
        this.selectedElementType = "NOTES";
        this.updateAll();
    }

    onControlEvents( e )
    {
        this.selectedElementType = "CONTROLEVENTS";
        this.updateAll();
    }
}
