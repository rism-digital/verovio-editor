import { App } from './app.js';
export class VerovioApp extends App {
    constructor(div, options) {
        options.enableEditor = false;
        options.appReset = true;
        super(div, options);
    }
}
//# sourceMappingURL=verovio-app.js.map