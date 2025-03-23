/**
 * The DialogAbout class.
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
import { appendDivTo } from './utils/functions.js';
import { changelogUrl, libraries, licenseUrl } from './utils/messages.js';
export class DialogAbout extends Dialog {
    constructor(div, app, title) {
        super(div, app, title, { okLabel: "Close", icon: "info", type: Dialog.Type.Msg });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let lib = appendDivTo(this.content, {});
            lib.innerHTML = marked.parse(libraries);
            try {
                const response = yield fetch(licenseUrl);
                const text = yield response.text();
                this.addDetails("License (AGPL-3.0)", marked.parse(text));
            }
            catch (err) {
                console.error(err);
            }
            try {
                const response = yield fetch(changelogUrl);
                const text = yield response.text();
                this.addDetails("Change log", marked.parse(text));
            }
            catch (err) {
                console.error(err);
            }
        });
    }
}
//# sourceMappingURL=dialog-about.js.map