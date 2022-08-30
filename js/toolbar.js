/**
 * The Toolbar class is the based class for other toolbar implementations.
 * It should not be instanciated directly but only through inherited classes.
 */

import { GenericView } from './generic-view.js';
import { EventManager } from './event-manager.js';

export class Toolbar extends GenericView
{
    constructor( div, app )
    {
        super( div, app );

        // One of the little quirks of writing in ES6, bind events
        this.eventManager = new EventManager( this );
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateToolbarGrp( grp, condition )
    {
        if ( grp === undefined )
        {
            return;
        }
        if ( condition ) grp.style.display = 'block';
        else grp.style.display = 'none';
    }

    updateToolbarBtn( btn, condition )
    {
        if ( btn === undefined )
        {
            return;
        }
        if ( condition ) btn.classList.remove( "disabled" );
        else btn.classList.add( "disabled" );
    }

    updateToolbarBtnHide( btn, condition )
    {
        if ( btn === undefined )
        {
            return;
        }
        if ( condition ) btn.style.display = 'block';
        else btn.style.display = 'none';
    }

    updateToolbarToggleBtn( btn, condition )
    {
        if ( btn === undefined )
        {
            return;
        }
        if ( condition ) btn.classList.add( "toggled" );
        else btn.classList.remove( "toggled" );
    }

    updateToolbarSubmenuBtn( btn, condition )
    {
        if ( btn === undefined )
        {
            return;
        }
        if ( condition ) btn.classList.add( "vrv-menu-checked" );
        else btn.classList.remove( "vrv-menu-checked" );
    }
}