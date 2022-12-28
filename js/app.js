/**
 * The App class is the main class of the application.
 * It requires a HTMLDivElement to be put on.
 */

const version = "1.0.0";

import { AppToolbar } from '../js-dist/app-toolbar.js';
import { AppStatusbar } from '../js-dist/app-statusbar.js';
import { Dialog } from './dialog.js'
import { DialogGhExport } from './dialog-gh-export.js';
import { DialogGhImport } from './dialog-gh-import.js';
import { DocumentView } from './document-view.js';
import { CustomEventManager } from './custom-event-manager.js';
import { EditorPanel } from './editor-panel.js';
import { EventManager } from '../js-dist/event-manager.js';
import { FileStack } from './file-stack.js';
import { GitHubManager } from './github-manager.js';
import { MidiPlayer } from './midi-player.js';
import { MidiToolbar } from './midi-toolbar.js';
import { PDFGenerator } from './pdf-generator.js';
import { ResponsiveView } from './responsive-view.js';
import { RNGLoader } from './rng-loader.js';
import { WorkerProxy } from '../js-dist/worker-proxy.js'

import { elt } from './utils/functions.js';

let filter = '/svg/filter.xml';

const marked = window.marked;

const aboutMsg = `The Verovio Editor is an experimental online MEI editor prototype. It is based on [Verovio](https://www.verovio.org) and can be connected to [GitHub](https://github.com)\n\nVersion: ${ version}`
const resetMsg = `This will reset all default options, reset the default file, remove all previous files, and reload the application.\n\nDo you want to proceed?`

