/**
 * The DialogGhExport class for navigating GitHub and writing a file.
 */

import { App } from '../js/app.js';
import { Dialog, DialogOpts } from './dialog.js';
import { GitHubManager } from './github-manager.js';
import { appendDivTo } from './utils/functions.js';

const iconsBranch =  '/icons/dialog/branch.png';
const iconsInstitution =  '/icons/dialog/institution.png';
const iconsFile =  '/icons/dialog/file.png';
const iconsFolder =  '/icons/dialog/folder.png';
const iconsRepo =  '/icons/dialog/repo.png';
const iconsUser = '/icons/dialog/user.png';

interface ItemDataset {
    name?: string,
    login?: string,
    type?: string
}

export class DialogGhImport extends Dialog
{
    data: string | ArrayBuffer | Blob;
    filename: string;
    githubManager: GitHubManager;

    tabs: HTMLDivElement;
    tabUser: HTMLDivElement;
    tabRepo: HTMLDivElement;
    tabBranch: HTMLDivElement;
    tabFile: HTMLDivElement;
    loading: HTMLDivElement;
    list: HTMLDivElement;
    selection: HTMLDivElement;
    breadCrumbs: HTMLDivElement;


    constructor( div: HTMLDivElement, app: App, title: string, opts: DialogOpts, githubManager: GitHubManager )
    {
        super( div, app, title, opts );

        // output members
        this.data = null;
        this.filename = '';

        this.githubManager = githubManager;

        this.tabs = appendDivTo(this.content, { class: `vrv-dialog-tabs` } );

        this.tabUser = appendDivTo( this.tabs, { class: `vrv-dialog-tab active`, dataset: { tab: `user`} } );
        this.tabUser.innerHTML = 'User / Organisations';
        this.eventManager.bind( this.tabUser, 'click', this.selectTab );

        this.tabRepo = appendDivTo( this.tabs, { class: `vrv-dialog-tab`, dataset: { tab: `rep`} } );
        this.tabRepo.innerHTML = 'Repositories';
        this.eventManager.bind( this.tabRepo, 'click', this.selectTab );

        this.tabBranch = appendDivTo( this.tabs, { class: `vrv-dialog-tab`, dataset: { tab: `branch`} } );
        this.tabBranch.innerHTML = 'Branches';
        this.eventManager.bind( this.tabBranch, 'click', this.selectTab );

        this.tabFile = appendDivTo( this.tabs, { class: `vrv-dialog-tab`, dataset: { tab: `file`} } );
        this.tabFile.innerHTML = 'Files';
        this.eventManager.bind( this.tabFile, 'click', this.selectTab );

        this.loading = appendDivTo( this.content, { class: `vrv-dialog-gh-loading` } );
        this.list = appendDivTo( this.content, { class: `vrv-dialog-gh-list` } );
        this.selection = appendDivTo( this.content, { class: `vrv-dialog-gh-selection` } );
        this.breadCrumbs = appendDivTo( this.content, { class: `vrv-dialog-breadcrumbs` } );

        // Hide the OK button because the selection is done by clicking on a file
        this.okBtn.style.display = 'none';

        if ( this.githubManager.selectedBranchName !== '' )
        {
            this.listFiles();
        }
        else
        {
            this.listRepos();   
        }
    }

    loadingStart( tab: HTMLDivElement ): void
    {
        for ( const node of this.tabs.querySelectorAll( '.vrv-dialog-tab' ) )
        {
            node.classList.remove( "selected" );
        }
        tab.classList.add( "selected" );

        this.list.innerHTML = "";
        this.list.style.display = 'none';
        this.loading.style.display = 'block';
    }

    loadingEnd(): void
    {
        this.list.innerHTML = "";
        this.list.style.display = 'flex';
        this.loading.style.display = 'none';
    }

    addItemToList( name: string, icon: string, dataset: ItemDataset, checked: boolean, bind: Function ): void
    {
        const item: HTMLDivElement = appendDivTo( this.list, { class: `vrv-dialog-gh-item`, style: { backgroundImage: `url(${icon})` }, 'data-before': `${name}` } );
        const keys = Object.keys( dataset );;
        for ( let i = 0; i < keys.length; i++ )
        {
            item.dataset[keys[i]] = dataset[keys[i]];   
        }
        if ( checked ) item.classList.add( "checked" );
        this.eventManager.bind( item, 'click', bind );
    }

