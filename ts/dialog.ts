/**
 * The Dialog class is the based class for other dialog implementations.
 * It should not be instantiated directly but only through inherited classes.
 */

import { App } from './app.js';
import { Deferred } from './deferred.js';
import { EventManager } from './event-manager.js';

import { appendDivTo } from './utils/functions.js';

export interface DialogOpts {
    icon?: string;
    type?: DialogType;
    okLabel?: string;
    cancelLabel?: string;
}

export class Dialog {
    app: App;
    eventManager: EventManager;
    element: HTMLDivElement;
    options: DialogOpts;
    deferred: Deferred;

    box: HTMLDivElement;
    top: HTMLDivElement;
    icon: HTMLDivElement;
    close: HTMLDivElement;
    content: HTMLDivElement;
    bottom: HTMLDivElement;
    cancelBtn: HTMLDivElement;
    okBtn: HTMLDivElement;

    boundKeyDown: { (event: KeyboardEvent): void };

    constructor(div: HTMLDivElement, app: App, title: string, opts: DialogOpts) {
        this.options = Object.assign({
            icon: "info",
            type: DialogType.OKCancel,
            okLabel: "OK",
            cancelLabel: "Cancel"
        }, opts);

        this.element = div;
        // Remove previous content
        this.element.innerHTML = "";

        this.app = app;

        this.eventManager = new EventManager(this);
        this.bindListeners(); // Document/Window-scoped events

        // Create the HTML content
        this.box = appendDivTo(this.element, { class: `vrv-dialog-box` });

        // The top of the dialog
        this.top = appendDivTo(this.box, { class: `vrv-dialog-top` });

        this.icon = appendDivTo(this.top, { class: `vrv-dialog-icon` });
        this.icon.classList.add(this.options.icon);

        const titleDiv = appendDivTo(this.top, { class: `vrv-dialog-title` });
        titleDiv.innerHTML = title;
        this.close = appendDivTo(this.top, { class: `vrv-dialog-close` });

        // The content of the dialog
        this.content = appendDivTo(this.box, { class: `vrv-dialog-content` });

        // The bottom of the dialog with buttons
        this.bottom = appendDivTo(this.box, { class: `vrv-dialog-bottom` });

        this.cancelBtn = appendDivTo(this.bottom, { class: `vrv-dialog-btn`, 'data-before': this.options.cancelLabel });
        this.okBtn = appendDivTo(this.bottom, { class: `vrv-dialog-btn`, 'data-before': this.options.okLabel });

        this.eventManager.bind(this.close, 'click', this.cancel);
        this.eventManager.bind(this.cancelBtn, 'click', this.cancel);
        this.eventManager.bind(this.okBtn, 'click', this.ok);
        document.addEventListener('keydown', this.boundKeyDown);

        if (this.options.type === DialogType.Msg) {
            this.cancelBtn.style.display = 'none';
        }
    }

    setContent(content: string): void {
        this.content.innerHTML = content;
    }

    bindListeners(): void {
        this.boundKeyDown = (e: KeyboardEvent) => this.keyDownListener(e);
    }

    keyDownListener(e: KeyboardEvent): void {
        if (e.keyCode === 27) this.cancel(); // esc
        else if (e.keyCode === 13) this.ok(); // enter
    }

    cancel(): void {
        this.element.style.display = 'none';
        document.removeEventListener('keydown', this.boundKeyDown);
        this.deferred.resolve(0);
    }

    ok(): void {
        this.element.style.display = 'none';
        document.removeEventListener('keydown', this.boundKeyDown);
        const resolveValue = (this.options.type === DialogType.Msg) ? 0 : 1;
        this.deferred.resolve(resolveValue);
    }

    async show(): Promise<any> {
        this.element.style.display = 'block';
        this.okBtn.focus();
        this.deferred = new Deferred();
        return this.deferred.promise;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
}

export enum DialogType {
    Msg,
    OKCancel,
};