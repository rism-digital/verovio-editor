/**
 * The DialogAbout class.
 */

import { App } from './app.js';
import { Dialog } from './dialog.js';

import { appendDivTo } from './utils/functions.js';
import { changelogUrl, libraries, licenseUrl  } from './utils/messages.js';

export class DialogAbout extends Dialog {

    constructor(div: HTMLDivElement, app: App, title: string) {
        super(div, app, title, { okLabel: "Close", icon: "info", type: Dialog.Type.Msg });
    }

    async load() {

        let lib = appendDivTo(this.content, {});
        lib.innerHTML = marked.parse(libraries);

        try {
            const response = await fetch(licenseUrl);
            const text = await response.text();
            this.addDetails("License (AGPL-3.0)", marked.parse(text));
        } catch (err) {
            console.error(err);
        }

        try {
            const response = await fetch(changelogUrl);
            const text = await response.text();
            this.addDetails("Change log", marked.parse(text));
        } catch (err) {
            console.error(err);
        }
    }
}
