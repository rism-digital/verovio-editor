/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from '../js/app.js';
import { EditorToolbar } from './editor-toolbar.js';
import { EditorView } from './editor-view.js';
import { EventManager } from './event-manager.js';
import { GenericView } from './generic-view.js';
import { RNGLoader } from './rng-loader.js';
import { ValidatorWorkerProxy, VerovioWorkerProxy } from './worker-proxy.js';
import { XMLEditorView } from './xml-editor-view.js';

import { elt } from '../js/utils/functions.js';
import { appendDivTo } from './utils/functions.js';

export class EditorPanel extends GenericView
{
    app: App;
    verovio: VerovioWorkerProxy;
    validator: ValidatorWorkerProxy;
    rngLoader: RNGLoader;
    eventManager: EventManager;
    editorToolbar: EditorToolbar;

    draggingSplitter: boolean;
    draggingX: number;
    draggingY: number;
    splitterX: number;
    splitterY: number;
    splitterSize: number;
    resizeTimer: number;

    toolbar: HTMLDivElement;
    hsplit: HTMLDivElement;
    toolpanel: HTMLDivElement;
    split: HTMLDivElement;
    editor: HTMLDivElement;
    splitter: HTMLDivElement;
    xmlEditor: HTMLDivElement;

    editorView: EditorView;
    xmlEditorView: XMLEditorView;
    boundMouseMove: { (event: MouseEvent): void };
    boundMouseUp: { (event: MouseEvent): void };

