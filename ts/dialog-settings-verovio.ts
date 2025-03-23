/**
 * The DialogOptions class for setting specific options.
 */

import { App } from './app.js';
import { Dialog } from './dialog.js';
import { appendDivTo, appendInputTo, appendOptionTo, appendSelectTo, appendSpanTo } from './utils/functions.js';
import { VerovioWorkerProxy } from "./worker-proxy.js";

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
    private verovio: VerovioWorkerProxy;
    private currentOptions: Options;
    private defaultOptions: Options;
    private verovioDisabled: Array<string>;
    changedOptions: Options;

    tab: HTMLDivElement;
    private tabs: Array<Tab>;

    constructor(div: HTMLDivElement, app: App, title: string, options: Dialog.Options, selection: Object, verovioProxy: VerovioWorkerProxy) {
        super(div, app, title, options);

        this.verovioDisabled = VEROVIO_DISABLED_OPTIONS;
        this.verovio = verovioProxy;

        this.tab = appendDivTo(this.content, { class: `vrv-dialog-tabs` });
        this.tabs = new Array();

        this.box.style.maxWidth = `800px`;

        this.addButton("Reset", this.reset);
    }

    async loadOptions() {
        // Get object describing the available options
        const availableOptions: AvailableOptions = await this.verovio.getAvailableOptions();
        console.log(availableOptions);
        // Get the default and current options
        this.defaultOptions = await this.verovio.getDefaultOptions();
        this.currentOptions = await this.verovio.getOptions();

        // Map for shorter tab names
        let tabNames = {
            "1-general": "General",
            "2-generalLayout": "Layout",
            "3-selectors": "Selectors",
            "5-midi": "MIDI",
            "6-mensural": "Mensural",
        }
        // Sections to skip
        let skip = ["0-base", "4-elementMargins", "7-methodJson"];

        for (const groupKey in availableOptions.groups) {
            // Some options to skip because they make no sense in the editor
            if (skip.includes(groupKey)) continue;

            const group = availableOptions.groups[groupKey];

            // Add a div for the option form and the option form
            let content = appendDivTo(this.content, { class: `vrv-dialog-tab-selected selected` });
            let fields = appendDivTo(content, { class: `vrv-dialog-form` });
            let tab = new Tab(this, content, tabNames[groupKey], groupKey);
            // Select the first tab
            (this.tabs.length === 0) ? tab.select() : tab.deselect();
            this.tabs.push(tab);

            for (const optionKey in group.options) {
                if (this.verovioDisabled.includes(optionKey)) continue;

                const option = group.options[optionKey];
                const defaultValue = this.defaultOptions[optionKey];
                const currentValue = this.currentOptions[optionKey];

                const label = appendDivTo(fields, { class: `vrv-dialog-label` });
                label.innerHTML = option.title;
                appendSpanTo(label, { class: `vrv-tooltip-label` }, option.description);

                let input;
                if (option.type === 'bool') {
                    input = appendInputTo(fields, { class: `vrv-dialog-input`, type: `checkbox` });
                    if (currentValue === true) input.checked = true;
                }
                else if (option.type === 'int') {
                    input = appendInputTo(fields, { class: `vrv-dialog-input`, type: `number`, step: `1` });
                    input.value = <string>currentValue;
                }
                else if (option.type === 'double') {
                    input = appendInputTo(fields, { class: `vrv-dialog-input`, type: `number`, step: `0.01` });
                    input.value = <string>currentValue;
                }
                else if (option.type === 'std::string-list') {
                    input = appendSelectTo(fields, { class: `vrv-dialog-input` });
                    for (const valueKey in option.values) {
                        const value = option.values[valueKey];
                        let optionVal = appendOptionTo(input, { value: `${value}` });
                        optionVal.innerText = value;
                        if (currentValue === value) optionVal.selected = true;
                    }
                }
                // For now also treat array as single string
                else {
                    input = appendInputTo(fields, { class: `vrv-dialog-input` });
                    input.value = <string>currentValue;
                    //input.placeholder = "Measure range (e.g., '2-10')";
                }

                input.name = optionKey;
                // Comparison for array via stringified values
                const nonDefault = (option.type === 'array') ? (JSON.stringify(currentValue) !== JSON.stringify(defaultValue)) : (currentValue !== defaultValue);
                if (nonDefault) input.classList.add(`non-default`);
            }
        }
    }

    diffOptions(options: Options, reset: boolean): Options {
        const inputs = this.content.querySelectorAll('.vrv-dialog-input');
        const values: Options = {};

        inputs.forEach(element => {
            const input = (element as HTMLInputElement);
            const label = input.name;

            let value: any;
            if (input.type === 'checkbox') {
                value = input.checked;
            } else {
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
                } else if (expectedType !== 'boolean') {
                    value = String(value);
                }
                changed = (options[label] !== value);
            }
            // When reset, use options (i.e., defaultOptions) as value being changed (back to default)
            if (changed) values[label] = (reset) ? options[label] : value;
        });
        return values;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    selectTab(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        let selectedTab = this.tabs[0];
        this.tabs.forEach(tab => {
            tab.deselect();
            if (element.dataset.tab === tab.tabId) selectedTab = tab;
        });
        selectedTab.select();
    }

    ok(): void {
        this.changedOptions = this.diffOptions(this.currentOptions, false);
        // trigger reload only if something has changed
        (Object.keys(this.changedOptions).length === 0) ? super.cancel() : super.ok();
    }

    reset(): void {
        this.changedOptions = this.diffOptions(this.defaultOptions, true);
        // trigger reload only if something has changed
        (Object.keys(this.changedOptions).length === 0) ? super.cancel() : super.ok();
    }
}

class Tab {
    tab: HTMLElement;
    tabContent: HTMLElement;
    tabId: string;


    constructor(dialog: DialogSettingsVerovio, content: HTMLDivElement, label: string, id: string) {
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

interface OptionDefinition {
    default: boolean | string | number | string[];
    description: string;
    title: string;
    type: string;
    values?: string[];
    max?: number;
    min?: number;
}

interface Group {
    name: string;
    options: Record<string, OptionDefinition>;
}

interface AvailableOptions {
    groups: Record<string, Group>;
}

interface Options {
    [key: string]: boolean | string | number | string[];
};
