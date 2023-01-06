/**
*  EventManager for binding events to a given parent object to avoid ES6 scope issues.
*/

import { randomHex } from './utils/functions.js';

export class EventManager {
    parent: Object;
    cache: Object;
    appIDAttr: string;

    constructor(parent: Object) {
        if (!parent) return;
        this.parent = parent;
        this.cache = {};
        this.appIDAttr = 'data-app-el-id';
    }

    // Binds function `fct` to element `el` on event `ev`
    bind(el: Element, ev: string, fct: Function): void {
        // Assign the element a random ID for the EventManager to reference it by (or get it if we already have one)
        let appID = el.getAttribute(this.appIDAttr) || el.getAttribute('id');
        if (!appID) {
            appID = randomHex(16);
            el.setAttribute(this.appIDAttr, appID);
        }

        // Fill out the object
        if (!(appID in this.cache))
            this.cache[appID] = {};

        const elObj = this.cache[appID];
        if (!(ev in elObj))
            elObj[ev] = [];

        const elEvObj = elObj[ev];

        // Bind the function to the parent
        const boundFct = fct.bind(this.parent);
        elEvObj.push(boundFct);

        // Add the listener
        el.addEventListener(ev, boundFct);
    }

    // Unbinds all functions listening to event `ev` on element `el`
    unbind(el: Element, ev: string): void {
        // Get the appID from the object; if it doesn't exist, we haven't bound any events
        const appID = el.getAttribute(this.appIDAttr) || el.getAttribute('id');
        if (!appID) return;

        if (appID in this.cache) {
            if (ev in this.cache[appID]) {
                for (let boundFunct of this.cache[appID][ev]) {
                    el.removeEventListener(ev, boundFunct);
                }
            }
        }
    }

    // Unbinds everything managed by this
    unbindAll(): void {
        for (let appID in this.cache) {
            // See if it was a regular ID
            let el = document.getElementById(appID);

            // Then try the local ID
            if (!el) el = document.querySelector(`*[${this.appIDAttr}='${appID}']`);

            // If the element's been deleted/doesn't exist, abandon
            if (!el) continue;

            for (let ev in this.cache[appID]) {
                for (let funct of this.cache[appID][ev]) {
                    el.removeEventListener(ev, funct);
                }
            }
        }
    }
}