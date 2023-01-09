/**
 * The DialogGhImport class for navigating GitHub and selecting a file.
 */

import { App } from './app.js';
import { DialogGhImport } from './dialog-gh-import.js';
import { DialogOpts } from './dialog.js';
import { GitHubManager } from './github-manager.js';

import { appendDivTo, appendInputTo, appendTextAreaTo } from './utils/functions.js';

export class DialogGhExport extends DialogGhImport {
    fields: HTMLDivElement;
    inputFile: HTMLInputElement;
    inputMessage: HTMLTextAreaElement;

    constructor(div: HTMLDivElement, app: App, title: string, opts: DialogOpts, githubManager: GitHubManager) {
        opts.okLabel = 'Commit and push';

        super(div, app, title, opts, githubManager);

        this.okBtn.style.display = 'flex';
        this.okBtn.classList.add('disabled');

        this.fields = appendDivTo(this.content, { class: `vrv-dialog-form`, style: { 'display': `none` } });

        const labelFile = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelFile.innerHTML = "Filename";
        this.inputFile = appendInputTo(this.fields, { class: `vrv-dialog-input` });
        this.inputFile.placeholder = "Name of an existing or of a new file";
        this.eventManager.bind(this.inputFile, 'input', this.enableOk);

        const labelMessage = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelMessage.innerHTML = "Commit message";
        this.inputMessage = appendTextAreaTo(this.fields, { class: `vrv-dialog-input` });
        this.inputMessage.placeholder = "The commit message to be sent to GitHub";
        this.eventManager.bind(this.inputMessage, 'input', this.enableOk);
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateSelectionAndBreadcrumbs(): void {
        super.updateSelectionAndBreadcrumbs();
        if (this.githubManager.selectedBranchName === '') {
            this.fields.style.display = 'none';
        }
        else {
            this.fields.style.display = 'grid';
        }

    }

    async selectFile(e: MouseEvent): Promise<any> {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.type === 'dir') {
            if (element.dataset.name === '..') {
                this.githubManager.selectedPath.pop();
            }
            else {
                this.githubManager.appendToPath(element.dataset.name);
            }
            this.listFiles();
        }
        else {
            this.inputFile.value = element.dataset.name;
        }
    }

    isValid(): boolean {
        return (this.inputFile.value !== '' && this.inputMessage.value !== '');
    }

    enableOk(e: MouseEvent): void {
        this.okBtn.classList.toggle('disabled', !this.isValid());
    }

    ok(): void {
        if (!this.isValid()) return;

        const filename: string = this.githubManager.getPathString() + '/' + this.inputFile.value;
        const commitMsg: string = this.inputMessage.value;

        this.githubManager.writeFile(filename, commitMsg);

        super.ok();
    }

}