export class App
{
    constructor( div, opts )
    {
        this.clientId = "fd81068a15354a300522";
        this.host = "https://editor.verovio.org";

        this.githubManager = new GitHubManager( this );

        this.options = Object.assign( {
            // The margin around page in docuementView
            documentViewMargin: 100,
            // The border for pages in documentView
            documentViewPageBorder: 1,
            // SVG rendering instead of Canvas
            documentViewSVG: true,
            documentZoom: 3,

            responsiveZoom: 4,

            editorSplitterHorizontal: true,
            editorSplitterShow: true,
            editorZoom: 4,

            enableDocument: true,
            enableEditor: true,
            enableResponsive: true,
            enableStatusbar: true,

            // The default schema (latest MEI release by default)
            schema: 'https://music-encoding.org/schema/4.0.1/mei-all.rng',

            defaultView: 'responsive',
        }, opts );

        if ( opts.reset ) window.localStorage.removeItem( "options" );

        const storedOptions = localStorage.getItem( "options" );
        if ( storedOptions )
        {
            this.options = Object.assign( this.options, JSON.parse( storedOptions ) );
        }

        this.fileStack = new FileStack();
        if ( opts.reset ) this.fileStack.reset();

        // Root element in which verovio-ui is created
        if ( !div || !( div instanceof HTMLDivElement ) )
        {
            throw "All App objects must be initialized with a 'element' parameter that is a HTMLDivElement element.";
        }

        this.element = div;

        this.zoomLevels = [5, 10, 20, 35, 75, 100, 150, 200];

        // If necessary remove all the children of the div
        while ( this.element.firstChild )
        {
            this.element.firstChild.remove();
        }

        document.head.appendChild( elt( 'link', { href: `/css/verovio.css`, rel: `stylesheet` } ) );

        this.loadingCount = 0;
        this.eventManager = new EventManager( this );
        this.customEventManager = new CustomEventManager( {} );

        this.ui = {};
        this.toolbar = null;

        // Create and load the SVG filter
        this.createFilter();

        // Create input for reading files
        this.ui.fileInput = elt( 'input', { type: `file`, class: `vrv-file-input` } );
        this.element.appendChild( this.ui.fileInput );
        this.ui.fileInput.onchange = this.fileInput.bind( this );

        // Create link for writing files
        this.ui.fileOutput = elt( 'a', { class: `vrv-file-output` } );
        this.element.appendChild( this.ui.fileOutput );

        // Create link for copying files
        this.ui.fileCopy = elt( 'textarea', { class: `vrv-file-copy` } );
        this.element.appendChild( this.ui.fileCopy );

        // Create the HTML content
        this.ui.wrapper = elt( 'div', { class: `vrv-wrapper` } );
        this.element.appendChild( this.ui.wrapper );

        // Create notification div
        this.ui.notification = elt( 'div', { class: `vrv-notification disabled` } );
        this.ui.wrapper.appendChild( this.ui.notification );

        // Create a dialog div
        this.ui.dialog = elt( 'div', { class: `vrv-dialog` } );
        this.ui.wrapper.appendChild( this.ui.dialog );

        // Create a toolbar div
        this.ui.toolbar = elt( 'div', { class: `vrv-toolbar` } );
        this.ui.wrapper.appendChild( this.ui.toolbar );

        // Views
        this.ui.views = elt( 'div', { class: `vrv-views` } );
        this.ui.wrapper.appendChild( this.ui.views );

        // Loader
        this.ui.loader = elt( 'div', { class: `vrv-loading` } );
        this.ui.views.appendChild( this.ui.loader );
        this.ui.loader.text = elt( 'div', { class: `vrv-loading-text` } );
        this.ui.loader.appendChild( this.ui.loader.text );

        // Status bar
        this.ui.statusbar = elt( 'div', { class: `vrv-statusbar` } );
        this.ui.wrapper.appendChild( this.ui.statusbar );
        if ( !this.options.enableStatusbar )
        {
            this.ui.statusbar.style.minHeight = '0px';
        }

        // PDF object - will be created only if necessay
        this.pdf = null;
        const pdfWorker =  new Worker( '/js/pdf-worker.js' );
        this.pdf = new WorkerProxy( pdfWorker );
        //this.generatePDF();

        // VerovioMessenger object
        this.verovio = null;

        // Validator object
        this.validator = null;

        // Handling the resizing of the window
        this.resizeTimer; // Used to prevent per-pixel re-render events when the window is resized
        window.onresize = this.onResize.bind( this );

        window.onbeforeunload = this.onBeforeUnload.bind( this );
        //window.addEventListener("beforeunload", this.onBeforeUnload);

        this.customEventManager.bind( this, 'onResized', this.onResized );
        let event = new CustomEvent( 'onResized' );
        this.customEventManager.dispatch( event );

        const verovioWorker = new Worker( '/js/verovio-worker.js' );
        this.verovio = new WorkerProxy( verovioWorker );

        this.settings =
        {
            pageHeight: 2970,
            pageWidth: 2100,
            pageMarginLeft: 50,
            pageMarginRight: 50,
            pageMarginTop: 50,
            pageMarginBottom: 50,
            scale: 100,
            xmlIdSeed: 1
        };

        this.pageCount = 0;
        this.currentZoomIndex = 4;

        const validatorWorker = new Worker( '/js/validator-worker.js' )
        this.validator = new WorkerProxy( validatorWorker );

        this.rngLoader = new RNGLoader();

        // Set to true when everything is loaded
        this.appIsLoaded = false;
        // Use to avoid saving config when resetting the app
        this.appReset = false;

        this.mei = "";
        this.filename = "untitled.xml";
        const last = this.fileStack.getLast();
        if ( last )
        {
            console.log( "Reloading", last.filename );
            this.loadData( last.data, last.filename );
        }

        // Listen and wait for Module to emit onRuntimeInitialized
        this.startLoading( "Loading Verovio ..." );

        this.verovio.onRuntimeInitialized().then( async () =>
        {
            const version = await this.verovio.getVersion();
            console.log( version );

            this.endLoading();
            this.startLoading( "Loading the XML validator ..." );

            this.midiPlayer = new MidiPlayer();

            // Listen and wait for Module to emit onRuntimeInitialized
            this.validator.onRuntimeInitialized().then( async () =>
            {
                this.currentSchema = this.options.schema;
                const response = await fetch( this.currentSchema );
                const data = await response.text();
                const res = await this.validator.setRelaxNGSchema( data );
                console.log( "Schema loaded", res );
                this.rngLoader.setRelaxNGSchema( data );

                this.createToolbar();
                this.createViews();
                this.createStatusbar();

                this.customEventManager.bind( this, 'onResized', this.onResized );
                let event = new CustomEvent( 'onResized' );
                this.customEventManager.dispatch( event );

                this.appIsLoaded = true;
                this.endLoading();

                if ( this.mei )
                {
                    this.loadMEI();
                }
            } );
        } );
    }

