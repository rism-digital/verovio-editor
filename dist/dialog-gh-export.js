/**
 * The DialogGhImport class for navigating GitHub and selecting a file.
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
import { DialogGhImport } from './dialog-gh-import.js';
import { appendDivTo, appendInputTo, appendTextAreaTo } from './utils/functions.js';
export class DialogGhExport extends DialogGhImport {
    constructor(div, app, title, options, githubManager) {
        options.okLabel = 'Commit and push';
        super(div, app, title, options, githubManager);
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
    updateSelectionAndBreadcrumbs() {
        super.updateSelectionAndBreadcrumbs();
        if (this.githubManager.selectedBranchName === '') {
            this.fields.style.display = 'none';
        }
        else {
            this.fields.style.display = 'grid';
        }
    }
    selectFile(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
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
        });
    }
    isValid() {
        return (this.inputFile.value !== '' && this.inputMessage.value !== '');
    }
    enableOk(e) {
        this.okBtn.classList.toggle('disabled', !this.isValid());
    }
    ok() {
        if (!this.isValid())
            return;
        const filename = this.githubManager.getPathString() + '/' + this.inputFile.value;
        const commitMsg = this.inputMessage.value;
        this.githubManager.writeFile(filename, commitMsg);
        super.ok();
    }
}
