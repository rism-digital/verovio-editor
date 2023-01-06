/**
* CustomEventManager class for managing custom events.
* When an event is dispatched and found for an object, it is called.
* CustomEventManager hold a propagationList of other managers to call recursively.
*/

import { App } from './app.js';
import { GenericView } from "./generic-view.js";

export class CustomEventManager {
    cache: Map<string, Map<string, Function>>;
    objs: Map<string, GenericView | App>;
    propagationList: Array<CustomEventManager>;

    constructor() {
        this.cache = new Map<string, Map<string, Function>>;
        this.objs = new Map<string, GenericView | App>;
        this.propagationList = []
    }

    // Binds function `fct` to element `el` on event `ev`
    bind(obj: GenericView | App, ev: string, fct: Function) {
        if (!this.cache.has(obj.id)) {
            this.cache.set(obj.id, new Map<string, Function>);
            this.objs.set(obj.id, obj);
        }

        const bindings: Map<string, Function> = this.cache.get(obj.id);
        if (!bindings.has(ev)) {
            bindings.set(ev, fct);
        }
    }

    addToPropagationList(customEventManager: CustomEventManager) {
        if (!(this.propagationList.includes(customEventManager)))
            this.propagationList.push(customEventManager);
    }

    /* TODO
    // Unbinds all functions listening to event `ev` on element `el`
    unbind(el, ev)
    {
    }
    */

    /* TODO
    // Unbinds everything managed by this
    unbindAll()
    {
    }
    */

    dispatch(event: Event) {
        for (let objId of this.cache.keys()) {
            const bindings: Map<string, Function> = this.cache.get(objId);
            for (let ev of bindings.keys()) {
                if (event.type === ev) {
                    let fct: Function = bindings.get(ev);
                    const o = this.objs.get(objId);
                    o[fct.name](event);
                }
            }
        }
        for (let obj in this.propagationList) {
            //console.debug(this.propagationList[obj]);
            this.propagationList[obj]['dispatch'](event);
        }
    }
}
