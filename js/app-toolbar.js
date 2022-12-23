/**
 * The AppToolbar class is the implementation of the main application toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */

import { DocumentView } from './document-view.js';
import { EditorPanel } from './editor-panel.js';
import { ResponsiveView } from './responsive-view.js';
import { Toolbar } from '../js-dist/toolbar.js';

import { elt } from './utils/functions.js';

export class AppToolbar extends Toolbar
{
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
        this.ui.viewSelector = elt( 'div', { class: `vrv-btn-icon-left` } );
        this.ui.viewSelector.style.backgroundImage = `url(${ iconsLayout })`;
        this.ui.viewSelector.setAttribute( "data-before", "View" );
        viewSelectorMenu.appendChild( this.ui.viewSelector );
        const viewSelectorSubmenuContent = elt( 'div', { class: `vrv-menu-content` } );
        viewSelectorMenu.appendChild( viewSelectorSubmenuContent );
        viewSelectorSubmenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) )

        let viewCount = 0;
        if ( this.app.options.enableDocument )
        {
            this.ui.viewDocument = elt( 'div', { class: `vrv-menu-icon-left` } );
            this.ui.viewDocument.setAttribute( "data-before", "Document" );
            this.ui.viewDocument.style.backgroundImage = `url(${ iconsDocument })`;
            this.ui.viewDocument.dataset.view = 'document';
            viewSelectorSubmenuContent.appendChild( this.ui.viewDocument );
            this.app.eventManager.bind( this.ui.viewDocument, 'click', this.app.setView );
            viewCount += 1;
        }

        if ( this.app.options.enableResponsive )
        {
            this.ui.viewResponsive = elt( 'div', { class: `vrv-menu-icon-left` } );
            this.ui.viewResponsive.setAttribute( "data-before", "Responsive" );
            this.ui.viewResponsive.style.backgroundImage = `url(${ iconsResponsive })`;
            this.ui.viewResponsive.dataset.view = 'responsive';
            viewSelectorSubmenuContent.appendChild( this.ui.viewResponsive );
            this.app.eventManager.bind( this.ui.viewResponsive, 'click', this.app.setView );
            viewCount += 1;
        }

        if ( this.app.options.enableEditor )
        {
            this.ui.viewEditor = elt( 'div', { class: `vrv-menu-icon-left` } );
            this.ui.viewEditor.setAttribute( "data-before", "Editor" );
            this.ui.viewEditor.style.backgroundImage = `url(${ iconsEditor })`;
            this.ui.viewEditor.dataset.view = 'editor';
            viewSelectorSubmenuContent.appendChild( this.ui.viewEditor );
            this.app.eventManager.bind( this.ui.viewEditor, 'click', this.app.setView );
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
        this.ui.fileMenuBtn = elt( 'div', { class: `vrv-btn-text` } );
        this.ui.fileMenuBtn.setAttribute( "data-before", "File" );
        fileMenu.appendChild( this.ui.fileMenuBtn );
        const fileMenuContent = elt( 'div', { class: `vrv-menu-content` } );
        fileMenu.appendChild( fileMenuContent );
        fileMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        this.ui.fileImport = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.fileImport.setAttribute( "data-before", "Import MEI file" );
        this.ui.fileImport.dataset.ext = 'MEI';
        fileMenuContent.appendChild( this.ui.fileImport );
        this.app.eventManager.bind( this.ui.fileImport, 'click', this.app.fileImport );

        this.ui.fileImportMusicXML = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.fileImportMusicXML.setAttribute( "data-before", "Import MusicXML file" );
        this.ui.fileImportMusicXML.dataset.ext = 'MusicXML';
        fileMenuContent.appendChild( this.ui.fileImportMusicXML );
        this.app.eventManager.bind( this.ui.fileImportMusicXML, 'click', this.app.fileImport );

        const fileRecentSubMenu = elt( 'div', { class: `vrv-submenu` } );
        this.ui.fileRecents = elt( 'div', { class: `vrv-submenu-text` } );
        fileRecentSubMenu.appendChild( this.ui.fileRecents );
        this.ui.fileRecents.setAttribute( "data-before", "Recent files" );
        fileMenuContent.appendChild( fileRecentSubMenu );

        this.ui.subSubMenu = elt( 'div', { class: `vrv-submenu-content` } );
        fileRecentSubMenu.appendChild( this.ui.subSubMenu );

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

        this.ui.githubMenu = elt( 'div', { class: `vrv-menu` } );
        this.ui.githubMenu.style.display = 'none';
        this.element.appendChild( this.ui.githubMenu );
        const githubMenuBtn = elt( 'div', { class: `vrv-btn-text` } );
        githubMenuBtn.setAttribute( "data-before", "GitHub" );
        this.ui.githubMenu.appendChild( githubMenuBtn );
        const githubMenuContent = elt( 'div', { class: `vrv-menu-content` } );
        this.ui.githubMenu.appendChild( githubMenuContent );
        githubMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        this.ui.githubImport = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.githubImport.setAttribute( "data-before", "Import MEI file from GitHub" );
        githubMenuContent.appendChild( this.ui.githubImport );
        this.app.eventManager.bind( this.ui.githubImport, 'click', this.app.githubImport );

        this.ui.githubExport = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.githubExport.setAttribute( "data-before", "Export (commit/push) to GitHub" );
        githubMenuContent.appendChild( this.ui.githubExport );
        this.app.eventManager.bind( this.ui.githubExport, 'click', this.app.githubExport );

        ////////////////////////////////////////////////////////////////////////
        // XML Editor
        ////////////////////////////////////////////////////////////////////////

        this.ui.xmlMenu = elt( 'div', { class: `vrv-menu` } );
        this.ui.xmlMenu.style.display = 'none';
        this.element.appendChild( this.ui.xmlMenu );
        const xmlMenuBtn = elt( 'div', { class: `vrv-btn-text` } );
        xmlMenuBtn.setAttribute( "data-before", "XML editor" );
        this.ui.xmlMenu.appendChild( xmlMenuBtn );
        const xmlMenuContent = elt( 'div', { class: `vrv-menu-content` } );
        this.ui.xmlMenu.appendChild( xmlMenuContent );
        xmlMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        this.ui.xmlOverwriteMEI = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.xmlOverwriteMEI.setAttribute( "data-before", "Overwrite XML editor data" );
        xmlMenuContent.appendChild( this.ui.xmlOverwriteMEI );
        this.app.eventManager.bind( this.ui.xmlOverwriteMEI, 'click', this.app.xmlOverwriteMEI );

        this.ui.xmlOverwriteMEINoIds = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.xmlOverwriteMEINoIds.setAttribute( "data-before", "Overwrite XML editor data (without ids)" );
        this.ui.xmlOverwriteMEINoIds.dataset.noIds = true;
        xmlMenuContent.appendChild( this.ui.xmlOverwriteMEINoIds );
        this.app.eventManager.bind( this.ui.xmlOverwriteMEINoIds, 'click', this.app.xmlOverwriteMEI );

        /*
        this.ui.xmlIndent = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.xmlIndent.setAttribute( "data-before", "Indent XML" );
        xmlMenuContent.appendChild( this.ui.xmlIndent );
        this.app.eventManager.bind( this.ui.xmlIndent, 'click', this.app.xmlIndent );
        */

        ////////////////////////////////////////////////////////////////////////
        // Navigation
        ////////////////////////////////////////////////////////////////////////

        this.ui.pageControls = elt( 'div', { class: `vrv-btn-group` } );
        this.element.appendChild( this.ui.pageControls );
        this.ui.pageControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.ui.prevPage = elt( 'div', { class: `vrv-btn-icon-left` } );
        this.ui.prevPage.setAttribute( "data-before", "Previous" );
        this.ui.prevPage.style.backgroundImage = `url(${ iconsArrowLeft })`;
        this.ui.pageControls.appendChild( this.ui.prevPage );
        this.ui.nextPage = elt( 'div', { class: `vrv-btn-icon` } );
        this.ui.nextPage.setAttribute( "data-before", "Next" );
        this.ui.nextPage.style.backgroundImage = `url(${ iconsArrowRight })`;
        this.ui.pageControls.appendChild( this.ui.nextPage );

        this.app.eventManager.bind( this.ui.prevPage, 'click', this.app.prevPage );
        this.app.eventManager.bind( this.ui.nextPage, 'click', this.app.nextPage );

        ////////////////////////////////////////////////////////////////////////
        // Zoom
        ////////////////////////////////////////////////////////////////////////

        this.ui.zoomControls = elt( 'div', { class: `vrv-btn-group` } )
        this.element.appendChild( this.ui.zoomControls );
        this.ui.zoomControls.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );
        this.ui.zoomOut = elt( 'div', { class: `vrv-btn-icon` } );
        this.ui.zoomOut.setAttribute( "data-before", "Zoom out" );
        this.ui.zoomOut.style.backgroundImage = `url(${ iconsZoomOut })`;
        this.ui.zoomControls.appendChild( this.ui.zoomOut );
        this.ui.zoomIn = elt( 'div', { class: `vrv-btn-icon` } );
        this.ui.zoomIn.setAttribute( "data-before", "Zoom in" );
        this.ui.zoomIn.style.backgroundImage = `url(${ iconsZoomIn })`;
        this.ui.zoomControls.appendChild( this.ui.zoomIn );

        this.app.eventManager.bind( this.ui.zoomOut, 'click', this.app.zoomOut );
        this.app.eventManager.bind( this.ui.zoomIn, 'click', this.app.zoomIn );

        ////////////////////////////////////////////////////////////////////////
        // Sub-toolbars
        ////////////////////////////////////////////////////////////////////////

        this.ui.midiPlayerSubToolbar = elt( 'div', { class: `` } );
        this.element.appendChild( this.ui.midiPlayerSubToolbar );

        this.ui.editorSubToolbar = elt( 'div', { class: `` } );
        this.element.appendChild( this.ui.editorSubToolbar );

        ////////////////////////////////////////////////////////////////////////
        // Help
        ////////////////////////////////////////////////////////////////////////

        this.element.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );

        const helpMenu = elt( 'div', { class: `vrv-menu` } );
        this.element.appendChild( helpMenu );
        this.ui.helpMenuBtn = elt( 'div', { class: `vrv-btn-text` } );
        this.ui.helpMenuBtn.setAttribute( "data-before", "Help" );
        helpMenu.appendChild( this.ui.helpMenuBtn );
        const helpMenuContent = elt( 'div', { class: `vrv-menu-content` } );
        helpMenu.appendChild( helpMenuContent );
        helpMenuContent.appendChild( elt( 'div', { class: `vrv-v-separator` } ) );

        this.ui.helpAbout = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.helpAbout.setAttribute( "data-before", "About this application" );
        helpMenuContent.appendChild( this.ui.helpAbout );
        this.app.eventManager.bind( this.ui.helpAbout, 'click', this.app.helpAbout );

        this.ui.helpReset = elt( 'div', { class: `vrv-menu-text` } );
        this.ui.helpReset.setAttribute( "data-before", "Reset to default" );
        helpMenuContent.appendChild( this.ui.helpReset );
        this.app.eventManager.bind( this.ui.helpReset, 'click', this.app.helpReset );

        ////////////////////////////////////////////////////////////////////////
        // Login
        ////////////////////////////////////////////////////////////////////////

        this.ui.loginGroup = elt( 'div', { class: `vrv-btn-group-right` } );
        this.element.appendChild( this.ui.loginGroup );
        this.ui.loginGroup.appendChild( elt( 'div', { class: `vrv-h-separator` } ) );

        this.ui.logout = elt( 'div', { class: `vrv-btn-text` } );
        this.ui.logout.setAttribute( "data-before", "Logout" );
        this.ui.logout.style.display = 'none';
        this.ui.loginGroup.appendChild( this.ui.logout );
        this.app.eventManager.bind( this.ui.logout, 'click', this.app.logout );

        this.ui.login = elt( 'div', { class: `vrv-btn-icon` } );
        this.ui.login.setAttribute( "data-before", "GitHub" );
        this.ui.login.style.backgroundImage = `url(${ iconsGithubSignin })`;
        this.ui.loginGroup.appendChild( this.ui.login );
        this.app.eventManager.bind( this.ui.login, 'click', this.app.login );

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
        this.updateToolbarBtn( this.ui.prevPage, ( this.app.toolbarView.currentPage > 1 ) );
        this.updateToolbarBtn( this.ui.nextPage, ( this.app.toolbarView.currentPage < this.app.pageCount ) );
        this.updateToolbarBtn( this.ui.zoomOut, ( ( this.app.pageCount > 0 ) && ( this.app.toolbarView.currentZoomIndex > 0 ) ) );
        this.updateToolbarBtn( this.ui.zoomIn, ( ( this.app.pageCount > 0 ) && ( this.app.toolbarView.currentZoomIndex < this.app.zoomLevels.length - 1 ) ) );

        let isResponsive = ( ( this.app.view instanceof ResponsiveView ) && !( this.app.view instanceof EditorPanel ) );
        let isEditor = ( this.app.view instanceof EditorPanel );
        let isDocument = ( this.app.view instanceof DocumentView );

        this.updateToolbarGrp( this.ui.pageControls, !isDocument );

        this.updateToolbarGrp( this.ui.midiPlayerSubToolbar, isResponsive );
        this.updateToolbarGrp( this.ui.editorSubToolbar, isEditor );

        this.updateToolbarSubmenuBtn( this.ui.viewDocument, isDocument );
        this.updateToolbarSubmenuBtn( this.ui.viewResponsive, isResponsive );
        this.updateToolbarSubmenuBtn( this.ui.viewEditor, isEditor );

        this.updateToolbarBtnHide( this.ui.xmlMenu, isEditor );

        if ( this.app.githubManager.isLoggedIn() )
        {
            this.ui.githubMenu.style.display = 'block';
            this.updateToolbarBtnHide( this.ui.logout, true);
            this.ui.login.setAttribute( "data-before", this.app.githubManager.name );    
            this.ui.login.classList.add( "inactivated" );
        }

        this.updateRecent();
    }

    updateRecent()
    {
        this.ui.subSubMenu.innerHTML = "";

        let fileList = this.app.fileStack.fileList();
        for ( let i = 0; i < fileList.length; i++ )
        {
            const entry = elt( 'div', { class: `vrv-menu-text` } );
            entry.setAttribute( "data-before", fileList[i][1] );
            entry.dataset.idx = fileList[i][0];
            this.ui.subSubMenu.appendChild( entry );
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

        this.updateToolbarBtn( this.ui.prevPage, false );
        this.updateToolbarBtn( this.ui.nextPage, false );
        this.updateToolbarBtn( this.ui.zoomOut, false );
        this.updateToolbarBtn( this.ui.zoomIn, false );

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
