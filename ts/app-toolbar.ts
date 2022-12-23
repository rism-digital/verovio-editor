/**
 * The AppToolbar class is the implementation of the main application toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */

import { App } from '../js/app.js';
import { DocumentView } from '../js/document-view.js';
import { EditorPanel } from '../js/editor-panel.js';
import { ResponsiveView } from '../js/responsive-view.js';
import { Toolbar } from './toolbar.js';

import { elt } from '../js/utils/functions.js';
import { appendDivTo } from './utils/functions.js';

export class AppToolbar extends Toolbar
{
    viewDocument: HTMLDivElement;
    viewResponsive: HTMLDivElement;
    viewSelector: HTMLDivElement;
    viewEditor: HTMLDivElement;
    element: HTMLDivElement;

    loginGroup: HTMLDivElement;
    login: HTMLDivElement;
    logout: HTMLDivElement;
    githubMenu: HTMLDivElement;
    subSubMenu: HTMLDivElement;
    helpReset: HTMLDivElement;
    helpAbout: HTMLDivElement;

    editorSubToolbar: HTMLDivElement;
    midiPlayerSubToolbar: HTMLDivElement;
    pageControls: HTMLDivElement;
    nextPage: HTMLDivElement;
    prevPage: HTMLDivElement;

    zoomControls: HTMLDivElement;
    zoomIn: HTMLDivElement;
    zoomOut: HTMLDivElement;

    xmlMenu: HTMLDivElement;
    xmlOverwriteMEINoIds: HTMLDivElement;
    xmlOverwriteMEI: HTMLDivElement;

