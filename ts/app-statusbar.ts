/**
 * The AppStatusbar class is the implementation of the application status.
 * Events are attached to the App.eventManager.
 */

import { App } from '../js/app.js';
import { GenericView } from './generic-view.js';

import { elt } from '../js/utils/functions.js';

export class AppStatusbar extends GenericView
{
    active: boolean;
    ui: Object;
    statustext: HTMLElement;
    element: HTMLElement;

    constructor( div: HTMLDivElement, app: App )
    {
        super( div, app );

        this.active = true;

        this.statustext = elt( 'div', { class: `vrv-status-text` } );
        this.element.appendChild( this.statustext );
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onEndLoading( e: CustomEvent )
    {
        if ( !super.onEndLoading( e ) ) return false;
        //console.debug("AppStatusbar::onEndLoading");

        this.statustext.innerHTML = "Completed";

        return true;
    }

    onStartLoading( e: CustomEvent )
    {
        if ( !super.onStartLoading( e ) ) return false;
        //console.debug("AppStatusbar:onStartLoading");

        let msg = ( e.detail.light ) ? e.detail.msg : "In progress ...";
        this.statustext.innerHTML = msg;

        return true;
    }
}
