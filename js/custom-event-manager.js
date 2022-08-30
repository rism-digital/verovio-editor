/**
* CustomEventManager class for managing custom events.
* When an event is dispatched and found for an object, it is called.
* CustomEventManager hold a propagationList of other managers to call recursively.
*/

export class CustomEventManager
{
    constructor()
    {
        this.cache = {};
        this.objs = {}
        this.propagationList = []
    }

    // Binds function `funct` to element `el` on event `ev`
    bind( obj, ev, funct )
    {
        if ( !( obj.id in this.cache ) )
        {
            this.cache[obj.id] = {};
            this.objs[obj.id] = obj;
        }

        const bindings = this.cache[obj.id];
        if ( !( ev in bindings ) )
            bindings[ev] = funct;

    }

    addToPropagationList( customEventManager )
    {
        if ( !( customEventManager in this.propagationList ) )
            this.propagationList.push( customEventManager );
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

    dispatch( event )
    {
        //console.debug(event);
        for ( let objId in this.cache )
        {
            const bindings = this.cache[objId];
            for ( let ev in bindings )
            {
                if ( event.type === ev )
                {
                    let funct = bindings[ev];
                    const o = this.objs[objId];
                    o[funct.name]( event );
                }
            }
        }
        for ( let obj in this.propagationList )
        {
            //console.debug(this.propagationList[obj]);
            this.propagationList[obj]['dispatch']( event );
        }

    }
}
