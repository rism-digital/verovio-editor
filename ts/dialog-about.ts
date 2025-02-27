/**
 * The DialogAbout class.
 */

import { App, licenseUrl } from './app.js';
import { Dialog } from './dialog.js';

export class DialogAbout extends Dialog {

    constructor(div: HTMLDivElement, app: App, title: string, options: Dialog.Options) {
        super(div, app, title, options);
    }

    async load() {
        try {
            const response = await fetch(licenseUrl);
            const text = await response.text();
            this.addDetails("License", marked.parse(text));
        } catch (err) {
            console.error(err);
        }
    }
}
