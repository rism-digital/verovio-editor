/**
 * The AppToolbar class is the implementation of the main application toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */

import { App } from './app.js';
import { DocumentView } from './document-view.js';
import { EditorPanel } from './editor-panel.js';
import { ResponsiveView } from './responsive-view.js';
import { Toolbar } from './toolbar.js';

import { appendDivTo } from './utils/functions.js';

export class AppToolbar extends Toolbar {
    viewDocument: HTMLDivElement;
    viewResponsive: HTMLDivElement;
    viewSelector: HTMLDivElement;
    viewEditor: HTMLDivElement;
    element: HTMLDivElement;

    subSubMenu: HTMLDivElement;

    editorSubToolbar: HTMLDivElement;
    midiPlayerSubToolbar: HTMLDivElement;
    pageControls: HTMLDivElement;
    nextPage: HTMLDivElement;
    prevPage: HTMLDivElement;

    fileImportMusicXML: HTMLDivElement;
    fileImport: HTMLDivElement;
    fileMenuBtn: HTMLDivElement;
    fileRecent: HTMLDivElement;
    fileSelection: HTMLDivElement;

    zoomControls: HTMLDivElement;
    zoomIn: HTMLDivElement;
    zoomOut: HTMLDivElement;

    settingsEditor: HTMLDivElement;
    settingsVerovio: HTMLDivElement;

    helpReset: HTMLDivElement;
    helpAbout: HTMLDivElement;