    updateSelectionAndBreadcrumbs(): void
    {
        this.selection.style.display = 'none';
        this.selection.innerHTML = '';
        this.selection.style.display = 'none';
        this.breadCrumbs.innerHTML = '';
        const icon: string = ( this.githubManager.selectedOrganization !== null ) ? iconsInstitution : iconsUser;
        if ( !this.addSelection( this.githubManager.selectedAccountName, icon ) ) return;
        if ( !this.addSelection( this.githubManager.selectedRepoName, iconsRepo ) ) return;
        if ( !this.addSelection( this.githubManager.selectedBranchName, iconsBranch ) ) return;
        const path: Array<string> = this.githubManager.selectedPath;
        if ( path.length < 2 ) return;
        this.breadCrumbs.style.display = 'flex';
        for ( let i = 0; i < path.length; i++ ) this.addCrumb( path[i], i + 1 );
    }

    addSelection( name: string, icon: string ): boolean
    {
        if ( name === '' ) return false;
        this.selection.style.display = 'flex';
        const selection: HTMLDivElement = appendDivTo( this.selection, { class: `vrv-dialog-gh-selection-item`, style: { backgroundImage: `url(${icon})` } } );
        selection.innerHTML = name;
        return true;
    }

    addCrumb( name: string, value: number ): void
    {
        const crumb: HTMLDivElement = appendDivTo( this.breadCrumbs, { class: `vrv-dialog-breadcrumb` } );
        crumb.innerHTML = name;
        crumb.dataset.value = value.toString();
        this.eventManager.bind( crumb, 'click', this.selectCrumb );
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    selectTab( e: MouseEvent ): void
    {
        const element: HTMLElement = e.target as HTMLElement;
        switch ( element.dataset.tab )
        {
            case ( 'user' ): this.listUsers(); break;
            case ( 'repo' ): this.listRepos(); break;
            case ( 'branch' ): this.listBranches(); break;
            case ( 'file' ): this.listFiles(); break;
        }
    }

    async listUsers(): Promise<any>
    {
        this.loadingStart( this.tabUser );
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

    async listRepos(): Promise<any>
    {
        this.loadingStart( this.tabRepo );
        let repos: any;
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

    async listBranches(): Promise<any>
    {
        if ( this.githubManager.selectedRepo === null )
        {   
            this.app.showNotification( "Select a repository first" );
            return;
        }

        this.loadingStart( this.tabBranch );
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

    async listFiles(): Promise<any>
    {
        if ( this.githubManager.selectedRepo === null )
        {   
            this.app.showNotification( "Select a repository first" );
            return;
        }

        this.loadingStart( this.tabFile );
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

    async selectUser( e: MouseEvent ): Promise<any>
    {
        const element: HTMLElement = e.target as HTMLElement;
        await this.githubManager.selectAccount(element.dataset.login);
        this.listRepos();
    }

    async selectRepo( e: MouseEvent): Promise<any>
    {
        const element: HTMLElement = e.target as HTMLElement; 
        await this.githubManager.selectRepo( element.dataset.name );
        this.listBranches();
    }

    async selectBranch( e: MouseEvent ): Promise<any>
    {
        const element: HTMLElement = e.target as HTMLElement;
        await this.githubManager.selectBranch(element.dataset.name);
        this.listFiles();
    }

    async selectFile( e: MouseEvent ): Promise<any>
    {
        const element: HTMLElement = e.target as HTMLElement;
        if ( element.dataset.type === 'dir' )
        {
            if ( element.dataset.name === '..' )
            {
                this.githubManager.selectedPath.pop();
            }
            else
            {
                this.githubManager.appendToPath( element.dataset.name );   
            }
            this.listFiles();
        }
        else
        {
            const branch = this.githubManager.selectedBranchName;
            const filename = this.githubManager.getPathString() + '/' + element.dataset.name;
            const contents = await this.githubManager.selectedRepo.getContents( branch, filename, true );
            this.data = contents.data;
            this.filename = element.dataset.name;
            this.ok();
        }
    }

    selectCrumb( e: MouseEvent ): void
    {
        const element: HTMLElement = e.target as HTMLElement;
        this.githubManager.slicePathTo( Number(element.dataset.value) );
        this.listFiles();
    }

}
