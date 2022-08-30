/**
 * The DialogGhImport class for navigating GitHub and selecting a file.
 */

import { DialogGhImport } from './dialog-gh-import.js';

import { elt } from './utils/functions.js';

export class DialogGhExport extends DialogGhImport
{
    constructor( div, app, title, opts, githubManager )
    {
        opts.okLabel = 'Commit and push';

        super( div, app, title, opts, githubManager );

        this.ui.ok.style.display = 'flex';
        this.ui.ok.classList.add( 'disabled' );

        this.ui.fields = elt( 'div', { class: `vrv-dialog-form` } );
        this.ui.fields.style.display = 'none';
        this.ui.content.appendChild( this.ui.fields );
        
        const labelFile = elt( 'div', { class: `vrv-dialog-label` } );
        labelFile.innerHTML = "Filename";
        this.ui.fields.appendChild( labelFile );
        this.ui.inputFile = elt( 'input', { class: `vrv-dialog-input` } );
        this.ui.inputFile.placeholder = "Name of an existing or of a new file";
        this.eventManager.bind( this.ui.inputFile, 'input', this.enableOk );
        this.ui.fields.appendChild( this.ui.inputFile );
        
        const labelMessage = elt( 'div', { class: `vrv-dialog-label` } );
        labelMessage.innerHTML = "Commit message";
        this.ui.fields.appendChild( labelMessage );
        this.ui.inputMessage = elt( 'textarea', { class: `vrv-dialog-input` } );
        this.ui.inputMessage.placeholder = "The commit message to be sent to GitHub";
        this.eventManager.bind( this.ui.inputMessage, 'input', this.enableOk );
        this.ui.fields.appendChild( this.ui.inputMessage );
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateSelectionAndBreadcrumbs()
    {
        super.updateSelectionAndBreadcrumbs();
        if ( this.githubManager.selectedBranchName === '' )
        {
            this.ui.fields.style.display = 'none';            
        }
        else
        {
            this.ui.fields.style.display = 'grid';
        }

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
            this.ui.inputFile.value = e.target.dataset.name;
        }
    }

    isValid()
    {
        return ( this.ui.inputFile.value !== '' && this.ui.inputMessage.value !== '' );
    }

    enableOk( e ) 
    {
        this.ui.ok.classList.toggle( 'disabled', !this.isValid() );
    }

    ok()
    {
        if ( !this.isValid() ) return;

        const filename = this.githubManager.getPathString() + '/' + this.ui.inputFile.value;
        const commitMsg = this.ui.inputMessage.value;

        this.githubManager.writeFile( filename, commitMsg );

        super.ok();
    }

}