    loginGroup: HTMLDivElement;
    login: HTMLDivElement;
    logout: HTMLDivElement;
    githubMenu: HTMLDivElement;
    githubImport: HTMLDivElement;
    githubExport: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);

        this.active = true;

        let iconsArrowLeft = `${app.host}/icons/toolbar/arrow-left.png`;
        let iconsArrowRight = `${app.host}/icons/toolbar/arrow-right.png`;
        let iconsDocument = `${app.host}/icons/toolbar/document.png`;
        let iconsEditor = `${app.host}/icons/toolbar/editor.png`;
        let iconsGithubSignin = `${app.host}/icons/toolbar/github-signin.png`;
        let iconsLayout = `${app.host}/icons/toolbar/layout.png`;
        let iconsResponsive = `${app.host}/icons/toolbar/responsive.png`;
        let iconsZoomIn = `${app.host}/icons/toolbar/zoom-in.png`;
        let iconsZoomOut = `${app.host}/icons/toolbar/zoom-out.png`;
        let iconsSettings = `${app.host}/icons/toolbar/settings.png`;

        ////////////////////////////////////////////////////////////////////////
        // View selection
        ////////////////////////////////////////////////////////////////////////

        const viewSelectorMenu = appendDivTo(this.element, { class: `vrv-menu` });
        this.viewSelector = appendDivTo(viewSelectorMenu, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsLayout})` }, 'data-before': `View` });
        const viewSelectorSubmenuContent = appendDivTo(viewSelectorMenu, { class: `vrv-menu-content` });
        appendDivTo(viewSelectorSubmenuContent, { class: `vrv-v-separator` });

        let viewCount = 0;
        if (this.app.options.enableDocument) {
            this.viewDocument = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsDocument})` }, 'data-before': `Document` });
            this.viewDocument.dataset.view = 'document';
            this.app.eventManager.bind(this.viewDocument, 'click', this.app.setView);
            viewCount += 1;
        }

        if (this.app.options.enableResponsive) {
            this.viewResponsive = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsResponsive})` }, 'data-before': `Responsive` });
            this.viewResponsive.dataset.view = 'responsive';
            this.app.eventManager.bind(this.viewResponsive, 'click', this.app.setView);
            viewCount += 1;
        }

        if (this.app.options.enableEditor) {
            this.viewEditor = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsEditor})` }, 'data-before': `Editor` });
            this.viewEditor.dataset.view = 'editor';
            this.app.eventManager.bind(this.viewEditor, 'click', this.app.setView);
            viewCount += 1;
        }

        if (viewCount === 1) {
            viewSelectorMenu.style.display = 'none';
        }

        ////////////////////////////////////////////////////////////////////////
        // File
        ////////////////////////////////////////////////////////////////////////

        const fileMenu = appendDivTo(this.element, { class: `vrv-menu` });
        if (!app.options.enableEditor) fileMenu.style.display = 'none';
        this.fileMenuBtn = appendDivTo(fileMenu, { class: `vrv-btn-text`, 'data-before': `File` });
        const fileMenuContent = appendDivTo(fileMenu, { class: `vrv-menu-content` });
        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });

        this.fileImport = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file` });
        this.fileImport.dataset.ext = 'MEI';
        this.app.eventManager.bind(this.fileImport, 'click', this.app.fileImport);

        this.fileImportMusicXML = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MusicXML file` });
        fileMenuContent.appendChild(this.fileImportMusicXML);
        this.app.eventManager.bind(this.fileImportMusicXML, 'click', this.app.fileImport);

        const fileRecentSubMenu = appendDivTo(fileMenuContent, { class: `vrv-submenu` });
        this.fileRecent = appendDivTo(fileRecentSubMenu, { class: `vrv-submenu-text`, 'data-before': `Recent files` });

        this.subSubMenu = appendDivTo(fileRecentSubMenu, { class: `vrv-submenu-content` });
        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });

        const fileExport = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export MEI file` });
        fileExport.dataset.ext = 'MEI';
        this.app.eventManager.bind(fileExport, 'click', this.app.fileExport);

        const fileCopy = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Copy MEI to clipboard` });
        this.app.eventManager.bind(fileCopy, 'click', this.app.fileCopyToClipboard);

        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });

        const fileExportPDF = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export as PDF` });
        this.app.eventManager.bind(fileExportPDF, 'click', this.app.fileExportPDF);

        const fileExportMIDI = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export as MIDI` });
        this.app.eventManager.bind(fileExportMIDI, 'click', this.app.fileExportMIDI);

        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });

        this.fileSelection = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Apply content selection` });
        this.app.eventManager.bind(this.fileSelection, 'click', this.app.fileSelection);

        ////////////////////////////////////////////////////////////////////////
        // GitHub
        ////////////////////////////////////////////////////////////////////////

        this.githubMenu = appendDivTo(this.element, { class: `vrv-menu`, style: { display: `none` } });
        appendDivTo(this.githubMenu, { class: `vrv-btn-text`, 'data-before': `GitHub` });
        const githubMenuContent = appendDivTo(this.githubMenu, { class: `vrv-menu-content` });
        appendDivTo(githubMenuContent, { class: `vrv-v-separator` });

        this.githubImport = appendDivTo(githubMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file from GitHub` });
        this.app.eventManager.bind(this.githubImport, 'click', this.app.githubImport);

        this.githubExport = appendDivTo(githubMenuContent, { class: `vrv-menu-text`, 'data-before': `Export (commit/push) to GitHub` });
        this.app.eventManager.bind(this.githubExport, 'click', this.app.githubExport);

        ////////////////////////////////////////////////////////////////////////
        // Navigation
        ////////////////////////////////////////////////////////////////////////

        this.pageControls = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.pageControls, { class: `vrv-h-separator` });

        this.prevPage = appendDivTo(this.pageControls, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsArrowLeft})` }, 'data-before': `Previous` });
        this.app.eventManager.bind(this.prevPage, 'click', this.app.prevPage);

        this.nextPage = appendDivTo(this.pageControls, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsArrowRight})` }, 'data-before': `Next` });
        this.app.eventManager.bind(this.nextPage, 'click', this.app.nextPage);

        ////////////////////////////////////////////////////////////////////////
        // Zoom
        ////////////////////////////////////////////////////////////////////////

        this.zoomControls = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.zoomControls, { class: `vrv-h-separator` });

        this.zoomOut = appendDivTo(this.zoomControls, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsZoomOut})` }, 'data-before': `Zoom out` });
        this.app.eventManager.bind(this.zoomOut, 'click', this.app.zoomOut);

        this.zoomIn = appendDivTo(this.zoomControls, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsZoomIn})` }, 'data-before': `Zoom in` });
        this.app.eventManager.bind(this.zoomIn, 'click', this.app.zoomIn);

        ////////////////////////////////////////////////////////////////////////
        // Sub-toolbars
        ////////////////////////////////////////////////////////////////////////

        this.midiPlayerSubToolbar = appendDivTo(this.element, {});
        this.editorSubToolbar = appendDivTo(this.element, {});

        ////////////////////////////////////////////////////////////////////////
        // Settings
        ////////////////////////////////////////////////////////////////////////

        appendDivTo(this.element, { class: `vrv-h-separator` });

        const settingsMenu = appendDivTo(this.element, { class: `vrv-menu` });
        appendDivTo(settingsMenu, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsSettings})` }, 'data-before': `Settings` });
        const settingsMenuContent = appendDivTo(settingsMenu, { class: `vrv-menu-content` });
        appendDivTo(settingsMenuContent, { class: `vrv-v-separator` });

        this.settingsEditor = appendDivTo(settingsMenuContent, { class: `vrv-menu-text`, 'data-before': `Editor options` });
        this.app.eventManager.bind(this.settingsEditor, 'click', this.app.settingsEditor);

        this.settingsVerovio = appendDivTo(settingsMenuContent, { class: `vrv-menu-text`, 'data-before': `Verovio options` });
        this.app.eventManager.bind(this.settingsVerovio, 'click', this.app.settingsVerovio);

        ////////////////////////////////////////////////////////////////////////
        // Help
        ////////////////////////////////////////////////////////////////////////

        appendDivTo(this.element, { class: `vrv-h-separator` });

        const helpMenu = appendDivTo(this.element, { class: `vrv-menu` });
        if (!app.options.enableEditor) helpMenu.style.display = 'none';
        appendDivTo(helpMenu, { class: `vrv-btn-text`, 'data-before': `Help` });
        const helpMenuContent = appendDivTo(helpMenu, { class: `vrv-menu-content` });
        appendDivTo(helpMenuContent, { class: `vrv-v-separator` });

        this.helpAbout = appendDivTo(helpMenuContent, { class: `vrv-menu-text`, 'data-before': `About this application` });
        this.app.eventManager.bind(this.helpAbout, 'click', this.app.helpAbout);

        this.helpReset = appendDivTo(helpMenuContent, { class: `vrv-menu-text`, 'data-before': `Reset to default` });
        this.app.eventManager.bind(this.helpReset, 'click', this.app.helpReset);

        ////////////////////////////////////////////////////////////////////////
        // Login
        ////////////////////////////////////////////////////////////////////////

        this.loginGroup = appendDivTo(this.element, { class: `vrv-btn-group-right` });
        if (!app.options.enableEditor) this.loginGroup.style.display = 'none';
        appendDivTo(this.loginGroup, { class: `vrv-h-separator` });

        this.logout = appendDivTo(this.loginGroup, { class: `vrv-btn-text`, style: { display: `none` }, 'data-before': `Logout` });
        this.app.eventManager.bind(this.logout, 'click', this.app.logout);

        this.login = appendDivTo(this.loginGroup, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsGithubSignin})` }, 'data-before': `Github` });
        this.app.eventManager.bind(this.login, 'click', this.app.login);

        // Bindings for hiding menu once an item has be click - the corresponding class is
        // removed when the toolbar is moused over

        for (const node of this.element.querySelectorAll('div.vrv-menu')) {
            this.eventManager.bind(node, 'mouseover', this.onMouseOver);
        }

        for (const node of this.element.querySelectorAll('div.vrv-menu-text')) {
            this.eventManager.bind(node, 'click', this.onClick);
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateAll(): void {
        this.updateToolbarBtn(this.prevPage, (this.app.toolbarView.currentPage > 1));
        this.updateToolbarBtn(this.nextPage, (this.app.toolbarView.currentPage < this.app.pageCount));
        this.updateToolbarBtn(this.zoomOut, ((this.app.pageCount > 0) && (this.app.toolbarView.currentZoomIndex > 0)));
        this.updateToolbarBtn(this.zoomIn, ((this.app.pageCount > 0) && (this.app.toolbarView.currentZoomIndex < this.app.zoomLevels.length - 1)));

        let isResponsive = ((this.app.view instanceof ResponsiveView) && !(this.app.view instanceof EditorPanel));
        let isEditor = (this.app.view instanceof EditorPanel);
        let isDocument = (this.app.view instanceof DocumentView);

        const hasSelection = (this.app.options.selection && Object.keys(this.app.options.selection).length !== 0);

        this.updateToolbarGrp(this.pageControls, !isDocument);

        this.updateToolbarGrp(this.midiPlayerSubToolbar, isEditor || isResponsive);
        this.updateToolbarGrp(this.editorSubToolbar, isEditor);

        this.updateToolbarSubmenuBtn(this.viewDocument, isDocument);
        this.updateToolbarSubmenuBtn(this.viewResponsive, isResponsive);
        this.updateToolbarSubmenuBtn(this.viewEditor, isEditor);

        this.updateToolbarSubmenuBtn(this.fileSelection, hasSelection);

        if (this.app.githubManager.isLoggedIn()) {
            this.githubMenu.style.display = 'block';
            this.updateToolbarBtnHide(this.logout, true);
            this.login.setAttribute("data-before", this.app.githubManager.name);
            this.login.classList.add("inactivated");
        }

        this.updateRecent();
    }

    updateRecent(): void {
        this.subSubMenu.innerHTML = "";

        let fileList: Array<{ idx: number, filename: string }> = this.app.fileStack.fileList();
        for (let i = 0; i < fileList.length; i++) {
            const entry = appendDivTo(this.subSubMenu, { class: `vrv-menu-text`, 'data-before': fileList[i].filename });
            entry.dataset.idx = fileList[i].idx.toString();
            this.app.eventManager.bind(entry, 'click', this.app.fileLoadRecent);
            this.eventManager.bind(entry, 'click', this.onClick);
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Mouse methods
    ////////////////////////////////////////////////////////////////////////

    onMouseOver(e: CustomEvent): void {
        for (const node of this.element.querySelectorAll('div.vrv-menu-content')) {
            // Hide the menu content
            node.classList.remove("clicked");
        }
    }

    onClick(e: CustomEvent): void {
        for (const node of this.element.querySelectorAll('div.vrv-menu-content')) {
            // Remove the class so the menu content is shown again with a hover
            node.classList.add("clicked");
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    override onActivate(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        //console.debug("AppToolbar::onActivate");

        this.updateAll();

        return true;
    }

    override onEndLoading(e: CustomEvent): boolean {
        if (!super.onEndLoading(e)) return false;
        //console.debug("AppToolbar::onEndLoading");

        this.updateAll();

        return true;
    }

    override onStartLoading(e: CustomEvent): boolean {
        if (!super.onStartLoading(e)) return false;
        //console.debug("AppToolbar:onStartLoading");

        this.updateToolbarBtn(this.prevPage, false);
        this.updateToolbarBtn(this.nextPage, false);
        this.updateToolbarBtn(this.zoomOut, false);
        this.updateToolbarBtn(this.zoomIn, false);

        return true;
    }

    override onUpdateView(e: CustomEvent): boolean {
        if (!super.onUpdateView(e)) return false;
        //console.debug("AppToolbar::onUpdate");

        this.updateAll();

        return true;
    }
}
