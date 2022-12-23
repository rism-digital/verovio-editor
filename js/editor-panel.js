/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { GenericView } from './generic-view.js';
import { EditorToolbar } from './editor-toolbar.js';
import { EditorView } from './editor-view.js';
import { EventManager } from '../js-dist/event-manager.js';
import { XMLEditorView } from './xml-editor-view.js';

import { elt } from './utils/functions.js';

export class EditorPanel extends GenericView
{
    constructor( div, app, verovio, validator, rngLoader )
    {
        super( div, app );

        this.verovio = verovio;
        this.validator = validator;
        this.rngLoader = rngLoader;

        this.eventManager = new EventManager( this );

        this.ui.toolbar = elt( 'div', { class: `vrv-editor-toolbar` } );
        this.element.appendChild( this.ui.toolbar );
        this.toolbar = new EditorToolbar( this.ui.toolbar, this.app, this );
        this.customEventManager.addToPropagationList( this.toolbar.customEventManager );

        this.ui.hsplit = elt( 'div', { class: `vrv-hsplit` } );
        this.element.appendChild( this.ui.hsplit );

        this.ui.toolpanel = elt( 'div', { class: `vrv-editor-toolpanel` } );
        this.ui.hsplit.appendChild( this.ui.toolpanel );

        this.ui.split = elt( 'div', { class: `vrv-split` } );
        let orientation = ( this.app.options.editorSplitterHorizontal ) ? "vertical" : "horizontal";
        this.ui.split.classList.add( orientation );
        this.ui.hsplit.appendChild( this.ui.split );

        this.ui.editorView = elt( 'div', { class: `vrv-view`, style: `` } );
        this.ui.split.appendChild( this.ui.editorView );
        this.editorView = new EditorView( this.ui.editorView, this.app, this.verovio );
        this.customEventManager.addToPropagationList( this.editorView.customEventManager );
        this.toolbar.bindEvents( this.editorView.actionManager );

        this.ui.splitter = elt( 'div', { class: `` } );
        this.ui.split.appendChild( this.ui.splitter );
        this.eventManager.bind( this.ui.splitter, 'mousedown', this.onDragInit );
        this.boundMouseMove = ( e ) => this.onDragMove( e );
        this.boundMouseUp = ( e ) => this.onDragUp( e );

        this.draggingSplitter = false;
        this.draggingX = 0; // Stores x & y coordinates of the mouse pointer
        this.draggingY = 0;
        this.splitterX = 0; // Stores top, left values (edge) of the element
        this.splitterY = 0;

        this.ui.xmlView = elt( 'div', { class: `vrv-xml` } );
        this.ui.split.appendChild( this.ui.xmlView );

        this.xmlView = new XMLEditorView( this.ui.xmlView, this.app, this.validator, this.rngLoader );
        this.xmlView.CMeditor.options.hintOptions.schemaInfo = this.rngLoader.tags;
        this.customEventManager.addToPropagationList( this.xmlView.customEventManager );

        this.splitterSize = 60;
        this.resizeTimer;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateSplitterSize()
    {
        if ( this.app.options.editorSplitterHorizontal )
        {
            const height = this.ui.split.clientHeight;
            const editorHeight = this.ui.editorView.clientHeight;
            this.splitterSize = Math.round( editorHeight * 100 / height );
        }
        else
        {
            const width = this.ui.split.clientWidth;
            const editorWidth = this.ui.editorView.clientWidth;
            this.splitterSize = Math.round( editorWidth * 100 / width );
        }
    }

    updateSize()
    {
        this.element.style.height = this.element.parentElement.style.height;
        this.element.style.width = this.element.parentElement.style.width;

        // Force the toolbar to be displayed when re-activate because the it does not have received the event yet
        this.ui.toolbar.style.display = 'block';
        let height = this.element.clientHeight - this.ui.toolbar.offsetHeight;
        let width = this.element.clientWidth - this.ui.toolpanel.offsetWidth;

        this.ui.split.style.height = `${ height }px`;
        this.ui.split.style.width = `${ width }px`;

        this.ui.xmlView.style.display = 'block';
        this.ui.splitter.style.display = 'block';

        if ( !this.app.options.editorSplitterShow )
        {
            // Ideally we would send a onActive / onDeactiveate event
            this.ui.xmlView.style.display = 'none';
            this.ui.xmlView.style.height = `0px`;
            this.ui.xmlView.style.width = `0px`;
            this.ui.splitter.style.display = 'none';
            this.ui.editorView.style.height = `${ height }px`;
            this.ui.editorView.style.width = `${ width }px`;
        }
        else if ( this.app.options.editorSplitterHorizontal )
        {
            let editorHeight = Math.floor( height * this.splitterSize / 100 );
            // 10 is the bottom border of the editor view
            let xmlHeight = Math.ceil( ( height * ( 100 - this.splitterSize ) / 100 ) - 10 );

            this.ui.editorView.style.height = `${ editorHeight }px`;
            this.ui.editorView.style.width = `${ width }px`;

            this.ui.xmlView.style.height = `${ xmlHeight }px`;
            this.ui.xmlView.style.width = `${ width }px`;

            this.element.style.height = this.element.parentElement.style.height;
            this.element.style.width = this.element.parentElement.style.width;
        }
        else
        {
            let editorWidth = Math.floor( width * this.splitterSize / 100 );
            // 10 is the bottom border of the editor view
            let xmlWidth = Math.ceil( ( width * ( 100 - this.splitterSize ) / 100 ) - 10 );

            this.ui.editorView.style.height = `${ height }px`;
            this.ui.editorView.style.width = `${ editorWidth }px`;

            this.ui.xmlView.style.height = `${ height }px`;
            this.ui.xmlView.style.width = `${ xmlWidth }px`;
        }

        this.element.style.height = this.element.parentElement.style.height
        this.element.style.width = this.element.parentElement.style.width;

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate( e )
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("EditorPanel::onActivate");

        this.updateSize();
    }

    onResized( e )
    {
        if ( !super.onResized( e ) ) return false;
        //console.debug("EditorPanel::onResized");

        this.updateSize();
    }

    onUpdateView( e )
    {
        if ( !super.onUpdateView( e ) ) return false;

        this.app.endLoading();
    }

    //////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    onDragInit( e )
    {
        document.addEventListener( 'mousemove', this.boundMouseMove );
        document.addEventListener( 'mouseup', this.boundMouseUp );
        this.draggingX = e.clientX;
        this.draggingY = e.clientY;

        // Store the object of the element which needs to be moved
        this.draggingSplitter = true;
        this.splitterY = e.clientY;
        this.splitterX = e.clientX;
    }

    onDragMove( e )
    {
        if ( this.draggingSplitter === true )
        {
            if ( this.app.options.editorSplitterHorizontal )
            {
                const diffY = this.draggingY - e.clientY;
                const editorHeight = this.ui.editorView.clientHeight;
                const xmlHeight = this.ui.xmlView.clientHeight;
                this.ui.editorView.style.height = `${ editorHeight - diffY }px`;
                this.ui.xmlView.style.height = `${ xmlHeight + diffY }px`;
                this.draggingY = e.clientY;
            }
            else
            {
                const diffX = this.draggingX - e.clientX;
                const editorWidth = this.ui.editorView.clientWidth;
                const xmlWidth = this.ui.xmlView.clientWidth;
                this.ui.editorView.style.width = `${ editorWidth - diffX }px`;
                this.ui.xmlView.style.width = `${ xmlWidth + diffX }px`;
                this.draggingX = e.clientX;
            }
            // We can already update the xmlView size
            let event = new CustomEvent( 'onResized' );
            this.xmlView.customEventManager.dispatch( event );

            // To update Verovio 
            //this.app.startLoading( "Ajusting size ...", true );
            //this.updateSplitterSize();
            //let event = new CustomEvent( 'onResized' );
            //this.editorView.customEventManager.dispatch( event );
        }
    }

    onDragUp( e )
    {
        this.draggingSplitter = false;
        // Remove listeners
        document.removeEventListener( 'mousemove', this.boundMouseMove );
        document.removeEventListener( 'mouseup', this.boundMouseUp );
        // Update the splitter postion and resize all
        this.app.startLoading( "Ajusting size ...", true );
        this.updateSplitterSize();
        let event = new CustomEvent( 'onResized' );
        this.customEventManager.dispatch( event );
    }

    onToggleOrientation()
    {
        this.app.options.editorSplitterHorizontal = !this.app.options.editorSplitterHorizontal;
        this.ui.split.classList.toggle( "vertical" );
        this.ui.split.classList.toggle( "horizontal" );
        this.app.startLoading( "Ajusting size ...", true );
        let event = new CustomEvent( 'onResized' );
        this.app.customEventManager.dispatch( event );
    }

    onToggle()
    {
        this.app.options.editorSplitterShow = !this.app.options.editorSplitterShow;
        this.app.startLoading( "Ajusting size ...", true );
        let event = new CustomEvent( 'onResized' );
        this.app.customEventManager.dispatch( event );
    }

}
