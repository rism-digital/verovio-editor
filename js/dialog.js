/**
 * The Dialog class is the based class for other dialog implementations.
 * It should not be instanciated directly but only through inherited classes.
 */

import { Deferred } from './deferred.js';
import { EventManager } from '../js-dist/event-manager.js';

import { elt } from './utils/functions.js';

export class Dialog
{
    constructor( div, app, title, opts )
    {
        this.options = Object.assign( {
            icon: "info",
            type: Dialog.type.OKCancel,
            okLabel: "OK",
            cancelLabel: "Cancel"
        }, opts );

        this.element = div;
        // Remove previous content
        this.element.innerHTML = "";

        this.app = app;

        this.eventManager = new EventManager( this );
        this.bindListeners(); // Document/Window-scoped events

        this.ui = {};

        // Create the HTML content
        this.ui.box = elt( 'div', { class: `vrv-dialog-box` } );
        this.element.appendChild( this.ui.box );

        // The top of the dialog
        this.ui.top = elt( 'div', { class: `vrv-dialog-top` } );
        this.ui.box.appendChild( this.ui.top );

        this.ui.icon = elt( 'div', { class: `vrv-dialog-icon` } );
        this.ui.top.appendChild( this.ui.icon );
        this.ui.icon.classList.add( this.options.icon );

        const titleDiv = elt( 'div', { class: `vrv-dialog-title` } );
        titleDiv.innerHTML = title;
        this.ui.top.appendChild( titleDiv );

        this.ui.close = elt( 'div', { class: `vrv-dialog-close` } );
        this.ui.top.appendChild( this.ui.close )

        // The content of the dialog
        this.ui.content = elt( 'div', { class: `vrv-dialog-content` } );
        this.ui.box.appendChild( this.ui.content );

        // The bottom of the dialog with buttons
        this.ui.bottom = elt( 'div', { class: `vrv-dialog-bottom` } );
        this.ui.box.appendChild( this.ui.bottom )

        this.ui.cancel = elt( 'div', { class: `vrv-dialog-btn` } );
        this.ui.cancel.setAttribute( "data-before", this.options.cancelLabel );
        this.ui.bottom.appendChild( this.ui.cancel );

        this.ui.ok = elt( 'div', { class: `vrv-dialog-btn` } );
        this.ui.ok.setAttribute( "data-before", this.options.okLabel );
        this.ui.bottom.appendChild( this.ui.ok );

        this.eventManager.bind( this.ui.close, 'click', this.cancel );
        this.eventManager.bind( this.ui.cancel, 'click', this.cancel );
        this.eventManager.bind( this.ui.ok, 'click', this.ok );
        document.addEventListener( 'keydown', this.boundKeyDown );

        if ( this.options.type === Dialog.type.Msg )
        {
            this.ui.cancel.style.display = 'none';
        }
    }

    setContent( content )
    {
        this.ui.content.innerHTML = content;
    }

    bindListeners()
    {
        this.boundKeyDown = ( evt ) => this.keyDownListener( evt );
    }

    keyDownListener( e )
    {
        if ( e.keyCode === 27 ) this.cancel(); // esc
        else if ( e.keyCode === 13 ) this.ok(); // enter
    }

    cancel()
    {
        this.element.style.display = 'none';
        document.removeEventListener( 'keydown', this.boundKeyDown );
        this.deferred.resolve( 0 );
    }

    ok()
    {
        this.element.style.display = 'none';
        document.removeEventListener( 'keydown', this.boundKeyDown );
        const resovleValue = ( this.options.type === Dialog.type.Msg ) ? 0 : 1;
        this.deferred.resolve( resovleValue );
    }

    async show()
    {
        this.element.style.display = 'block';
        this.ui.ok.focus();
        this.deferred = new Deferred();
        return this.deferred.promise;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////


}

Dialog.type = {
    Msg: 1,
    OKCancel: 2,
};
