/**
 * The App class is the main class of the application.
 * It requires a HTMLDivElement to be put on.
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
const version = "1.1.7";
import { AppStatusbar } from './app-statusbar.js';
import { AppToolbar } from './app-toolbar.js';
import { Dialog } from './dialog.js';
import { DialogGhExport } from './dialog-gh-export.js';
import { DialogGhImport } from './dialog-gh-import.js';
import { DocumentView } from './document-view.js';
import { CustomEventManager } from './custom-event-manager.js';
import { EditorPanel } from './editor-panel.js';
import { EventManager } from './event-manager.js';
import { FileStack } from './file-stack.js';
import { GitHubManager } from './github-manager.js';
import { MidiPlayer } from './midi-player.js';
import { MidiToolbar } from './midi-toolbar.js';
import { PDFGenerator } from './pdf-generator.js';
import { ResponsiveView } from './responsive-view.js';
import { RNGLoader } from './rng-loader.js';
import { PDFWorkerProxy, VerovioWorkerProxy, ValidatorWorkerProxy } from './worker-proxy.js';
import { appendAnchorTo, appendDivTo, appendInputTo, appendLinkTo, appendTextAreaTo } from './utils/functions.js';
let filter = '/svg/filter.xml';
const aboutMsg = `The Verovio Editor is an experimental online MEI editor prototype. It is based on [Verovio](https://www.verovio.org) and can be connected to [GitHub](https://github.com)\n\nVersion: ${version}`;
const resetMsg = `This will reset all default options, reset the default file, remove all previous files, and reload the application.\n\nDo you want to proceed?`;
export class App {
    constructor(div, options) {
        this.clientId = "fd81068a15354a300522";
        this.host = (window.location.hostname == "localhost") ? `http://${window.location.host}` : "https://editor.verovio.org";
        this.id = this.clientId;
        this.notificationStack = [];
        this.githubManager = new GitHubManager(this);
        this.options = Object.assign({
            // The margin around page in documentView
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
            enableValidation: true,
            // The default schema (latest MEI release by default)
            schema: 'https://music-encoding.org/schema/4.0.1/mei-all.rng',
            defaultView: 'responsive',
            isSafari: false
        }, options);
        if (options.appReset)
            window.localStorage.removeItem("options");
        const storedOptions = localStorage.getItem("options");
        if (storedOptions) {
            this.options = Object.assign(this.options, JSON.parse(storedOptions));
        }
        this.fileStack = new FileStack();
        if (options.appReset)
            this.fileStack.reset();
        // Root element in which verovio-ui is created
        this.element = div;
        this.zoomLevels = [5, 10, 20, 35, 75, 100, 150, 200];
        // If necessary remove all the children of the div
        while (this.element.firstChild) {
            this.element.firstChild.remove();
        }
        appendLinkTo(document.head, { href: `${this.host}/css/verovio.css`, rel: `stylesheet` });
        this.loadingCount = 0;
        this.eventManager = new EventManager(this);
        this.customEventManager = new CustomEventManager();
        this.appToolbar = null;
        // Create and load the SVG filter
        this.createFilter();
        // Create input for reading files
        this.input = appendInputTo(this.element, { type: `file`, class: `vrv-file-input` });
        this.input.onchange = this.fileInput.bind(this);
        // Create link for writing files
        this.output = appendAnchorTo(this.element, { class: `vrv-file-output` });
        // Create link for copying files
        this.fileCopy = appendTextAreaTo(this.element, { class: `vrv-file-copy` });
        // Create the HTML content
        this.wrapper = appendDivTo(this.element, { class: `vrv-wrapper` });
        // Create notification div
        this.notification = appendDivTo(this.wrapper, { class: `vrv-notification disabled` });
        // Create a dialog div
        this.dialog = appendDivTo(this.wrapper, { class: `vrv-dialog` });
        // Create a toolbar div
        this.toolbar = appendDivTo(this.wrapper, { class: `vrv-toolbar` });
        // Views
        this.views = appendDivTo(this.wrapper, { class: `vrv-views` });
        // Loader
        this.loader = appendDivTo(this.views, { class: `vrv-loading` });
        this.loaderText = appendDivTo(this.loader, { class: `vrv-loading-text` });
        // Status bar
        this.statusbar = appendDivTo(this.wrapper, { class: `vrv-statusbar` });
        if (!this.options.enableStatusbar) {
            this.statusbar.style.minHeight = '0px';
        }
        // PDF object - will be created only if necessary
        this.pdf = null;
        // VerovioMessenger object
        this.verovio = null;
        // Validator and rngLoader objects
        this.validator = null;
        this.rngLoader = null;
        // Handling the resizing of the window
        this.resizeTimer = 0; // Used to prevent per-pixel re-render events when the window is resized
        window.onresize = this.onResize.bind(this);
        window.onbeforeunload = this.onBeforeUnload.bind(this);
        //window.addEventListener("beforeunload", this.onBeforeUnload);
        this.customEventManager.bind(this, 'onResized', this.onResized);
        let event = new CustomEvent('onResized');
        this.customEventManager.dispatch(event);
        const verovioWorkerURL = this.getWorkerURL(`${this.host}/dist/verovio-worker.js`);
        const verovioWorker = new Worker(verovioWorkerURL);
        this.verovio = new VerovioWorkerProxy(verovioWorker);
        this.verovioOptions =
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
        if (this.options.enableEditor) {
            const validatorWorkerURL = this.getWorkerURL(`${this.host}/dist/validator-worker.js`);
            const validatorWorker = new Worker(validatorWorkerURL);
            this.validator = new ValidatorWorkerProxy(validatorWorker);
            this.rngLoader = new RNGLoader();
        }
        // Set to true when everything is loaded
        this.appIsLoaded = false;
        // Use to avoid saving config when resetting the app
        this.appReset = false;
        this.mei = "";
        this.filename = "untitled.xml";
        const last = this.fileStack.getLast();
        if (last) {
            console.log("Reloading", last.filename);
            this.loadData(last.data, last.filename);
        }
        // Listen and wait for Module to emit onRuntimeInitialized
        this.startLoading("Loading Verovio ...");
        this.verovio.onRuntimeInitialized().then(() => __awaiter(this, void 0, void 0, function* () {
            const version = yield this.verovio.getVersion();
            console.log(version);
            this.endLoading();
            this.midiPlayer = new MidiPlayer();
            if (this.options.enableEditor) {
                this.startLoading("Loading the XML validator ...");
                // Listen and wait for Module to emit onRuntimeInitialized
                this.validator.onRuntimeInitialized().then(() => __awaiter(this, void 0, void 0, function* () {
                    this.currentSchema = this.options.schema;
                    const response = yield fetch(this.currentSchema);
                    const data = yield response.text();
                    if (this.options.enableValidation) {
                        const res = yield this.validator.setRelaxNGSchema(data);
                        console.log("Schema loaded", res);
                    }
                    this.rngLoader.setRelaxNGSchema(data);
                    this.endLoading();
                    this.createInterfaceAndLoadData();
                }));
            }
            else {
                this.createInterfaceAndLoadData();
            }
        }));
    }
    destroy() {
        this.eventManager.unbindAll();
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    getWorkerURL(url) {
        const content = `importScripts("${url}");`;
        return URL.createObjectURL(new Blob([content], { type: "text/javascript" }));
    }
    createInterfaceAndLoadData() {
        this.startLoading("Create the interface ...");
        this.createToolbar();
        this.createViews();
        this.createStatusbar();
        this.customEventManager.bind(this, 'onResized', this.onResized);
        let event = new CustomEvent('onResized');
        this.customEventManager.dispatch(event);
        if (this.options.isSafari) {
            this.showNotification("It seems that you are using Safari, on which XML validation unfortunately does not work.<br/>Please use another browser to have XML validation enabled.");
        }
        this.appIsLoaded = true;
        this.endLoading();
        if (this.mei) {
            this.loadMEI(false);
        }
    }
    createViews() {
        this.startLoading("Loading the views ...");
        this.view = null;
        this.toolbarView = null;
        if (this.options.enableDocument) {
            this.currentZoomIndex = this.options.documentZoom;
            this.view1 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewDocument = new DocumentView(this.view1, this, this.verovio);
            this.customEventManager.addToPropagationList(this.viewDocument.customEventManager);
            if (this.options.defaultView === 'document') {
                this.view = this.viewDocument;
                this.toolbarView = this.viewDocument;
            }
        }
        if (this.options.enableEditor) {
            this.currentZoomIndex = this.options.editorZoom;
            this.view2 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewEditor = new EditorPanel(this.view2, this, this.verovio, this.validator, this.rngLoader);
            this.customEventManager.addToPropagationList(this.viewEditor.customEventManager);
            if (this.options.defaultView === 'editor') {
                this.view = this.viewEditor;
                this.toolbarView = this.viewEditor.editorView;
            }
        }
        if (this.options.enableResponsive) {
            this.currentZoomIndex = this.options.responsiveZoom;
            this.view3 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewResponsive = new ResponsiveView(this.view3, this, this.verovio);
            this.customEventManager.addToPropagationList(this.viewResponsive.customEventManager);
            if (this.options.defaultView === 'responsive') {
                this.view = this.viewResponsive;
                this.toolbarView = this.viewResponsive;
            }
            // midi player in responsive view only
            this.midiPlayer.view = this.viewResponsive;
        }
        // Root element in which verovio-ui is created
        if (!this.view) {
            throw `No view enabled or unknown default view '${this.options.defaultView}' selected.`;
        }
        this.endLoading();
        let eventActivate = new CustomEvent('onActivate');
        this.view.customEventManager.dispatch(eventActivate);
        //let eventResized = new CustomEvent( 'onResized' );
        //this.customEventManager.dispatch( eventResized );
    }
    createToolbar() {
        this.appToolbar = new AppToolbar(this.toolbar, this);
        this.customEventManager.addToPropagationList(this.appToolbar.customEventManager);
        this.midiToolbar = new MidiToolbar(this.toolbar, this, this.midiPlayer);
        this.customEventManager.addToPropagationList(this.midiToolbar.customEventManager);
    }
    createStatusbar() {
        if (!this.options.enableStatusbar)
            return;
        this.appStatusbar = new AppStatusbar(this.statusbar, this);
        this.customEventManager.addToPropagationList(this.appStatusbar.customEventManager);
    }
    createFilter() {
        const filterDiv = appendDivTo(this.element, { class: `vrv-filter` });
        var xHttp = new XMLHttpRequest();
        xHttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                filterDiv.appendChild(this.responseXML.documentElement);
            }
        };
        xHttp.open("GET", `${this.host}${filter}`, true);
        xHttp.send();
    }
    loadData(mei, filename = "untitled.xml", convert = false, onlyIfEmpty = false) {
        if (this.mei.length != 0) {
            // This is useful for loading the app with a default file but not if one exists
            if (onlyIfEmpty)
                return;
            this.fileStack.store(this.filename, this.mei);
            if (this.appToolbar !== null)
                this.appToolbar.updateRecent();
        }
        this.mei = mei;
        this.filename = filename;
        if (this.appIsLoaded) {
            this.loadMEI(convert);
        }
    }
    startLoading(msg, light = false) {
        if (light) {
            this.views.style.pointerEvents = 'none';
            //this.ui.views.style.opacity = '0.6';
        }
        else {
            this.views.style.overflow = 'hidden';
            this.loader.style.display = `flex`;
            this.loadingCount++;
        }
        this.loaderText.innerHTML = msg;
        let event = new CustomEvent('onStartLoading', {
            detail: {
                light: light,
                msg: msg
            }
        });
        this.customEventManager.dispatch(event);
    }
    endLoading(light = false) {
        if (!light) {
            this.loadingCount--;
            if (this.loadingCount < 0)
                console.error("endLoading index corrupted");
        }
        // We have other tasks being performed
        if (this.loadingCount > 0)
            return;
        this.views.style.overflow = 'scroll';
        this.loader.style.display = 'none';
        this.views.style.pointerEvents = '';
        this.views.style.opacity = '';
        let event = new CustomEvent('onEndLoading');
        this.customEventManager.dispatch(event);
    }
    showNotification(message) {
        this.notificationStack.push(message);
        if (this.notificationStack.length < 2)
            this.pushNotification();
    }
    pushNotification() {
        this.notification.innerHTML = this.notificationStack[0];
        this.notification.classList.remove("disabled");
        const timerThis = this;
        setTimeout(function () {
            timerThis.notification.classList.add("disabled");
            timerThis.notificationStack.shift();
            if (timerThis.notificationStack.length > 0)
                timerThis.pushNotification();
        }, 3500);
    }
    ////////////////////////////////////////////////////////////////////////
    // Async methods
    ////////////////////////////////////////////////////////////////////////
    loadMEI(convert) {
        return __awaiter(this, void 0, void 0, function* () {
            this.startLoading("Loading the MEI data ...");
            yield this.verovio.loadData(this.mei);
            this.pageCount = yield this.verovio.getPageCount();
            if (convert) {
                this.mei = yield this.verovio.getMEI({});
            }
            yield this.checkSchema();
            let event = new CustomEvent('onLoadData', {
                detail: {
                    pageCount: this.pageCount,
                    mei: this.mei
                }
            });
            this.view.customEventManager.dispatch(event);
        });
    }
    checkSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.enableEditor)
                return;
            const hasSchema = /<\?xml-model.*schematypens=\"http?:\/\/relaxng\.org\/ns\/structure\/1\.0\"/;
            const hasSchemaMatch = hasSchema.exec(this.mei);
            if (!hasSchemaMatch)
                return;
            const schema = /<\?xml-model.*href="([^"]*).*/;
            const schemaMatch = schema.exec(this.mei);
            if (schemaMatch && schemaMatch[1] !== this.currentSchema) {
                if (yield this.viewEditor.xmlEditorView.replaceSchema(schemaMatch[1])) {
                    this.currentSchema = schemaMatch[1];
                    this.showNotification(`Current MEI Schema changed to '${this.currentSchema}'`);
                }
                else {
                    const dlg = new Dialog(this.dialog, this, "Error when loading the MEI Schema", { icon: "error", type: Dialog.Type.Msg });
                    dlg.setContent(`The Schema '${schemaMatch[1]}' could not be loaded<br>The validation will be performed using '${this.currentSchema}'`);
                    yield dlg.show();
                }
            }
        });
    }
    playMEI() {
        return __awaiter(this, void 0, void 0, function* () {
            const base64midi = yield this.verovio.renderToMIDI();
            const midiFile = 'data:audio/midi;base64,' + base64midi;
            this.midiPlayer.playFile(midiFile);
        });
    }
    generatePDF() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.pdf) {
                const pdfWorkerURL = this.getWorkerURL(`${this.host}/dist/pdf-worker.js`);
                const pdfWorker = new Worker(pdfWorkerURL);
                this.pdf = new PDFWorkerProxy(pdfWorker);
            }
            const pdfGenerator = new PDFGenerator(this.verovio, this.pdf, this.verovioOptions.scale);
            const pdfOutputStr = yield pdfGenerator.generateFile();
            this.endLoading();
            this.output.href = `${pdfOutputStr}`;
            this.output.download = this.filename.replace(/\.[^\.]*$/, '.pdf');
            this.output.click();
        });
    }
    generateMIDI() {
        return __awaiter(this, void 0, void 0, function* () {
            const midiOutputStr = yield this.verovio.renderToMIDI();
            this.endLoading();
            this.output.href = `data:audio/midi;base64,${midiOutputStr}`;
            this.output.download = this.filename.replace(/\.[^\.]*$/, '.mid');
            this.output.click();
        });
    }
    confirmLargeFileLoading(size) {
        return __awaiter(this, void 0, void 0, function* () {
            // Approx. 1 MB limit - fairly arbitrarily
            if (size < 1000000)
                return true;
            const dlg = new Dialog(this.dialog, this, "Large file warning", { okLabel: "Continue", icon: "warning" });
            dlg.setContent("You are trying to load a large file into the Editor. This can yield poor performance.<br>Do you want to proceed?");
            const dlgRes = yield dlg.show();
            return (dlgRes !== 0);
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onResized(e) {
        // Minimal height and width
        //if (this.element.clientHeight < 400) this.element.style.height = `${400}px`;
        //if (this.element.clientWidth < 200) this.element.style.width = `${200}px`;
        let height = this.element.clientHeight - this.toolbar.clientHeight - this.statusbar.clientHeight;
        if (height < parseInt(this.views.style.minHeight, 10)) {
            height = Number(this.views.style.minHeight);
            this.element.style.height = `${height + this.toolbar.clientHeight}px`;
        }
        this.views.style.height = `${height}px`;
        this.views.style.width = `${this.element.clientWidth}px`;
        this.statusbar.style.top = `${height}px`;
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Window event handlers
    ////////////////////////////////////////////////////////////////////////
    onBeforeUnload(e) {
        if (this.appReset)
            return;
        // Store zoom of each view
        if (this.viewDocument)
            this.options.documentZoom = this.viewDocument.currentZoomIndex;
        if (this.viewResponsive)
            this.options.responsiveZoom = this.viewResponsive.currentZoomIndex;
        if (this.viewEditor)
            this.options.editorZoom = this.viewEditor.editorView.currentZoomIndex;
        // Store current view
        if (this.view == this.viewDocument)
            this.options.defaultView = 'document';
        else if (this.view == this.viewResponsive)
            this.options.defaultView = 'responsive';
        else if (this.view == this.viewEditor)
            this.options.defaultView = 'editor';
        window.localStorage.setItem("options", JSON.stringify(this.options));
        this.fileStack.store(this.filename, this.mei);
    }
    onResize(e) {
        clearTimeout(this.resizeTimer);
        const timerThis = this;
        this.resizeTimer = setTimeout(function () {
            timerThis.startLoading("Resizing ...", true);
            let event = new CustomEvent('onResized');
            timerThis.customEventManager.dispatch(event);
        }, 100);
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    prevPage(e) {
        if (this.toolbarView.currentPage > 1) {
            this.toolbarView.currentPage -= 1;
            this.startLoading("Loading content ...", true);
            let event = new CustomEvent('onPage');
            this.customEventManager.dispatch(event);
        }
    }
    nextPage(e) {
        if (this.toolbarView.currentPage < this.pageCount) {
            this.toolbarView.currentPage += 1;
            this.startLoading("Loading content ...", true);
            let event = new CustomEvent('onPage');
            this.customEventManager.dispatch(event);
        }
    }
    zoomOut(e) {
        if (this.toolbarView.currentZoomIndex > 0) {
            this.toolbarView.currentZoomIndex -= 1;
            this.startLoading("Adjusting size ...", true);
            let event = new CustomEvent('onZoom');
            this.customEventManager.dispatch(event);
        }
    }
    zoomIn(e) {
        if (this.toolbarView.currentZoomIndex < this.zoomLevels.length - 1) {
            this.toolbarView.currentZoomIndex += 1;
            this.startLoading("Adjusting size ...", true);
            let event = new CustomEvent('onZoom');
            this.customEventManager.dispatch(event);
        }
    }
    fileImport(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            if (element.dataset.ext === 'MEI')
                this.input.accept = ".xml, .mei";
            else if (element.dataset.ext === 'MusicXML')
                this.input.accept = ".xml, .musicxml";
            //console.log( element.dataset.ext );
            this.input.dataset.ext = element.dataset.ext;
            this.input.click();
        });
    }
    fileInput(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            let file = element.files[0];
            if (!file)
                return;
            let reader = new FileReader();
            const readerThis = this;
            const filename = file.name;
            const convert = (element.dataset.ext != 'MEI') ? true : false;
            reader.onload = function (e) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (readerThis.view instanceof EditorPanel) {
                        if ((yield readerThis.confirmLargeFileLoading(file.size)) !== true)
                            return;
                    }
                    readerThis.loadData(e.target.result, filename, convert);
                });
            };
            reader.readAsText(file);
        });
    }
    fileExport(e) {
        return __awaiter(this, void 0, void 0, function* () {
            this.output.href = 'data:text/xml;charset=utf-8,' + encodeURIComponent(this.mei);
            this.output.download = this.filename;
            this.output.click();
        });
    }
    fileExportPDF(e) {
        return __awaiter(this, void 0, void 0, function* () {
            this.startLoading("Generating PDF file ...");
            this.generatePDF();
        });
    }
    fileExportMIDI(e) {
        return __awaiter(this, void 0, void 0, function* () {
            this.startLoading("Generating MIDI file ...");
            this.generateMIDI();
        });
    }
    fileCopyToClipboard(e) {
        return __awaiter(this, void 0, void 0, function* () {
            this.fileCopy.value = this.mei;
            this.fileCopy.select();
            document.execCommand('copy');
            this.showNotification("MEI copied to clipboard");
        });
    }
    fileLoadRecent(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            //console.log( e.target.dataset.idx );
            let file = this.fileStack.load(Number(element.dataset.idx));
            this.loadData(file.data, file.filename);
        });
    }
    githubImport(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const dlg = new DialogGhImport(this.dialog, this, "Import an MEI file from GitHub", {}, this.githubManager);
            const dlgRes = yield dlg.show();
            if (dlgRes === 1) {
                this.loadData(dlg.data, dlg.filename);
            }
        });
    }
    githubExport(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const dlg = new DialogGhExport(this.dialog, this, "Export an MEI file to GitHub", {}, this.githubManager);
            const dlgRes = yield dlg.show();
            if (dlgRes === 1) {
            }
        });
    }
    xmlOverwriteMEI(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            let params = {};
            if (element.dataset.noIds == 'true')
                params["removeIds"] = true;
            const mei = yield this.verovio.getMEI(params);
            this.mei = mei;
            let event = new CustomEvent('onUpdateData', {
                detail: {
                    currentId: this.clientId,
                    caller: this.view
                }
            });
            this.customEventManager.dispatch(event);
        });
    }
    xmlIndent(e) {
        return __awaiter(this, void 0, void 0, function* () {
            // Not sure how to through this event?
        });
    }
    helpAbout(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const dlg = new Dialog(this.dialog, this, "About this application", { okLabel: "Close", icon: "info", type: Dialog.Type.Msg });
            dlg.setContent(marked.parse(aboutMsg));
            yield dlg.show();
        });
    }
    helpReset(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const dlg = new Dialog(this.dialog, this, "Reset to default", { okLabel: "Yes", icon: "question" });
            dlg.setContent(marked.parse(resetMsg));
            if ((yield dlg.show()) === 0)
                return;
            this.fileStack.reset();
            window.localStorage.removeItem("options");
            this.appReset = true;
            location.reload();
        });
    }
    login(e) {
        location.href = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.host}/oauth/redirect&scope=public_repo%20read:org`;
    }
    logout(e) {
        location.href = `${this.host}/oauth/logout`;
    }
    setView(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            if (this.midiToolbar && this.midiToolbar.playing) {
                this.midiPlayer.stop();
            }
            if (element.dataset.view === 'editor') {
                if ((yield this.confirmLargeFileLoading(this.mei.length)) !== true)
                    return;
            }
            let event = new CustomEvent('onDeactivate');
            this.view.customEventManager.dispatch(event);
            if (element.dataset.view == 'document') {
                this.view = this.viewDocument;
                this.toolbarView = this.viewDocument;
            }
            else if (element.dataset.view == 'editor') {
                this.view = this.viewEditor;
                this.toolbarView = this.viewEditor.editorView;
            }
            else if (element.dataset.view == 'responsive') {
                this.view = this.viewResponsive;
                this.toolbarView = this.viewResponsive;
            }
            this.startLoading("Switching view ...");
            let eventActivate = new CustomEvent('onActivate', {
                detail: {
                    loadData: true
                }
            });
            this.view.customEventManager.dispatch(eventActivate);
            this.appToolbar.customEventManager.dispatch(eventActivate);
        });
    }
}
