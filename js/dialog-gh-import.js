/**
 * The DialogGhExport class for navigating GitHub and writing a file.
 */

import { Dialog } from '../js-dist/dialog.js';

import { elt } from './utils/functions.js';

const iconsBranch =  '/icons/dialog/branch.png';
const iconsInstitution =  '/icons/dialog/institution.png';
const iconsFile =  '/icons/dialog/file.png';
const iconsFolder =  '/icons/dialog/folder.png';
const iconsRepo =  '/icons/dialog/repo.png';
const iconsUser =  '/icons/dialog/user.png';

export class DialogGhImport extends Dialog
{
    constructor( div, app, title, opts, githubManager )
    {
        super( div, app, title, opts );

        // output members
        this.data = null;
        this.filename = '';

        this.githubManager = githubManager;

        this.ui.tabs = elt( 'div', { class: `vrv-dialog-tabs` } );
        this.ui.content.appendChild( this.ui.tabs );

        this.ui.tabUser = elt( 'div', { class: `vrv-dialog-tab active` } );
        this.ui.tabUser.innerHTML = 'User / Organisations';
        this.ui.tabUser.dataset.tab = 'user';
        this.ui.tabs.appendChild( this.ui.tabUser );
        this.eventManager.bind( this.ui.tabUser, 'click', this.selectTab );

        this.ui.tabRepo = elt( 'div', { class: `vrv-dialog-tab` } );
        this.ui.tabRepo.innerHTML = 'Repositories';
        this.ui.tabRepo.dataset.tab = 'repo';
        this.ui.tabs.appendChild( this.ui.tabRepo );
        this.eventManager.bind( this.ui.tabRepo, 'click', this.selectTab );

        this.ui.tabBranch = elt( 'div', { class: `vrv-dialog-tab` } );
        this.ui.tabBranch.innerHTML = 'Branches';
        this.ui.tabBranch.dataset.tab = 'branch';
        this.ui.tabs.appendChild( this.ui.tabBranch );
        this.eventManager.bind( this.ui.tabBranch, 'click', this.selectTab );

        this.ui.tabFile = elt( 'div', { class: `vrv-dialog-tab` } );
        this.ui.tabFile.innerHTML = 'Files';
        this.ui.tabFile.dataset.tab = 'file';
        this.ui.tabs.appendChild( this.ui.tabFile );
        this.eventManager.bind( this.ui.tabFile, 'click', this.selectTab );

        this.ui.loading = elt( 'div', { class: `vrv-dialog-gh-loading` } );
        this.ui.content.appendChild( this.ui.loading );

        this.ui.list = elt( 'div', { class: `vrv-dialog-gh-list` } );
        this.ui.content.appendChild( this.ui.list );

        this.ui.selection = elt( 'div', { class: `vrv-dialog-gh-selection` } );
        this.ui.content.appendChild( this.ui.selection );

        this.ui.breadCrumbs = elt( 'div', { class: `vrv-dialog-breadcrumbs` } );
        this.ui.content.appendChild( this.ui.breadCrumbs );

        // Hide the OK button because the selection is done by clicking on a file
        this.ui.ok.style.display = 'none';

        if ( this.githubManager.selectedBranchName !== '' )
        {
            this.listFiles();
        }
        else
        {
            this.listRepos();   
        }
    }

    loadingStart( tab )
    {
        for ( const node of this.ui.tabs.querySelectorAll( '.vrv-dialog-tab' ) )
        {
            node.classList.remove( "selected" );
        }
        tab.classList.add( "selected" );

        this.ui.list.innerHTML = "";
        this.ui.list.style.display = 'none';
        this.ui.loading.style.display = 'block';
    }

    loadingEnd()
    {
        this.ui.list.innerHTML = "";
        this.ui.list.style.display = 'flex';
        this.ui.loading.style.display = 'none';
    }

    addItemToList( name, icon, dataset, checked, bind )
    {
        const item = elt( 'div', { class: `vrv-dialog-gh-item` } );
        item.setAttribute( "data-before", name );
        item.style.backgroundImage = `url(${ icon })`;
        const keys = Object.keys( dataset );;
        for ( let i = 0; i < keys.length; i++ )
        {
            item.dataset[keys[i]] = dataset[keys[i]];   
        }
        if ( checked ) item.classList.add( "checked" );
        this.ui.list.appendChild( item );
        this.eventManager.bind( item, 'click', bind );
    }

    updateSelectionAndBreadcrumbs()
    {
        this.ui.selection.style.display = 'none';
        this.ui.selection.innerHTML = '';
        this.ui.selection.style.display = 'none';
        this.ui.breadCrumbs.innerHTML = '';
        const icon = ( this.githubManager.selectedOrganization !== null ) ? iconsInstitution : iconsUser;
        if ( !this.addSelection( this.githubManager.selectedAccountName, icon ) ) return;
        if ( !this.addSelection( this.githubManager.selectedRepoName, iconsRepo ) ) return;
        if ( !this.addSelection( this.githubManager.selectedBranchName, iconsBranch ) ) return;
        const path = this.githubManager.selectedPath;
        if ( path.length < 2 ) return;
        this.ui.breadCrumbs.style.display = 'flex';
        for ( let i = 0; i < path.length; i++ ) this.addCrumb( path[i], i + 1 );
    }