    destroy()
    {
        this.eventManager.unbindAll();
        this.events.unsubscribeAll();
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    createViews()
    {
        this.startLoading( "Loading the views ..." );

        this.view = null;
        this.toolbarView = null;

        if ( this.options.enableDocument )
        {
            this.currentZoomIndex = this.options.documentZoom;
            this.ui.view1 = elt( 'div', { class: `vrv-view` } );
            this.ui.views.appendChild( this.ui.view1 );
            this.viewDocument = new DocumentView( this.ui.view1, this, this.verovio, this.options );
            this.customEventManager.addToPropagationList( this.viewDocument.customEventManager );
            if ( this.options.defaultView === 'document' )
            {
                this.view = this.viewDocument;
                this.toolbarView = this.viewDocument;
            }
        }
        if ( this.options.enableEditor )
        {
            this.currentZoomIndex = this.options.editorZoom;
            this.ui.view2 = elt( 'div', { class: `vrv-view` } );
            this.ui.views.appendChild( this.ui.view2 );
            this.viewEditor = new EditorPanel( this.ui.view2, this, this.verovio, this.validator, this.rngLoader, this.options );
            this.customEventManager.addToPropagationList( this.viewEditor.customEventManager );
            if ( this.options.defaultView === 'editor' )
            {
                this.view = this.viewEditor;
                this.toolbarView = this.viewEditor.editorView;
            }
        }
        if ( this.options.enableResponsive )
        {
            this.currentZoomIndex = this.options.responsiveZoom;
            this.ui.view3 = elt( 'div', { class: `vrv-view` } );
            this.ui.views.appendChild( this.ui.view3 );
            this.viewResponsive = new ResponsiveView( this.ui.view3, this, this.verovio, this.options );
            this.customEventManager.addToPropagationList( this.viewResponsive.customEventManager );
            if ( this.options.defaultView === 'responsive' )
            {
                this.view = this.viewResponsive;
                this.toolbarView = this.viewResponsive;
            }
            // midi player in responsive view only
            this.midiPlayer.view = this.viewResponsive;
        }

        // Root element in which verovio-ui is created
        if ( !this.view )
        {
            throw `No view enabled or unknown default view '${ this.options.defaultView }' selected.`;
        }

        this.endLoading();

        let eventActivate = new CustomEvent( 'onActivate' );
        this.view.customEventManager.dispatch( eventActivate );

        //let eventResized = new CustomEvent( 'onResized' );
        //this.customEventManager.dispatch( eventResized );
    }

    createToolbar()
    {
        this.toolbar = new AppToolbar( this.ui.toolbar, this );
        this.customEventManager.addToPropagationList( this.toolbar.customEventManager );

        this.midiToolbar = new MidiToolbar( this.ui.toolbar, this, this.midiPlayer );
        this.customEventManager.addToPropagationList( this.midiToolbar.customEventManager );
    }

    createStatusbar()
    {
        if ( !this.options.enableStatusbar ) return;

        this.statusbar = new AppStatusbar( this.ui.statusbar, this, this.options );
        this.customEventManager.addToPropagationList( this.statusbar.customEventManager );
    }

    createFilter()
    {
        const filterDiv = elt( 'div', { class: `vrv-filter` } );
        this.element.appendChild( filterDiv );

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if ( this.readyState == 4 && this.status == 200 )
            {
                filterDiv.appendChild( this.responseXML.documentElement );
            }
        };
        xhttp.open("GET", filter, true);
        xhttp.send();
    }

    loadData( mei, filename = "untitled.xml", convert = false, onlyIfEmpty = false )
    {
        if ( this.mei.length != 0 )
        {
            // This is useful for loading the app with a default file but not if one exists
            if ( onlyIfEmpty ) return;

            this.fileStack.store( this.filename, this.mei );
            if (this.toolbar !== null) this.toolbar.updateRecent();
        }
        this.mei = mei;
        this.filename = filename;
        if ( this.appIsLoaded )
        {
            this.loadMEI( convert );
        }
    }

    startLoading( msg, light = false )
    {
        if ( light )
        {
            this.ui.views.style.pointerEvents = 'none';
            //this.ui.views.style.opacity = '0.6';
        }
        else
        {
            this.ui.views.style.overflow = 'hidden';
            this.ui.loader.style.display = `flex`;
            this.loadingCount++;
        }
        this.ui.loader.text.innerHTML = msg;
        let event = new CustomEvent( 'onStartLoading', {
            detail: {
                light: light,
                msg: msg
            }
        } );
        this.customEventManager.dispatch( event );
    }

