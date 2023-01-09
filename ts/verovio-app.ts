
import { App, AppOptions } from './app.js';

export class VerovioApp extends App {
    constructor(div: HTMLDivElement, opts: AppOptions) {
        opts.enableEditor = false;
        super(div, opts);
    }
}