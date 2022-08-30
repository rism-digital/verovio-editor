/**
 * The ActionManager action class
 */

import { EditorView } from './editor-view.js';
import { EventManager } from './event-manager.js';

export class ActionManager
{
    constructor( view )
    {
        // EditorView object
        if ( !view || !( view instanceof EditorView ) ) 
        {
            throw "All ActionManager objects must be initialized with a 'EditorView' parameter that is an instance of the EditorView class.";
        }
        this.view = view;
        this.cursor = view.cursor;
        this.verovio = view.verovio;

        this.eventManager = new EventManager( this );

        this.inProgress = false;

        this.delayedCalls = [];
    }

    ////////////////////////////////////////////////////////////////////////
    // Delayed calls
    ////////////////////////////////////////////////////////////////////////

    async callDelayedCalls()
    {
        //console.debug( this.delayedCalls.length );
        if ( this.delayedCalls.length > 0 )
        {
            const call = this.delayedCalls[0];
            const method = call[0];
            const args = call[1];
            this.delayedCalls.shift();
            await method.apply( this, args );
        }
        else
        {
            await this.commit();
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Generic methods
    ////////////////////////////////////////////////////////////////////////

    async commit()
    {
        this.inProgress = true;
        const editorAction = { action: 'commit' };
        await this.view.verovio.edit( editorAction );
        await this.view.verovio.redoLayout();
        this.view.app.pageCount = await this.view.verovio.getPageCount();
        if ( this.view.currentPage > this.view.app.pageCount )
        {
            this.view.currentPage = this.view.app.pageCount
        }
        await this.view.renderPage( true );
        this.view.updateMEI();
        this.inProgress = false;

        // Check that nothing was added in-between
        if ( this.delayedCalls.length > 0 )
        {
            await this.callDelayedCalls();
        }
    }

    async delete()
    {
        let chain = new Array();
        for ( const item of this.cursor.selectedItems )
        {
            if ( !["note"].includes( item.elementType ) ) continue;
            chain.push( {
                action: 'delete',
                param: {
                    elementId: item.elementId
                }
            } );
        }

        if ( chain.length === 0 ) return;

        chain.push( { action: 'commit' } );

        const editorAction = {
            action: 'chain',
            param: chain
        }

        await this.view.verovio.edit( editorAction );
        await this.view.verovio.redoLayout();
        await this.view.renderPage( true );
        this.view.updateMEI();
    }

    async drag( x, y )
    {
        let chain = new Array();
        for ( const item of this.cursor.selectedItems )
        {
            if ( !["note"].includes( item.elementType ) ) continue
            const editorAction = {
                action: 'drag',
                param: {
                    elementId: item.elementId,
                    x: item.elementX + x,
                    y: item.elementY + y
                }
            };
            chain.push( editorAction );
        }

        if ( chain.length === 0 ) return;

        const editorAction = {
            action: 'chain',
            param: chain
        }

        await this.view.verovio.edit( editorAction );
        await this.view.verovio.redoPagePitchPosLayout();
        await this.view.renderPage( true, false );
    }

    async keyDown( key, shiftKey, ctrlKey )
    {
        // keyDown events can 
        if ( this.inProgress )
        {
            this.delayedCalls.push( [this.keyDown, arguments] );
            return;
        }
        this.inProgress = true;

        let chain = new Array();
        for ( const item of this.cursor.selectedItems )
        {
            if ( !["note"].includes( item.elementType ) ) continue;
            const editorAction = {
                action: 'keyDown',
                param: {
                    elementId: item.elementId,
                    key: key,
                    shiftKey: shiftKey,
                    ctrlKey: ctrlKey
                }
            };
            chain.push( editorAction );
        }

        if ( chain.length === 0 )
        {
            this.inProgress = false;
            return;
        }

        const editorAction = {
            action: 'chain',
            param: chain
        }

        await this.view.verovio.edit( editorAction );
        await this.view.verovio.redoPagePitchPosLayout();
        await this.view.renderPage( true, false );

        this.inProgress = false;
        await this.callDelayedCalls();
    }

    ////////////////////////////////////////////////////////////////////////
    // Element specific methods
    ////////////////////////////////////////////////////////////////////////

    async insertNote( x, y )
    {
        if ( !this.cursor.inputMode ) return;

        let chain = new Array();

        chain.push( {
            action: 'insert',
            param: {
                elementType: "note",
                startid: this.cursor.elementId
            }
        } );

        chain.push( {
            action: 'drag',
            param: {
                elementId: "[chained-id]",
                x: x,
                y: y
            }
        } );

        chain.push( { action: 'commit' } );

        //console.debug( chain );

        const editorAction = {
            action: 'chain',
            param: chain
        }
        await this.view.verovio.edit( editorAction );
        await this.view.verovio.redoLayout();
        await this.view.renderPage( true );
        this.view.updateMEI();
    }

    async formCres()
    {
        await this.setAttrValue( "form", "cres", ["hairpin"] );
    }

    async formDim()
    {
        await this.setAttrValue( "form", "dim", ["hairpin"] );
    }

    async placeAbove()
    {
        await this.setAttrValue( "place", "above", ["dir", "dynam", "hairpin", "tempo", "pedal"] );
    }

    async placeBelow()
    {
        await this.setAttrValue( "place", "below", ["dir", "dynam", "hairpin", "tempo", "pedal"] );
    }

    async placeAuto()
    {
        await this.setAttrValue( "place", "", ["dir", "dynam", "hairpin", "tempo", "pedal"] );
    }

    async stemDirUp()
    {
        await this.setAttrValue( "stem.dir", "up", ["note", "chord"] );
    }

    async stemDirDown()
    {
        await this.setAttrValue( "stem.dir", "down", ["note", "chord"] );
    }

    async stemDirAuto()
    {
        await this.setAttrValue( "stem.dir", "", ["note", "chord"] );
    }

    async update()
    {
        const editorAction = {
            action: 'commit'
        }

        await this.view.verovio.edit( editorAction );
        await this.view.updateLoadData();
        this.view.updateMEI();
    }

    // helper

    async setAttrValue( attribute, value, elementTypes = [] )
    {
        let chain = new Array();
        for ( const item of this.cursor.selectedItems )
        {
            if ( elementTypes.length > 0 && !elementTypes.includes( item.elementType ) ) continue;
            const editorAction = {
                action: 'set',
                param: {
                    elementId: item.elementId,
                    attribute: attribute,
                    value: value
                }
            };
            chain.push( editorAction );
        }

        if ( chain.length === 0 ) return;

        chain.push( { action: 'commit' } );

        const editorAction = {
            action: 'chain',
            param: chain
        }
        await this.view.verovio.edit( editorAction );
        await this.view.verovio.redoLayout();
        await this.view.renderPage( true );
        this.view.updateMEI();
    }

}
