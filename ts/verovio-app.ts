
import { App } from './app.js';

export class VerovioApp extends App {
    constructor(div: HTMLDivElement, options: App.Options) {
        options.enableEditor = false;
        super(div, options);
    }
}