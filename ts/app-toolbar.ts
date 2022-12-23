/**
 * The AppToolbar class is the implementation of the main application toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */

import { DocumentView } from '../js/document-view.js';
import { EditorPanel } from '../js/editor-panel.js';
import { ResponsiveView } from '../js/responsive-view.js';
import { Toolbar } from './toolbar.js';

import { elt } from '../js/utils/functions.js';

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
    helpMenuBtn: HTMLDivElement;

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
    fileRecents: HTMLDivElement;
    githubImport: HTMLDivElement;
    githubExport: HTMLDivElement;

    constructor( div, app )
    {
        super( div, app );

        this.active = true;

        let iconsArrowLeft =  '/icons/toolbar/arrow-left.png';
        let iconsArrowRight =  '/icons/toolbar/arrow-right.png';
        let iconsDocument =  '/icons/toolbar/document.png';
        let iconsEditor =  '/icons/toolbar/editor.png';
        let iconsGithubSignin =  '/icons/toolbar/github-signin.png';
        let iconsLayout =  '/icons/toolbar/layout.png';
        let iconsResponsive =  '/icons/toolbar/responsive.png';
        let iconsZoomIn =  '/icons/toolbar/zoom-in.png';
        let iconsZoomOut =  '/icons/toolbar/zoom-out.png';

        ////////////////////////////////////////////////////////////////////////
        // View selection
        ////////////////////////////////////////////////////////////////////////

        const viewSelectorMenu = elt( 'div', { class: `vrv-menu` } );
        this.element.appendChild( viewSelectorMenu );
        this.viewSelector = elt( 'div', { class: `vrv-btn-icon-left` } );
        this.viewSelector.style.backgroundImage = `url(${ iconsLayout })`;
        this.viewSelector.setAttribute( "data-before", "View" );
        viewSelectorMenu.appendChild( this.viewSelector );
        const viewSelectorSubmenuContent = elt( 'div', { class: `vrv-menu-content` } );
        viewSelectorMenu.appendChild( viewSelectorSubmenuContent );
        viewSelectorSubmenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) )

        let viewCount = 0;
        if ( this.app.options.enableDocument )
        {
            this.viewDocument = elt( 'div', { class: `vrv-menu-icon-left` } );
            this.viewDocument.setAttribute( "data-before", "Document" );
            this.viewDocument.style.backgroundImage = `url(${ iconsDocument })`;
            this.viewDocument.dataset.view = 'document';
            viewSelectorSubmenuContent.appendChild( this.viewDocument );
            this.app.eventManager.bind( this.viewDocument, 'click', this.app.setView );
            viewCount += 1;
        }

        if ( this.app.options.enableResponsive )
        {
            this.viewResponsive = elt( 'div', { class: `vrv-menu-icon-left` } );
            this.viewResponsive.setAttribute( "data-before", "Responsive" );
            this.viewResponsive.style.backgroundImage = `url(${ iconsResponsive })`;
            this.viewResponsive.dataset.view = 'responsive';
            viewSelectorSubmenuContent.appendChild( this.viewResponsive );
            this.app.eventManager.bind( this.viewResponsive, 'click', this.app.setView );
            viewCount += 1;
        }

        if ( this.app.options.enableEditor )
        {
            this.viewEditor = elt( 'div', { class: `vrv-menu-icon-left` } );
            this.viewEditor.setAttribute( "data-before", "Editor" );
            this.viewEditor.style.backgroundImage = `url(${ iconsEditor })`;
            this.viewEditor.dataset.view = 'editor';
            viewSelectorSubmenuContent.appendChild( this.viewEditor );
            this.app.eventManager.bind( this.viewEditor, 'click', this.app.setView );
            viewCount += 1;
        }

        if ( viewCount === 1 )
        {
            viewSelectorMenu.style.display = 'none';
        }

        ////////////////////////////////////////////////////////////////////////
        // File
        ////////////////////////////////////////////////////////////////////////

        const fileMenu = elt( 'div', { class: `vrv-menu` } );
        this.element.appendChild( fileMenu );
        this.fileMenuBtn = elt( 'div', { class: `vrv-btn-text` } );
        this.fileMenuBtn.setAttribute( "data-before", "File" );
        fileMenu.appendChild( this.fileMenuBtn );
        const fileMenuContent = elt( 'div', { class: `vrv-menu-content` } );
        fileMenu.appendChild( fileMenuContent );
        fileMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        this.fileImport = elt( 'div', { class: `vrv-menu-text` } );
        this.fileImport.setAttribute( "data-before", "Import MEI file" );
        this.fileImport.dataset.ext = 'MEI';
        fileMenuContent.appendChild( this.fileImport );
        this.app.eventManager.bind( this.fileImport, 'click', this.app.fileImport );

        this.fileImportMusicXML = elt( 'div', { class: `vrv-menu-text` } );
        this.fileImportMusicXML.setAttribute( "data-before", "Import MusicXML file" );
        this.fileImportMusicXML.dataset.ext = 'MusicXML';
        fileMenuContent.appendChild( this.fileImportMusicXML );
        this.app.eventManager.bind( this.fileImportMusicXML, 'click', this.app.fileImport );

        const fileRecentSubMenu = elt( 'div', { class: `vrv-submenu` } );
        this.fileRecents = elt( 'div', { class: `vrv-submenu-text` } );
        fileRecentSubMenu.appendChild( this.fileRecents );
        this.fileRecents.setAttribute( "data-before", "Recent files" );
        fileMenuContent.appendChild( fileRecentSubMenu );

        this.subSubMenu = elt( 'div', { class: `vrv-submenu-content` } );
        fileRecentSubMenu.appendChild( this.subSubMenu );

        fileMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        const fileExport = elt( 'div', { class: `vrv-menu-text` } );
        fileExport.setAttribute( "data-before", "Export MEI file" );
        fileExport.dataset.ext = 'MEI';
        fileMenuContent.appendChild( fileExport );
        this.app.eventManager.bind( fileExport, 'click', this.app.fileExport );

        const fileCopy = elt( 'div', { class: `vrv-menu-text` } );
        fileCopy.setAttribute( "data-before", "Copy MEI to clipboard" );
        fileMenuContent.appendChild( fileCopy );
        this.app.eventManager.bind( fileCopy, 'click', this.app.fileCopyToClipboard );

        fileMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        const fileExportPDF = elt( 'div', { class: `vrv-menu-text` } );
        fileExportPDF.setAttribute( "data-before", "Export as PDF" );
        fileMenuContent.appendChild( fileExportPDF );
        this.app.eventManager.bind( fileExportPDF, 'click', this.app.fileExportPDF );

        const fileExportMIDI = elt( 'div', { class: `vrv-menu-text` } );
        fileExportMIDI.setAttribute( "data-before", "Export as MIDI" );
        fileMenuContent.appendChild( fileExportMIDI );
        this.app.eventManager.bind( fileExportMIDI, 'click', this.app.fileExportMIDI );

        ////////////////////////////////////////////////////////////////////////
        // GitHub
        ////////////////////////////////////////////////////////////////////////

        this.githubMenu = elt( 'div', { class: `vrv-menu` } );
        this.githubMenu.style.display = 'none';
        this.element.appendChild( this.githubMenu );
        const githubMenuBtn = elt( 'div', { class: `vrv-btn-text` } );
        githubMenuBtn.setAttribute( "data-before", "GitHub" );
        this.githubMenu.appendChild( githubMenuBtn );
        const githubMenuContent = elt( 'div', { class: `vrv-menu-content` } );
        this.githubMenu.appendChild( githubMenuContent );
        githubMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        this.githubImport = elt( 'div', { class: `vrv-menu-text` } );
        this.githubImport.setAttribute( "data-before", "Import MEI file from GitHub" );
        githubMenuContent.appendChild( this.githubImport );
        this.app.eventManager.bind( this.githubImport, 'click', this.app.githubImport );

        this.githubExport = elt( 'div', { class: `vrv-menu-text` } );
        this.githubExport.setAttribute( "data-before", "Export (commit/push) to GitHub" );
        githubMenuContent.appendChild( this.githubExport );
        this.app.eventManager.bind( this.githubExport, 'click', this.app.githubExport );

        ////////////////////////////////////////////////////////////////////////
        // XML Editor
        ////////////////////////////////////////////////////////////////////////

        this.xmlMenu = elt( 'div', { class: `vrv-menu` } );
        this.xmlMenu.style.display = 'none';
        this.element.appendChild( this.xmlMenu );
        const xmlMenuBtn = elt( 'div', { class: `vrv-btn-text` } );
        xmlMenuBtn.setAttribute( "data-before", "XML editor" );
        this.xmlMenu.appendChild( xmlMenuBtn );
        const xmlMenuContent = elt( 'div', { class: `vrv-menu-content` } );
        this.xmlMenu.appendChild( xmlMenuContent );
        xmlMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        this.xmlOverwriteMEI = elt( 'div', { class: `vrv-menu-text` } );
        this.xmlOverwriteMEI.setAttribute( "data-before", "Overwrite XML editor data" );
        xmlMenuContent.appendChild( this.xmlOverwriteMEI );
        this.app.eventManager.bind( this.xmlOverwriteMEI, 'click', this.app.xmlOverwriteMEI );

        this.xmlOverwriteMEINoIds = elt( 'div', { class: `vrv-menu-text` } );
        this.xmlOverwriteMEINoIds.setAttribute( "data-before", "Overwrite XML editor data (without ids)" );
        this.xmlOverwriteMEINoIds.dataset.noIds = "true";
        xmlMenuContent.appendChild( this.xmlOverwriteMEINoIds );
        this.app.eventManager.bind( this.xmlOverwriteMEINoIds, 'click', this.app.xmlOverwriteMEI );

        /*
        this.xmlIndent = elt( 'div', { class: `vrv-menu-text` } );
        this.xmlIndent.setAttribute( "data-before", "Indent XML" );
        xmlMenuContent.appendChild( this.xmlIndent );
        this.app.eventManager.bind( this.xmlIndent, 'click', this.app.xmlIndent );
        */

        ////////////////////////////////////////////////////////////////////////
        // Navigation
        ////////////////////////////////////////////////////////////////////////

        this.pageControls = elt( 'div', { class: `vrv-btn-group` } );
        this.element.appendChild( this.pageControls );
        this.pageControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.prevPage = elt( 'div', { class: `vrv-btn-icon-left` } );
        this.prevPage.setAttribute( "data-before", "Previous" );
        this.prevPage.style.backgroundImage = `url(${ iconsArrowLeft })`;
        this.pageControls.appendChild( this.prevPage );
        this.nextPage = elt( 'div', { class: `vrv-btn-icon` } );
        this.nextPage.setAttribute( "data-before", "Next" );
        this.nextPage.style.backgroundImage = `url(${ iconsArrowRight })`;
        this.pageControls.appendChild( this.nextPage );

        this.app.eventManager.bind( this.prevPage, 'click', this.app.prevPage );
        this.app.eventManager.bind( this.nextPage, 'click', this.app.nextPage );

        ////////////////////////////////////////////////////////////////////////
        // Zoom
        ////////////////////////////////////////////////////////////////////////

        this.zoomControls = elt( 'div', { class: `vrv-btn-group` } )
        this.element.appendChild( this.zoomControls );
        this.zoomControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.zoomOut = elt( 'div', { class: `vrv-btn-icon` } );
        this.zoomOut.setAttribute( "data-before", "Zoom out" );
        this.zoomOut.style.backgroundImage = `url(${ iconsZoomOut })`;
        this.zoomControls.appendChild( this.zoomOut );
        this.zoomIn = elt( 'div', { class: `vrv-btn-icon` } );
        this.zoomIn.setAttribute( "data-before", "Zoom in" );
        this.zoomIn.style.backgroundImage = `url(${ iconsZoomIn })`;
        this.zoomControls.appendChild( this.zoomIn );

        this.app.eventManager.bind( this.zoomOut, 'click', this.app.zoomOut );
        this.app.eventManager.bind( this.zoomIn, 'click', this.app.zoomIn );

        ////////////////////////////////////////////////////////////////////////
        // Sub-toolbars
        ////////////////////////////////////////////////////////////////////////

        this.midiPlayerSubToolbar = elt( 'div', { class: `` } );
        this.element.appendChild( this.midiPlayerSubToolbar );

        this.editorSubToolbar = elt( 'div', { class: `` } );
        this.element.appendChild( this.editorSubToolbar );

        ////////////////////////////////////////////////////////////////////////
        // Help
        ////////////////////////////////////////////////////////////////////////

        this.element.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );

        const helpMenu = elt( 'div', { class: `vrv-menu` } );
        this.element.appendChild( helpMenu );
        this.helpMenuBtn = elt( 'div', { class: `vrv-btn-text` } );
        this.helpMenuBtn.setAttribute( "data-before", "Help" );
        helpMenu.appendChild( this.helpMenuBtn );
        const helpMenuContent = elt( 'div', { class: `vrv-menu-content` } );
        helpMenu.appendChild( helpMenuContent );
        helpMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        this.helpAbout = elt( 'div', { class: `vrv-menu-text` } );
        this.helpAbout.setAttribute( "data-before", "About this application" );
        helpMenuContent.appendChild( this.helpAbout );
        this.app.eventManager.bind( this.helpAbout, 'click', this.app.helpAbout );

        this.helpReset = elt( 'div', { class: `vrv-menu-text` } );
        this.helpReset.setAttribute( "data-before", "Reset to default" );
        helpMenuContent.appendChild( this.helpReset );
        this.app.eventManager.bind( this.helpReset, 'click', this.app.helpReset );

        ////////////////////////////////////////////////////////////////////////
        // Login
        ////////////////////////////////////////////////////////////////////////

        this.loginGroup = elt( 'div', { class: `vrv-btn-group-right` } );
        this.element.appendChild( this.loginGroup );
        this.loginGroup.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );

        this.logout = elt( 'div', { class: `vrv-btn-text` } );
        this.logout.setAttribute( "data-before", "Logout" );
        this.logout.style.display = 'none';
        this.loginGroup.appendChild( this.logout );
        this.app.eventManager.bind( this.logout, 'click', this.app.logout );

        this.login = elt( 'div', { class: `vrv-btn-icon` } );
        this.login.setAttribute( "data-before", "GitHub" );
        this.login.style.backgroundImage = `url(${ iconsGithubSignin })`;
        this.loginGroup.appendChild( this.login );
        this.app.eventManager.bind( this.login, 'click', this.app.login );

        // Bindings for hidding menu once an item has be click - the correponding class is
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
            const entry = elt( 'div', { class: `vrv-menu-text` } );
            entry.setAttribute( "data-before", fileList[i][1] );
            entry.dataset.idx = fileList[i][0];
            this.subSubMenu.appendChild( entry );
            this.app.eventManager.bind( entry, 'click', this.app.fileLoadRecent );
            this.eventManager.bind( entry, 'click', this.onClick );
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Mouse methods
    ////////////////////////////////////////////////////////////////////////

    onMouseOver( e )
    {
        for ( const node of this.element.querySelectorAll( 'div.vrv-menu-content' ) ) 
        {
            // Hide the menu content
            node.classList.remove( "clicked" );
        }
    }

    onClick( e )
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

    onActivate( e )
    {
        if ( !super.onActivate( e ) ) return false;
        //console.debug("AppToolbar::onActivate");

        this.updateAll();

        return true;
    }

    onEndLoading( e )
    {
        if ( !super.onEndLoading( e ) ) return false;
        //console.debug("AppToolbar::onEndLoading");

        this.updateAll();

        return true;
    }

    onStartLoading( e )
    {
        if ( !super.onStartLoading( e ) ) return false;
        //console.debug("AppToolbar:onStartLoading");

        this.updateToolbarBtn( this.prevPage, false );
        this.updateToolbarBtn( this.nextPage, false );
        this.updateToolbarBtn( this.zoomOut, false );
        this.updateToolbarBtn( this.zoomIn, false );

        return true;
    }

    onUpdateView( e )
    {
        if ( !super.onUpdateView( e ) ) return false;
        //console.debug("AppToolbar::onUpdate");

        this.updateAll();

        return true;
    }
}
