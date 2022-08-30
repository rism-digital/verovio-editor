/**
 * The GenericView class is the based class for other view implementation.
 * It essensially provide a CustomeEventManager and can be activate or deactivated.
 * It should not be instanciated directly but only through inherited classes.
 */

import { App } from './app.js';
import { CustomEventManager } from './custom-event-manager.js';

export class GenericView
{
    constructor( div, app )
    {
        // Root element in which verovio-ui is created
        if ( !div || !( div instanceof HTMLDivElement ) ) 
        {
            throw "All GenericView objects must be initialized with 'div' parameter that is a HTMLDivElement element.";
        }
        this.element = div;

        // App object
        if ( !app || !( app instanceof App ) ) 
        {
            throw "All GenericView objects must be initialized with a 'App' parameter that is an instance of the App class.";
        }
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

    onActivate( e )
    {
        //console.debug("GenericView::onActivate");
        this.element.style.display = 'block';
        this.active = true;
        return true;
    }

    onDeactivate( e )
    {
        //console.debug("GenericView::onDeactivate");
        this.element.style.display = 'none';
        this.active = false;
        return true;
    }

    onEndLoading( e )
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onEndLoading");
        return true;
    }

    onLoadData( e )
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onLoadData");
        return true;
    }

    onPage( e )
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onPage");
        return true;
    }

    onResized( e )
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onResized");
        return true;
    }

    onSelect( e )
    {
        if ( !this.active ) return false;
        if ( this === e.detail.caller ) return false;
        //console.debug("GenericView::onSelect");
        return true;
    }

    onStartLoading( e )
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onStartLoading");
        return true;
    }

    onUpdateData( e )
    {
        if ( !this.active ) return false;
        if ( this === e.detail.caller ) return false;
        //console.debug("GenericView::onUpdateData");
        return true;
    }

    onUpdateView( e )
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onUpdateView");
        return true;
    }

    onZoom( e )
    {
        if ( !this.active ) return false;
        //console.debug("GenericView::onZoom");
        return true;
    }
}
