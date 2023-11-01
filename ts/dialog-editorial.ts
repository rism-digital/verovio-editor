/**
 * The DialogEditorial class for applying editorial markup selectors.
 */

import { App } from './app.js';
import { Dialog } from './dialog.js';
import { appendDivTo, appendInputTo } from './utils/functions.js';

export class DialogEditorial extends Dialog {
    fields: HTMLDivElement;
    appXPathQuery: HTMLInputElement;
    choiceXPathQuery: HTMLInputElement;
    editorial: Object;

    constructor(div: HTMLDivElement, app: App, title: string, options: Dialog.Options, editorial: Object) {
        super(div, app, title, options);

        this.addButton("Reset", this.reset);

        this.fields = appendDivTo(this.content, { class: `vrv-dialog-form` });

        const labelApp = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelApp.innerHTML = "App xPath selector";
        this.appXPathQuery = appendInputTo(this.fields, { class: `vrv-dialog-input` });
        this.appXPathQuery.placeholder = "App xPath (e.g., './rdg[@source=\"source1\"]'')";

        const labelChoice = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelChoice.innerHTML = "Choice xPath selector";
        this.choiceXPathQuery = appendInputTo(this.fields, { class: `vrv-dialog-input` });
        this.choiceXPathQuery.placeholder = "Choice xPath (e.g., './orig')";

        this.editorial = editorial;
        if (editorial["appXPathQuery"]) this.appXPathQuery.value = editorial["appXPathQuery"];
        if (editorial["choiceXPathQuery"]) this.choiceXPathQuery.value = editorial["choiceXPathQuery"];
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    ok(): void {
        this.editorial["appXPathQuery"] = this.appXPathQuery.value;
        this.editorial["choiceXPathQuery"] = this.choiceXPathQuery.value;
        super.ok();
    }

    reset(): void { 
        this.editorial = {};
        super.ok();
    }
}