    addSelection( name, icon )
    {
        if ( name === '' ) return false;
        this.ui.selection.style.display = 'flex';
        const selection = elt( 'div', { class: `vrv-dialog-gh-selection-item` } );
        selection.innerHTML = name;
        selection.style.backgroundImage = `url(${ icon })`;
        this.ui.selection.appendChild( selection );
        return true;
    }

    addCrumb( name, value )
    {
        const crumb = elt( 'div', { class: `vrv-dialog-breadcrumb` } );
        crumb.innerHTML = name;
        crumb.dataset.value = value;
        this.ui.breadCrumbs.appendChild( crumb );
        this.eventManager.bind( crumb, 'click', this.selectCrumb );
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    selectTab( e )
    {
        switch ( e.target.dataset.tab )
        {
            case ( 'user' ): this.listUsers(); break;
            case ( 'repo' ): this.listRepos(); break;
            case ( 'branch' ): this.listBranches(); break;
            case ( 'file' ): this.listFiles(); break;
        }
    }

    async listUsers()
    {
        this.loadingStart( this.ui.tabUser );
        const orgs = await this.githubManager.user.listOrgs();
        this.loadingEnd();

        const userChecked = ( this.githubManager.selectedAccountName === this.githubManager.login );
        this.addItemToList( this.githubManager.login, iconsUser, { login: this.githubManager.login }, userChecked, this.selectUser );
        for ( let i = 0; i < orgs.data.length; i++ )
        {
            const login = orgs.data[i].login;
            const checked = ( this.githubManager.selectedAccountName === login )
            this.addItemToList( login, iconsInstitution, { login: login }, checked, this.selectUser );
        }   
        
        this.updateSelectionAndBreadcrumbs();
    }

    async listRepos()
    {
        this.loadingStart( this.ui.tabRepo );
        let repos;
        if ( this.githubManager.selectedOrganization !== null ) {
            repos = await this.githubManager.selectedOrganization.getRepos();
        }
        else {
            repos = await this.githubManager.selectedUser.listRepos( { type: 'owner' } );
        }
        repos.data.sort( ( a, b ) => ( a.name > b.name ) ? 1 : -1 )
        this.loadingEnd();
        for ( let i = 0; i < repos.data.length; i++ )
        {
            const name = repos.data[i].name;
            const checked = ( this.githubManager.selectedRepoName === name );
            this.addItemToList( name, iconsRepo, { name: name }, checked, this.selectRepo );
        }

        this.updateSelectionAndBreadcrumbs();
    }

    async listBranches()
    {
        if ( this.githubManager.selectedRepo === null )
        {   
            this.app.showNotification( "Select a repository first" );
            return;
        }

        this.loadingStart( this.ui.tabBranch );
        const branches = await this.githubManager.selectedRepo.listBranches();
        branches.data.sort( ( a, b ) => ( a.name > b.name ) ? 1 : -1 )
        this.loadingEnd();
        for ( let i = 0; i < branches.data.length; i++ )
        {
            const name = branches.data[i].name;
            const checked = ( this.githubManager.selectedBranchName === name );
            this.addItemToList( name, iconsBranch, { name: name }, checked, this.selectBranch );
        }

        this.updateSelectionAndBreadcrumbs();
    }

    async listFiles()
    {
        if ( this.githubManager.selectedRepo === null )
        {   
            this.app.showNotification( "Select a repository first" );
            return;
        }

        this.loadingStart( this.ui.tabFile );
        const branch = this.githubManager.selectedBranchName;
        const path = this.githubManager.getPathString();
        const contents = await this.githubManager.selectedRepo.getContents( branch, path );
        contents.data.sort((a, b) => (a.type > b.type) ? 1 : -1)
        this.loadingEnd();

        if ( this.githubManager.selectedPath.length > 1 )
        {
            this.addItemToList( '..', iconsFolder, { name: '..', type: 'dir' }, false, this.selectFile );
        }

        for ( let i = 0; i < contents.data.length; i++ )
        {
            const name = contents.data[i].name;
            const type = contents.data[i].type;
            const icon = ( type === 'dir' ) ? iconsFolder : iconsFile;
            this.addItemToList( name, icon, { name: name, type: type }, false, this.selectFile );
        }

        this.updateSelectionAndBreadcrumbs();
    }

    async selectUser( e )
    {
        //console.log( e.target.dataset );
        await this.githubManager.selectAccount( e.target.dataset.login );
        this.listRepos();
    }

    async selectRepo( e )
    {
        //console.log( e.target.dataset );  
        await this.githubManager.selectRepo( e.target.dataset.name );
        this.listBranches();
    }

    async selectBranch( e )
    {
        //console.log( e.target.dataset );   
        await this.githubManager.selectBranch( e.target.dataset.name );
        this.listFiles();
    }

    async selectFile( e )
    {
        //console.log( e.target.dataset );
        if ( e.target.dataset.type === 'dir' )
        {
            if ( e.target.dataset.name === '..' )
            {
                this.githubManager.selectedPath.pop();
            }
            else
            {
                this.githubManager.appendToPath( e.target.dataset.name );   
            }
            this.listFiles();
        }
        else
        {
            const branch = this.githubManager.selectedBranchName;
            const filename = this.githubManager.getPathString() + '/' + e.target.dataset.name;
            const contents = await this.githubManager.selectedRepo.getContents( branch, filename, true );
            this.data = contents.data;
            this.filename = e.target.dataset.name;
            this.ok();
        }
    }

    selectCrumb( e )
    {
        this.githubManager.slicePathTo( e.target.dataset.value );
        this.listFiles();
    }

}
