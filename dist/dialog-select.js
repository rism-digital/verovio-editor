/**
 * The DialogSelect class for selecting a part of a score.
 */
import { Dialog } from './dialog.js';
import { appendDivTo, appendInputTo } from './utils/functions.js';
export class DialogSelect extends Dialog {
    constructor(div, app, title, options, selection) {
        super(div, app, title, options);
        this.addButton("Reset", this.reset);
        this.fields = appendDivTo(this.content, { class: `vrv-dialog-form` });
        const labelMeasureRange = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelMeasureRange.innerHTML = "Measure range";
        this.selectMeasureRange = appendInputTo(this.fields, { class: `vrv-dialog-input` });
        this.selectMeasureRange.placeholder = "Measure range (e.g., '2-10')";
        const labelStart = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelStart.innerHTML = "Start";
        this.selectStart = appendInputTo(this.fields, { class: `vrv-dialog-input` });
        this.selectStart.placeholder = "Start measure xml:id";
        const labelEnd = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelEnd.innerHTML = "End";
        this.selectEnd = appendInputTo(this.fields, { class: `vrv-dialog-input` });
        this.selectEnd.placeholder = "End measure xml:id";
        this.selection = selection;
        if (selection["measureRange"])
            this.selectMeasureRange.value = selection["measureRange"];
        else {
            if (selection["start"])
                this.selectStart.value = selection["start"];
            if (selection["end"])
                this.selectStart.value = selection["end"];
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    ok() {
        if (this.selectMeasureRange.value !== '') {
            this.selection["measureRange"] = this.selectMeasureRange.value;
        }
        else {
            this.selection["start"] = this.selectStart.value;
            this.selection["end"] = this.selectEnd.value;
        }
        super.ok();
    }
    reset() {
        this.selection = {};
        super.ok();
    }
}
