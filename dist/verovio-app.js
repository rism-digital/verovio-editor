import { App } from './app.js';
export class VerovioApp extends App {
    constructor(div, options) {
        options.enableEditor = false;
        super(div, options);
    }
}
