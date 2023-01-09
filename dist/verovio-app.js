import { App } from './app.js';
export class VerovioApp extends App {
    constructor(div, opts) {
        opts.enableEditor = false;
        super(div, opts);
    }
}
