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
import { licenseUrl } from './app.js';
import { Dialog } from './dialog.js';
export class DialogAbout extends Dialog {
    constructor(div, app, title, options) {
        super(div, app, title, options);
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(licenseUrl);
                const text = yield response.text();
                this.addDetails("License", marked.parse(text));
            }
            catch (err) {
                console.error(err);
            }
        });
    }
}
//# sourceMappingURL=dialog-about.js.map