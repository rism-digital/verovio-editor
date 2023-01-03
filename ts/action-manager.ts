/**
 * The ActionManager action class
 */
import { CursorPointer } from './cursor-pointer.js';
import { EditorView } from './editor-view.js';
import { EventManager } from './event-manager.js';
import { WorkerProxy } from './worker-proxy.js'

class Call {
    method: Function;
    args: IArguments;

    constructor( method: Function, args: IArguments )
    {   
        this.method = method;
        this.args = args; 
    }
}

export class ActionManager
{
    cursorPointer: CursorPointer;
    delayedCalls: Call[];
    eventManager: EventManager;
    inProgress: boolean;
    verovio: WorkerProxy;
    view: EditorView;

    constructor( view: EditorView )
    {
        // EditorView object
        this.view = view;
        this.cursorPointer = view.cursorPointer;
        this.verovio = view.verovio;

        this.eventManager = new EventManager( this );

        this.inProgress = false;

        this.delayedCalls = [];
    }

    ////////////////////////////////////////////////////////////////////////
    // Delayed calls
    ////////////////////////////////////////////////////////////////////////

    async callDelayedCalls(): Promise<any>
    {
        //console.debug( this.delayedCalls.length );
        if ( this.delayedCalls.length > 0 )
        {
            const call = this.delayedCalls[0];
            this.delayedCalls.shift();
            await call.method.apply( this, call.args );
        }
        else
        {
            await this.commit();
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Generic methods
    ////////////////////////////////////////////////////////////////////////

    async commit(): Promise<any>
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

    async delete(): Promise<any>
    {
        let chain = new Array();
        for ( const item of this.cursorPointer.selectedItems )
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

    async drag( x: number, y: number ): Promise<any>
    {
        let chain = new Array();
        for ( const item of this.cursorPointer.selectedItems )
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

    async keyDown( key: number, shiftKey: boolean, ctrlKey: boolean ): Promise<any>
    {
        // keyDown events can 
        if ( this.inProgress )
        {
            this.delayedCalls.push( new Call( this.keyDown, arguments ) );
            return;
        }
        this.inProgress = true;

        let chain = new Array();
        for ( const item of this.cursorPointer.selectedItems )
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

    async insertNote( x: number, y: number ): Promise<any>
    {
        if ( !this.cursorPointer.inputMode ) return;

        let chain = new Array();

        chain.push( {
            action: 'insert',
            param: {
                elementType: "note",
                startid: this.cursorPointer.elementId
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

    async formCres(): Promise<any>
    {
        await this.setAttrValue( "form", "cres", ["hairpin"] );
    }

    async formDim(): Promise<any>
    {
        await this.setAttrValue( "form", "dim", ["hairpin"] );
    }

    async placeAbove(): Promise<any>
    {
        await this.setAttrValue( "place", "above", ["dir", "dynam", "hairpin", "tempo", "pedal"] );
    }

    async placeBelow(): Promise<any>
    {
        await this.setAttrValue( "place", "below", ["dir", "dynam", "hairpin", "tempo", "pedal"] );
    }

    async placeAuto(): Promise<any>
    {
        await this.setAttrValue( "place", "", ["dir", "dynam", "hairpin", "tempo", "pedal"] );
    }

    async stemDirUp(): Promise<any>
    {
        await this.setAttrValue( "stem.dir", "up", ["note", "chord"] );
    }

    async stemDirDown(): Promise<any>
    {
        await this.setAttrValue( "stem.dir", "down", ["note", "chord"] );
    }

    async stemDirAuto(): Promise<any>
    {
        await this.setAttrValue( "stem.dir", "", ["note", "chord"] );
    }

    async update(): Promise<any>
    {
        const editorAction = {
            action: 'commit'
        }

        await this.view.verovio.edit( editorAction );
        await this.view.updateLoadData();
        this.view.updateMEI();
    }

    // helper

    async setAttrValue( attribute: string, value: string, elementTypes: Array<string> = [] ): Promise<any>
    {
        let chain = new Array();
        for ( const item of this.cursorPointer.selectedItems )
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