    endLoading( light = false )
    {
        if ( !light )
        {
            this.loadingCount--;
            if ( this.loadingCount < 0 ) console.error( "endLoading index corrupted" );
        }

        // We have other tasks being performed
        if ( this.loadingCount > 0 ) return;

        this.ui.views.style.overflow = 'scroll';
        this.ui.loader.style.display = 'none';
        this.ui.views.style.pointerEvents = '';
        this.ui.views.style.opacity = '';
        let event = new CustomEvent( 'onEndLoading' );
        this.customEventManager.dispatch( event );
    }

    showNotification( message )
    {
        this.ui.notification.innerHTML = message;
        this.ui.notification.classList.remove( "disabled" );

        const notification = this.ui.notification;
        setTimeout( function ()
        {
            notification.classList.add( "disabled" );
        }, 2500 );
    }

    ////////////////////////////////////////////////////////////////////////
    // Async methods
    ////////////////////////////////////////////////////////////////////////

    async loadMEI( convert )
    {
        this.startLoading( "Loading the MEI data ..." );

        await this.verovio.loadData( this.mei );
        this.pageCount = await this.verovio.getPageCount();

        if ( convert )
        {
            this.mei = await this.verovio.getMEI( {} );
        }

        await this.checkSchema();

        let event = new CustomEvent( 'onLoadData', {
            detail: {
                pageCount: this.pageCount,
                mei: this.mei
            }
        } );

        this.view.customEventManager.dispatch( event );
    }

