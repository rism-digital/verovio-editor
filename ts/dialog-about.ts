/**
 * The DialogAbout class.
 */

import { App, licenseUrl } from './app.js';
import { Dialog } from './dialog.js';

export class DialogAbout extends Dialog {

    constructor(div: HTMLDivElement, app: App, title: string) {
        super(div, app, title, { okLabel: "Close", icon: "info", type: Dialog.Type.Msg });
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
