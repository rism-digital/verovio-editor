/**
 * The DialogSettinsEditor class for the editor settings.
 */

import { App } from './app.js';
import { Dialog } from './dialog.js';
import { appendDivTo, appendOptionTo, appendSelectTo } from './utils/functions.js';

export class DialogSettingsEditor extends Dialog {
    fields: HTMLDivElement;
    appOptions: App.Options;
    verovioVersion: HTMLSelectElement;
    reload: boolean;

    constructor(div: HTMLDivElement, app: App, title: string, options: Dialog.Options, appOptions: App.Options) {
        super(div, app, title, options);

        this.appOptions = appOptions;
        this.reload = false;

        this.addButton("Reset", this.reset);

        this.fields = appendDivTo(this.content, { class: `vrv-dialog-form` });

        const labelVerovioVersion = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelVerovioVersion.innerHTML = "Verovio version";
        this.verovioVersion = appendSelectTo(this.fields, { class: `vrv-dialog-input` });
        ["latest", "develop"].forEach(version => {
            let option = appendOptionTo(this.verovioVersion, {});
            option.value = version;
            option.innerHTML = version;
            if (appOptions.verovioVersion === version) option.selected = true;
        })
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    ok(): void {
        if (this.verovioVersion.value !== this.appOptions.verovioVersion) {
            this.reload = true;
        }
        this.appOptions.verovioVersion = this.verovioVersion.value;
        super.ok();
    }

    reset(): void { 
        super.ok();
    }
}
