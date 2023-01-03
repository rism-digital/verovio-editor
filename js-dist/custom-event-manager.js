/**
* CustomEventManager class for managing custom events.
* When an event is dispatched and found for an object, it is called.
* CustomEventManager hold a propagationList of other managers to call recursively.
*/
export class CustomEventManager {
    constructor() {
        this.cache = new Map;
        this.objs = new Map;
        this.propagationList = [];
    }
    // Binds function `fct` to element `el` on event `ev`
    bind(obj, ev, fct) {
        if (!this.cache.has(obj.id)) {
            this.cache.set(obj.id, new Map);
            this.objs.set(obj.id, obj);
        }
        const bindings = this.cache.get(obj.id);
        if (!bindings.has(ev)) {
            bindings.set(ev, fct);
        }
    }
    addToPropagationList(customEventManager) {
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
    dispatch(event) {
        for (let objId of this.cache.keys()) {
            const bindings = this.cache.get(objId);
            for (let ev of bindings.keys()) {
                if (event.type === ev) {
                    let fct = bindings.get(ev);
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