    fileImportMusicXML: HTMLDivElement;
    fileImport: HTMLDivElement;
    fileMenuBtn: HTMLDivElement;
    fileRecent: HTMLDivElement;
    githubImport: HTMLDivElement;
    githubExport: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);

        this.active = true;

        let iconsArrowLeft = '/icons/toolbar/arrow-left.png';
        let iconsArrowRight = '/icons/toolbar/arrow-right.png';
        let iconsDocument = '/icons/toolbar/document.png';
        let iconsEditor = '/icons/toolbar/editor.png';
        let iconsGithubSignin = '/icons/toolbar/github-signin.png';
        let iconsLayout = '/icons/toolbar/layout.png';
        let iconsResponsive = '/icons/toolbar/responsive.png';
        let iconsZoomIn = '/icons/toolbar/zoom-in.png';
        let iconsZoomOut = '/icons/toolbar/zoom-out.png';

        ////////////////////////////////////////////////////////////////////////
        // View selection
        ////////////////////////////////////////////////////////////////////////

        const viewSelectorMenu = appendDivTo(this.element, { class: `vrv-menu` });
        this.viewSelector = appendDivTo(viewSelectorMenu, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsLayout})` }, 'data-before': `View` });
        const viewSelectorSubmenuContent = appendDivTo(viewSelectorMenu, { class: `vrv-menu-content` });
        appendDivTo(viewSelectorSubmenuContent, { class: `vrv-v-separator` });

        let viewCount = 0;
        if (this.app.options.enableDocument) {
            this.viewDocument = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsDocument})` }, 'data-before': `Document` });
            this.viewDocument.dataset.view = 'document';
            this.app.eventManager.bind(this.viewDocument, 'click', this.app.setView);
            viewCount += 1;
        }

        if (this.app.options.enableResponsive) {
            this.viewResponsive = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsResponsive})` }, 'data-before': `Responsive` });
            this.viewResponsive.dataset.view = 'responsive';
            viewSelectorSubmenuContent.appendChild(this.viewResponsive);
            this.app.eventManager.bind(this.viewResponsive, 'click', this.app.setView);
            viewCount += 1;
        }

        if (this.app.options.enableEditor) {
            this.viewEditor = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsEditor})` }, 'data-before': `Editor` });
            this.viewEditor.dataset.view = 'editor';
            viewSelectorSubmenuContent.appendChild(this.viewEditor);
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

        fileMenuContent.appendChild(elt('div', { class: `vrv-v-separator` }));

        const fileExportPDF = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export as PDF` });
        this.app.eventManager.bind(fileExportPDF, 'click', this.app.fileExportPDF);

        const fileExportMIDI = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export as MIDI` });
        this.app.eventManager.bind(fileExportMIDI, 'click', this.app.fileExportMIDI);

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
        // XML Editor
        ////////////////////////////////////////////////////////////////////////

        this.xmlMenu = appendDivTo(this.element, { class: `vrv-menu`, style: { display: `none` } });
        appendDivTo(this.xmlMenu, { class: `vrv-btn-text`, 'data-before': `XML editor` });
        const xmlMenuContent = appendDivTo(this.xmlMenu, { class: `vrv-menu-content` });
        appendDivTo(xmlMenuContent, { class: `vrv-v-separator` });

        this.xmlOverwriteMEI = appendDivTo(xmlMenuContent, { class: `vrv-menu-text`, 'data-before': `Overwrite XML editor data` });
        this.app.eventManager.bind(this.xmlOverwriteMEI, 'click', this.app.xmlOverwriteMEI);

        this.xmlOverwriteMEINoIds = appendDivTo(xmlMenuContent, { class: `vrv-menu-text`, 'data-before': `Overwrite XML editor data (without ids)` });
        this.xmlOverwriteMEINoIds.dataset.noIds = "true";
        this.app.eventManager.bind(this.xmlOverwriteMEINoIds, 'click', this.app.xmlOverwriteMEI);

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
        // Help
        ////////////////////////////////////////////////////////////////////////

        appendDivTo(this.element, { class: `vrv-h-separator` });

        const helpMenu = appendDivTo(this.element, { class: `vrv-menu` });
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
        appendDivTo(this.loginGroup, { class: `vrv-h-separator` });

        this.logout = appendDivTo(this.loginGroup, { class: `vrv-btn-text`, style: { display: `none` }, 'data-before': `Logout` });
        this.app.eventManager.bind(this.logout, 'click', this.app.logout);

        this.login = appendDivTo(this.loginGroup, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsGithubSignin})` }, 'data-before': `Github` } );
        this.app.eventManager.bind( this.login, 'click', this.app.login );

        // Bindings for hiding menu once an item has be click - the corresponding class is
        // removed when the toolbar is moused over

        for ( const node of this.element.querySelectorAll( 'div.vrv-menu' ) ) 
        {
            this.eventManager.bind( node, 'mouseover', this.onMouseOver );
        }

        for ( const node of this.element.querySelectorAll( 'div.vrv-menu-text' ) ) 
        {
            this.eventManager.bind( node, 'click', this.onClick );
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateAll()
    {
        this.updateToolbarBtn( this.prevPage, ( this.app.toolbarView.currentPage > 1 ) );
        this.updateToolbarBtn( this.nextPage, ( this.app.toolbarView.currentPage < this.app.pageCount ) );
        this.updateToolbarBtn( this.zoomOut, ( ( this.app.pageCount > 0 ) && ( this.app.toolbarView.currentZoomIndex > 0 ) ) );
        this.updateToolbarBtn( this.zoomIn, ( ( this.app.pageCount > 0 ) && ( this.app.toolbarView.currentZoomIndex < this.app.zoomLevels.length - 1 ) ) );

        let isResponsive = ( ( this.app.view instanceof ResponsiveView ) && !( this.app.view instanceof EditorPanel ) );
        let isEditor = ( this.app.view instanceof EditorPanel );
        let isDocument = ( this.app.view instanceof DocumentView );

        this.updateToolbarGrp( this.pageControls, !isDocument );

        this.updateToolbarGrp( this.midiPlayerSubToolbar, isResponsive );
        this.updateToolbarGrp( this.editorSubToolbar, isEditor );

        this.updateToolbarSubmenuBtn( this.viewDocument, isDocument );
        this.updateToolbarSubmenuBtn( this.viewResponsive, isResponsive );
        this.updateToolbarSubmenuBtn( this.viewEditor, isEditor );

        this.updateToolbarBtnHide( this.xmlMenu, isEditor );

        if ( this.app.githubManager.isLoggedIn() )
        {
            this.githubMenu.style.display = 'block';
            this.updateToolbarBtnHide( this.logout, true);
            this.login.setAttribute( "data-before", this.app.githubManager.name );    
            this.login.classList.add( "inactivated" );
        }

        this.updateRecent();
    }

    updateRecent()
    {
        this.subSubMenu.innerHTML = "";

        let fileList = this.app.fileStack.fileList();
        for ( let i = 0; i < fileList.length; i++ )
        {
            const entry = appendDivTo( this.subSubMenu, { class: `vrv-menu-text`, 'data-before': fileList[i][1] } );
            entry.dataset.idx = fileList[i][0];
            this.app.eventManager.bind( entry, 'click', this.app.fileLoadRecent );
            this.eventManager.bind( entry, 'click', this.onClick );
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Mouse methods
    ////////////////////////////////////////////////////////////////////////

    onMouseOver( e: CustomEvent )
    {
        for ( const node of this.element.querySelectorAll( 'div.vrv-menu-content' ) ) 
        {
            // Hide the menu content
            node.classList.remove( "clicked" );
        }
    }

    onClick( e: CustomEvent )
    {
        for ( const node of this.element.querySelectorAll( 'div.vrv-menu-content' ) ) 
        {
            // Remove the class so the menu content is shown again with a hover
            node.classList.add( "clicked" );
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate( e: CustomEvent )
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("AppToolbar::onActivate");

        this.updateAll();

        return true;
    }

    onEndLoading( e: CustomEvent )
    {
        if ( !super.onEndLoading( e ) ) return false;
        //console.debug("AppToolbar::onEndLoading");

        this.updateAll();

        return true;
    }

    onStartLoading( e: CustomEvent )
    {
        if ( !super.onStartLoading( e ) ) return false;
        //console.debug("AppToolbar:onStartLoading");

        this.updateToolbarBtn( this.prevPage, false );
        this.updateToolbarBtn( this.nextPage, false );
        this.updateToolbarBtn( this.zoomOut, false );
        this.updateToolbarBtn( this.zoomIn, false );

        return true;
    }

    onUpdateView( e: CustomEvent )
    {
        if ( !super.onUpdateView( e ) ) return false;
        //console.debug("AppToolbar::onUpdate");

        this.updateAll();

        return true;
    }
}
