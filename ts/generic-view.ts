/**
 * The GenericView class is the based class for other view implementation.
 * It essentially provide a CustomEventManager and can be activate or deactivated.
 * It should not be instantiated directly but only through inherited classes.
 */

import { App } from '../js/app.js';
import { CustomEventManager } from '../js/custom-event-manager.js';

export class GenericView
{
    app: App;
    element: HTMLDivElement;
    id: string;
    active: boolean;
    customEventManager: CustomEventManager;
    ui: Object;

    constructor( div: HTMLDivElement, app: App )
    {
        // Root element in which verovio-ui is created
        this.element = div;

        // App object
        this.app = app;

        // Generate an id for the CustomEventManager
        this.id = Math.floor( ( 1 + Math.random() ) * Math.pow( 16, 16 ) ).toString( 16 ).substring( 1 );

        this.active = false;

        this.customEventManager = new CustomEventManager( {} );
        this.customEventManager.bind( this, 'onActivate', this.onActivate );
        this.customEventManager.bind( this, 'onDeactivate', this.onDeactivate );
        this.customEventManager.bind( this, 'onEndLoading', this.onEndLoading );
        this.customEventManager.bind( this, 'onLoadData', this.onLoadData );
        this.customEventManager.bind( this, 'onPage', this.onPage );
        this.customEventManager.bind( this, 'onResized', this.onResized );
        this.customEventManager.bind( this, 'onSelect', this.onSelect );
        this.customEventManager.bind( this, 'onStartLoading', this.onStartLoading );
        this.customEventManager.bind( this, 'onUpdateData', this.onUpdateData );
        this.customEventManager.bind( this, 'onUpdateView', this.onUpdateView );
        this.customEventManager.bind( this, 'onZoom', this.onZoom );

        this.ui = {};
    }

    destroy()
    {
        // Nothing at this level
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate( e: CustomEvent ): boolean
    {
        //console.debug("GenericView::onActivate");
        this.element.style.display = 'block';
        this.active = true;
        return true;
    }

    onDeactivate( e: CustomEvent ): boolean
    {
        //console.debug("GenericView::onDeactivate");
        this.element.style.display = 'none';
        this.active = false;
        return true;
    }

    onEndLoading( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onEndLoading");
        return true;
    }

    onLoadData( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onLoadData");
        return true;
    }

    onPage( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onPage");
        return true;
    }

    onResized( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onResized");
        return true;
    }

    onSelect( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        if ( this === e.detail.caller ) return false;
        //console.debug("GenericView::onSelect");
        return true;
    }

    onStartLoading( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onStartLoading");
        return true;
    }

    onUpdateData( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        if ( this === e.detail.caller ) return false;
        //console.debug("GenericView::onUpdateData");
        return true;
    }

    onUpdateView( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onUpdateView");
        return true;
    }

    onZoom( e: CustomEvent ): boolean
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onZoom");
        return true;
    }
}