    async checkSchema()
    {
        const hasSchema = /<\?xml-model.*schematypens=\"http?:\/\/relaxng\.org\/ns\/structure\/1\.0\"/
        const hasSchemaMatch = hasSchema.exec( this.mei );
        if ( !hasSchemaMatch ) return;
        const schema = /<\?xml-model.*href="([^"]*).*/;
        const schemaMatch = schema.exec( this.mei );
        if ( schemaMatch && schemaMatch[1] !== this.currentSchema )
        {
            if ( await this.viewEditor.xmlView.replaceSchema( schemaMatch[1] ) )
            {
                this.currentSchema = schemaMatch[1];
                this.showNotification( `Current MEI Schema changed to '${ this.currentSchema }'` );
            }
            else
            {
                const dlg = new Dialog( this.ui.dialog, this, "Error when loading the MEI Schema", { icon: "error", type: Dialog.type.Msg } );
                dlg.setContent( `The Schema '${ schemaMatch[1] }' could not be loaded<br>The validation will be performed using '${ this.currentSchema }'` );
                await dlg.show();
            }
        }
    }

    async playMEI()
    {
        const base64midi = await this.verovio.renderToMIDI();
        const midiFile = 'data:audio/midi;base64,' + base64midi;
        this.midiPlayer.playFile( midiFile );
    }

    async generatePDF()
    {
        if ( !this.pdf )
        {
            const pdfWorker = new PDFWorker();
            this.pdf = new WorkerProxy( pdfWorker );
        }

        const pdfGenerator = new PDFGenerator( this.verovio, this.pdf, this.settings.scale );
        const pdfOutputStr = await pdfGenerator.generateFile();

        this.endLoading();

        this.ui.fileOutput.href = `${ pdfOutputStr }`;
        this.ui.fileOutput.download = this.filename.replace( /\.[^\.]*$/, '.pdf' );
        this.ui.fileOutput.click();
    }

    async generateMIDI()
    {
        const midiOutputStr = await this.verovio.renderToMIDI();

        this.endLoading();

        this.ui.fileOutput.href = `data:audio/midi;base64,${ midiOutputStr }`;
        this.ui.fileOutput.download = this.filename.replace( /\.[^\.]*$/, '.mid' );
        this.ui.fileOutput.click();
    }

    async confirmLargeFileLoading( size )
    {
        // Approx. 1 MB limit - fairly arbitrarily
        if ( size < 1000000 ) return true;

        const dlg = new Dialog( this.ui.dialog, this, "Large file warning", { okLabel: "Continue", icon: "warning" } );
        dlg.setContent( "You are trying to load a large file into the Editor. This can yield poor performance.<br>Do you want to proceed?" )
        const dlgRes = await dlg.show();
        return ( dlgRes !== 0 );
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onResized( e )
    {
        // Minimal height and width
        //if (this.element.clientHeight < 400) this.element.style.height = `${400}px`;
        //if (this.element.clientWidth < 200) this.element.style.width = `${200}px`;

        var height = this.element.clientHeight - this.ui.toolbar.clientHeight - this.ui.statusbar.clientHeight;
        if ( height < parseInt( this.ui.views.style.minHeight, 10 ) )
        {
            height = this.ui.views.style.minHeight;
            this.element.style.height = `${ height + this.ui.toolbar.clientHeight }px`;
        }

        this.ui.views.style.height = `${ height }px`
        this.ui.views.style.width = `${ this.element.clientWidth }px`;

        this.ui.statusbar.style.top = `${ height }px`;

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Window event handlers
    ////////////////////////////////////////////////////////////////////////

    onBeforeUnload( e )
    {
        if ( this.reset ) return;

        // Store zoom of each view
        if ( this.viewDocument ) this.options.documentZoom = this.viewDocument.currentZoomIndex;
        if ( this.viewResponsive ) this.options.responsiveZoom = this.viewResponsive.currentZoomIndex;
        if ( this.viewEditor ) this.options.editorZoom = this.viewEditor.currentZoomIndex;
        // Store current view
        if ( this.view == this.viewDocument ) this.options.defaultView = 'document';
        else if ( this.view == this.viewResponsive ) this.options.defaultView = 'responsive';
        else if ( this.view == this.viewEditor ) this.options.defaultView = 'editor';
        window.localStorage.setItem( "options", JSON.stringify( this.options ) );

        this.fileStack.store( this.filename, this.mei );
    }

    onResize( e )
    {
        clearTimeout( this.resizeTimer );
        const timerThis = this;
        this.resizeTimer = setTimeout( function ()
        {
            timerThis.startLoading( "Resizing ...", true );
            let event = new CustomEvent( 'onResized' );
            timerThis.customEventManager.dispatch( event );
        }, 100 );
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    prevPage( e )
    {
        if ( this.toolbarView.currentPage > 1 )
        {
            this.toolbarView.currentPage -= 1;
            this.startLoading( "Loading content ...", true );
            let event = new CustomEvent( 'onPage' );
            this.customEventManager.dispatch( event );
        }
    }

    nextPage( e )
    {
        if ( this.toolbarView.currentPage < this.pageCount )
        {
            this.toolbarView.currentPage += 1;
            this.startLoading( "Loading content ...", true );
            let event = new CustomEvent( 'onPage' );
            this.customEventManager.dispatch( event );
        }
    }

    zoomOut( e )
    {
        if ( this.toolbarView.currentZoomIndex > 0 )
        {
            this.toolbarView.currentZoomIndex -= 1;
            this.startLoading( "Adjusting size ...", true );
            let event = new CustomEvent( 'onZoom' );
            this.customEventManager.dispatch( event );
        }
    }

    zoomIn( e )
    {
        if ( this.toolbarView.currentZoomIndex < this.zoomLevels.length - 1 )
        {
            this.toolbarView.currentZoomIndex += 1;
            this.startLoading( "Adjusting size ...", true );
            let event = new CustomEvent( 'onZoom' );
            this.customEventManager.dispatch( event );
        }
    }

    async fileImport( e )
    {
        if ( e.target.dataset.ext === 'MEI' ) this.ui.fileInput.accept = ".xml, .mei";
        else if ( e.target.dataset.ext === 'MusicXML' ) this.ui.fileInput.accept = ".xml, .musicxml";
        //console.log( e.target.dataset.ext );
        this.ui.fileInput.dataset.ext = e.target.dataset.ext;
        this.ui.fileInput.click();
    }

    async fileInput( e )
    {
        let file = e.target.files[0];
        if ( !file ) return;

        let reader = new FileReader();
        const readerThis = this;
        const filename = file.name;
        const convert = ( e.target.dataset.ext != 'MEI' ) ? true : false;
        reader.onload = async function ( e )
        {
            if ( readerThis.view instanceof EditorPanel )
            {
                if ( await readerThis.confirmLargeFileLoading( e.target.result.length ) !== true ) return;
            }
            readerThis.loadData( e.target.result, filename, convert );
        };
        reader.readAsText( file );
    }

    async fileExport( e )
    {
        this.ui.fileOutput.href = 'data:text/xml;charset=utf-8,' + encodeURIComponent( this.mei );
        this.ui.fileOutput.download = this.filename;
        this.ui.fileOutput.click();
    }

    async fileExportPDF( e )
    {
        this.startLoading( "Generating PDF file ..." );
        this.generatePDF();
    }

    async fileExportMIDI( e )
    {
        this.startLoading( "Generating MIDI file ..." );
        this.generateMIDI();
    }

    async fileCopyToClipboard( e )
    {
        this.ui.fileCopy.value = this.mei;
        this.ui.fileCopy.select();
        document.execCommand( 'copy' );
        this.showNotification( "MEI copied to clipboard" );
    }

    async fileLoadRecent( e )
    {
        //console.log( e.target.dataset.idx );
        let file = this.fileStack.load( e.target.dataset.idx );
        this.loadData( file.data, file.filename );
    }

    async githubImport( e )
    {
        const dlg = new DialogGhImport( this.ui.dialog, this, "Import an MEI file from GitHub", {}, this.githubManager );
        const dlgRes = await dlg.show();
        if ( dlgRes === 1 )
        {
            this.loadData( dlg.data, dlg.filename );
        }
    }

    async githubExport( e )
    {
        const dlg = new DialogGhExport( this.ui.dialog, this, "Export an MEI file to GitHub", {}, this.githubManager );
        const dlgRes = await dlg.show();
        if ( dlgRes === 1 )
        {
        }
    }

    async xmlOverwriteMEI( e )
    {
        let params = {}
        if ( e.target.dataset.noIds == 'true' ) params["removeIds"] = true
        const mei = await this.verovio.getMEI( params );
        this.mei = mei;
        let event = new CustomEvent( 'onUpdateData', {
            detail: {
                currentId: this.currentId,
                caller: this.view
            }
        } );
        this.customEventManager.dispatch( event );
    }

    async xmlIndent( e )
    {
        // Not sure how to through this event?
    }

    async helpAbout( e )
    {
        const dlg = new Dialog( this.ui.dialog, this, "About this application", { okLabel: "Close", icon: "info", type: Dialog.type.Msg } );
        dlg.setContent( marked.parse(aboutMsg) );
        await dlg.show();
    }

    async helpReset( e )
    {
        const dlg = new Dialog( this.ui.dialog, this, "Reset to default", { okLabel: "Yes", icon: "question" } );
        dlg.setContent( marked.parse( resetMsg ) );
        if ( await dlg.show() === 0 ) return;
        this.fileStack.reset();
        window.localStorage.removeItem( "options" );
        this.reset = true;
        location.reload();
    }

    login( e )
    {
        location.href = `https://github.com/login/oauth/authorize?client_id=${ this.clientId }&redirect_uri=${ this.host }/oauth/redirect&scope=public_repo%20read:org`;
    }

    logout( e )
    {
        location.href = `${ this.host }/oauth/logout`;
    }

    async setView( e )
    {
        if ( this.midiToolbar && this.midiToolbar.playing )
        {
            this.midiPlayer.stop();
        }

        if ( e.target.dataset.view === 'editor' )
        {
            if ( await this.confirmLargeFileLoading( this.mei.length ) !== true ) return;
        }

        let event = new CustomEvent( 'onDeactivate' );
        this.view.customEventManager.dispatch( event );

        if ( e.target.dataset.view == 'document' )
        {
            this.view = this.viewDocument;
            this.toolbarView = this.viewDocument;
        }
        else if ( e.target.dataset.view == 'editor' )
        {
            this.view = this.viewEditor;
            this.toolbarView = this.viewEditor.editorView;
        }
        else if ( e.target.dataset.view == 'responsive' )
        {
            this.view = this.viewResponsive;
            this.toolbarView = this.viewResponsive;
        }

        this.startLoading( "Switching view ..." );
        let eventActivate = new CustomEvent( 'onActivate', {
            detail: {
                loadData: true
            }
        } );
        this.view.customEventManager.dispatch( eventActivate );
        this.toolbar.customEventManager.dispatch( eventActivate );
    }
}

export default App;
