/**
 * The DialogOptions class for setting specific options.
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
import { Dialog } from './dialog.js';
import { appendDivTo, appendInputTo, appendOptionTo, appendSelectTo, appendSpanTo } from './utils/functions.js';
const VEROVIO_DISABLED_OPTIONS = [
    // Input and page layout options
    "adjustPageHeight",
    "adjustPageWidth",
    "breaks",
    "breaksSmartSb",
    "humType",
    "justifyVertically",
    "landscape",
    "mmOutput",
    "outputFormatRaw",
    "outputIndent",
    "outputIndentTab",
    "pageHeight",
    "pageMarginLeft",
    "pageMarginRight",
    "pageMarginTop",
    "pageMarginBottom",
    "pageWidth",
    "removeIds",
    "scaleToPageSize",
    "setLocale",
    "showRuntime",
    "shrinkToFit",
    "svgBoundingBoxes",
    "svgFormatRaw",
    "svgRemoveXlink",
    "svgViewBox",
    // General layout options
    "breaksNoWidow",
    "engravingDefaults",
    "fontLoadAll",
    "systemMaxPerPage",
    // Element selectors and processing
    "transposeMdiv"
];
export class DialogSettingsVerovio extends Dialog {
    constructor(div, app, title, options, selection, verovioProxy) {
        super(div, app, title, options);
        this.verovioDisabled = VEROVIO_DISABLED_OPTIONS;
        this.verovio = verovioProxy;
        this.tab = appendDivTo(this.content, { class: `vrv-dialog-tabs` });
        this.tabs = new Array();
        this.box.style.maxWidth = `800px`;
        this.addButton("Reset", this.reset);
    }
    loadOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get object describing the available options
            const availableOptions = yield this.verovio.getAvailableOptions();
            console.log(availableOptions);
            // Get the default and current options
            this.defaultOptions = yield this.verovio.getDefaultOptions();
            this.currentOptions = yield this.verovio.getOptions();
            // Map for shorter tab names
            let tabNames = {
                "1-general": "General",
                "2-generalLayout": "Layout",
                "3-selectors": "Selectors",
                "5-midi": "MIDI",
                "6-mensural": "Mensural",
            };
            // Sections to skip
            let skip = ["0-base", "4-elementMargins", "7-methodJson"];
            for (const groupKey in availableOptions.groups) {
                // Some options to skip because they make no sense in the editor
                if (skip.includes(groupKey))
                    continue;
                const group = availableOptions.groups[groupKey];
                // Add a div for the option form and the option form
                let content = appendDivTo(this.content, { class: `vrv-dialog-tab-selected selected` });
                let fields = appendDivTo(content, { class: `vrv-dialog-form` });
                let tab = new Tab(this, content, tabNames[groupKey], groupKey);
                // Select the first tab
                (this.tabs.length === 0) ? tab.select() : tab.deselect();
                this.tabs.push(tab);
                for (const optionKey in group.options) {
                    if (this.verovioDisabled.includes(optionKey))
                        continue;
                    const option = group.options[optionKey];
                    const defaultValue = this.defaultOptions[optionKey];
                    const currentValue = this.currentOptions[optionKey];
                    const label = appendDivTo(fields, { class: `vrv-dialog-label` });
                    label.innerHTML = option.title;
                    const tooltip = appendSpanTo(label, { class: `tooltip` });
                    tooltip.innerHTML = option.description;
                    let input;
                    if (option.type === 'bool') {
                        input = appendInputTo(fields, { class: `vrv-dialog-input`, type: `checkbox` });
                        if (currentValue === true)
                            input.checked = true;
                    }
                    else if (option.type === 'int') {
                        input = appendInputTo(fields, { class: `vrv-dialog-input`, type: `number`, step: `1` });
                        input.value = currentValue;
                    }
                    else if (option.type === 'double') {
                        input = appendInputTo(fields, { class: `vrv-dialog-input`, type: `number`, step: `0.01` });
                        input.value = currentValue;
                    }
                    else if (option.type === 'std::string-list') {
                        input = appendSelectTo(fields, { class: `vrv-dialog-input` });
                        for (const valueKey in option.values) {
                            const value = option.values[valueKey];
                            let optionVal = appendOptionTo(input, { value: `${value}` });
                            optionVal.innerText = value;
                            if (currentValue === value)
                                optionVal.selected = true;
                        }
                    }
                    // For now also treat array as single string
                    else {
                        input = appendInputTo(fields, { class: `vrv-dialog-input` });
                        input.value = currentValue;
                        //input.placeholder = "Measure range (e.g., '2-10')";
                    }
                    input.name = optionKey;
                    // Comparison for array via stringified values
                    const nonDefault = (option.type === 'array') ? (JSON.stringify(currentValue) !== JSON.stringify(defaultValue)) : (currentValue !== defaultValue);
                    if (nonDefault)
                        input.classList.add(`non-default`);
                }
            }
        });
    }
    diffOptions(options, reset) {
        const inputs = this.content.querySelectorAll('.vrv-dialog-input');
        const values = {};
        inputs.forEach(element => {
            const input = element;
            const label = input.name;
            let value;
            if (input.type === 'checkbox') {
                value = input.checked;
            }
            else {
                value = input.value;
            }
            let changed = false;
            const expectedType = typeof options[label];
            // For array field, set empty string into empty arrays and compare as stringified values
            if (Array.isArray(options[label])) {
                value = (value === "") ? [] : String(value).split('\n');
                changed = (JSON.stringify(value) !== JSON.stringify(options[label]));
            }
            else {
                if (expectedType === 'number') {
                    value = Number(value);
                }
                else if (expectedType !== 'boolean') {
                    value = String(value);
                }
                changed = (options[label] !== value);
            }
            // When reset, use options (i.e., defaultOptions) as value being changed (back to default)
            if (changed)
                values[label] = (reset) ? options[label] : value;
        });
        return values;
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    selectTab(e) {
        const element = e.target;
        let selectedTab = this.tabs[0];
        this.tabs.forEach(tab => {
            tab.deselect();
            if (element.dataset.tab === tab.tabId)
                selectedTab = tab;
        });
        selectedTab.select();
    }
    ok() {
        this.changedOptions = this.diffOptions(this.currentOptions, false);
        // trigger reload only if something has changed
        (Object.keys(this.changedOptions).length === 0) ? super.cancel() : super.ok();
    }
    reset() {
        this.changedOptions = this.diffOptions(this.defaultOptions, true);
        // trigger reload only if something has changed
        (Object.keys(this.changedOptions).length === 0) ? super.cancel() : super.ok();
    }
}
class Tab {
    constructor(dialog, content, label, id) {
        this.tabId = id;
        this.tab = appendDivTo(dialog.tab, { class: `vrv-dialog-tab`, dataset: { tab: `${id}` } });
        this.tab.innerHTML = label;
        dialog.eventManager.bind(this.tab, 'click', dialog.selectTab);
        this.tabContent = content;
    }
    select() {
        this.tab.classList.add("selected");
        this.tabContent.style.display = 'block';
    }
    deselect() {
        this.tab.classList.remove("selected");
        this.tabContent.style.display = 'none';
    }
}
;
//# sourceMappingURL=dialog-settings-verovio.js.map