    constructor( div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy, validator: ValidatorWorkerProxy, rngLoader: RNGLoader )
    {
        super( div, app );

        this.verovio = verovio;
        this.validator = validator;
        this.rngLoader = rngLoader;

        this.eventManager = new EventManager( this );

        this.toolbar = appendDivTo( this.element, { class: `vrv-editor-toolbar` } );
        this.editorToolbar = new EditorToolbar( this.toolbar, this.app, this );
        this.customEventManager.addToPropagationList( this.editorToolbar.customEventManager );

        this.hsplit = appendDivTo( this.element, { class: `vrv-hsplit` } );
        this.toolpanel = appendDivTo( this.hsplit, { class: `vrv-editor-toolpanel` } );

        this.split = appendDivTo( this.hsplit, { class: `vrv-split` } );
        let orientation = ( this.app.options.editorSplitterHorizontal ) ? "vertical" : "horizontal";
        this.split.classList.add( orientation );

        this.editor = appendDivTo( this.split, { class: `vrv-view`, style: `` } );
        this.editorView = new EditorView( this.editor, this.app, this.verovio );
        this.customEventManager.addToPropagationList( this.editorView.customEventManager );
        this.editorToolbar.bindEvents( this.editorView.actionManager );

        this.splitter = appendDivTo( this.split, { class: `` } );
        this.eventManager.bind( this.splitter, 'mousedown', this.onDragInit );
        this.boundMouseMove = ( e: MouseEvent ) => this.onDragMove( e );
        this.boundMouseUp = ( e: MouseEvent ) => this.onDragUp( e );

        this.draggingSplitter = false;
        this.draggingX = 0; // Stores x & y coordinates of the mouse pointer
        this.draggingY = 0;
        this.splitterX = 0; // Stores top, left values (edge) of the element
        this.splitterY = 0;

        this.xmlEditor = appendDivTo( this.split, { class: `vrv-xml` } );

        this.xmlEditorView = new XMLEditorView( this.xmlEditor, this.app, this.validator, this.rngLoader );
        this.xmlEditorView.CMeditor.options.hintOptions.schemaInfo = this.rngLoader.tags;
        this.customEventManager.addToPropagationList( this.xmlEditorView.customEventManager );

        this.splitterSize = 60;
        this.resizeTimer;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateSplitterSize(): void
    {
        if ( this.app.options.editorSplitterHorizontal )
        {
            const height = this.split.clientHeight;
            const editorHeight = this.editor.clientHeight;
            this.splitterSize = Math.round( editorHeight * 100 / height );
        }
        else
        {
            const width = this.split.clientWidth;
            const editorWidth = this.editor.clientWidth;
            this.splitterSize = Math.round( editorWidth * 100 / width );
        }
    }

    updateSize(): boolean
    {
        this.element.style.height = this.element.parentElement.style.height;
        this.element.style.width = this.element.parentElement.style.width;

        // Force the toolbar to be displayed when re-activate because the it does not have received the event yet
        this.toolbar.style.display = 'block';
        let height = this.element.clientHeight - this.toolbar.offsetHeight;
        let width = this.element.clientWidth - this.toolpanel.offsetWidth;

        this.split.style.height = `${ height }px`;
        this.split.style.width = `${ width }px`;

        this.xmlEditor.style.display = 'block';
        this.splitter.style.display = 'block';

        if ( !this.app.options.editorSplitterShow )
        {
            // Ideally we would send a onActive / onDeactiveate event
            this.xmlEditor.style.display = 'none';
            this.xmlEditor.style.height = `0px`;
            this.xmlEditor.style.width = `0px`;
            this.splitter.style.display = 'none';
            this.editor.style.height = `${ height }px`;
            this.editor.style.width = `${ width }px`;
        }
        else if ( this.app.options.editorSplitterHorizontal )
        {
            let editorHeight = Math.floor( height * this.splitterSize / 100 );
            // 10 is the bottom border of the editor view
            let xmlHeight = Math.ceil( ( height * ( 100 - this.splitterSize ) / 100 ) - 10 );

            this.editor.style.height = `${ editorHeight }px`;
            this.editor.style.width = `${ width }px`;

            this.xmlEditor.style.height = `${ xmlHeight }px`;
            this.xmlEditor.style.width = `${ width }px`;

            this.element.style.height = this.element.parentElement.style.height;
            this.element.style.width = this.element.parentElement.style.width;
        }
        else
        {
            let editorWidth = Math.floor( width * this.splitterSize / 100 );
            // 10 is the bottom border of the editor view
            let xmlWidth = Math.ceil( ( width * ( 100 - this.splitterSize ) / 100 ) - 10 );

            this.editor.style.height = `${ height }px`;
            this.editor.style.width = `${ editorWidth }px`;

            this.xmlEditor.style.height = `${ height }px`;
            this.xmlEditor.style.width = `${ xmlWidth }px`;
        }

        this.element.style.height = this.element.parentElement.style.height
        this.element.style.width = this.element.parentElement.style.width;

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate( e: CustomEvent ): boolean
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("EditorPanel::onActivate");

        this.updateSize();
    }

    onResized( e: CustomEvent ): boolean
    {
        if ( !super.onResized( e ) ) return false;
        //console.debug("EditorPanel::onResized");

        this.updateSize();
    }

    onUpdateView( e: CustomEvent ): boolean
    {
        if ( !super.onUpdateView( e ) ) return false;

        this.app.endLoading();
    }

    //////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    onDragInit( e: MouseEvent ): void
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

    onDragMove( e: MouseEvent ): void
    {
        if ( this.draggingSplitter === true )
        {
            if ( this.app.options.editorSplitterHorizontal )
            {
                const diffY = this.draggingY - e.clientY;
                const editorHeight = this.editor.clientHeight;
                const xmlHeight = this.xmlEditor.clientHeight;
                this.editor.style.height = `${ editorHeight - diffY }px`;
                this.xmlEditor.style.height = `${ xmlHeight + diffY }px`;
                this.draggingY = e.clientY;
            }
            else
            {
                const diffX = this.draggingX - e.clientX;
                const editorWidth = this.editor.clientWidth;
                const xmlWidth = this.xmlEditor.clientWidth;
                this.editor.style.width = `${ editorWidth - diffX }px`;
                this.xmlEditor.style.width = `${ xmlWidth + diffX }px`;
                this.draggingX = e.clientX;
            }
            // We can already update the xmlView size
            let event = new CustomEvent( 'onResized' );
            this.xmlEditorView.customEventManager.dispatch( event );

            // To update Verovio 
            //this.app.startLoading( "Ajusting size ...", true );
            //this.updateSplitterSize();
            //let event = new CustomEvent( 'onResized' );
            //this.editorView.customEventManager.dispatch( event );
        }
    }

    onDragUp( e: MouseEvent ): void
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

    onToggleOrientation(): void
    {
        this.app.options.editorSplitterHorizontal = !this.app.options.editorSplitterHorizontal;
        this.split.classList.toggle( "vertical" );
        this.split.classList.toggle( "horizontal" );
        this.app.startLoading( "Ajusting size ...", true );
        let event = new CustomEvent( 'onResized' );
        this.app.customEventManager.dispatch( event );
    }

    onToggle(): void
    {
        this.app.options.editorSplitterShow = !this.app.options.editorSplitterShow;
        this.app.startLoading( "Ajusting size ...", true );
        let event = new CustomEvent( 'onResized' );
        this.app.customEventManager.dispatch( event );
    }
}
