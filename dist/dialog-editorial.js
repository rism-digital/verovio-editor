/**
 * The DialogEditorial class for applying editorial markup selectors.
 */
import { Dialog } from './dialog.js';
import { appendDivTo, appendInputTo } from './utils/functions.js';
export class DialogEditorial extends Dialog {
    constructor(div, app, title, options, editorial) {
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
        if (editorial["appXPathQuery"])
            this.appXPathQuery.value = editorial["appXPathQuery"];
        if (editorial["choiceXPathQuery"])
            this.choiceXPathQuery.value = editorial["choiceXPathQuery"];
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    ok() {
        this.editorial["appXPathQuery"] = this.appXPathQuery.value;
        this.editorial["choiceXPathQuery"] = this.choiceXPathQuery.value;
        super.ok();
    }
    reset() {
        this.editorial = {};
        super.ok();
    }
}
//# sourceMappingURL=dialog-editorial.js.map