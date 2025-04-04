/**
 * The XMLEditorView class implements an code editor, with validation and code completion.
 * It uses the CodeMirror editor package and a ValidatorMessenger
 */

import { App } from './app.js';
import { Dialog } from './dialog.js'
import { GenericView } from './generic-view.js';
import { ValidatorWorkerProxy } from './worker-proxy.js';
import { RNGLoader } from './rng-loader.js';

import { autoModeLimit, autoModeOff } from './utils/messages.js';
import { appendDivTo, appendTextAreaTo } from './utils/functions.js';

const theme = "vrv"; // default for light theme

declare global {
    const CodeMirror;
}

enum Status {
    Validating,
    Valid,
    Invalid,
    Unknown,
};

export class XMLEditorView extends GenericView {
    private validator: ValidatorWorkerProxy;
    private rngLoader: RNGLoader;
    private currentId: string;
    private xmlValid: HTMLDivElement;
    private xmlEditorView: HTMLTextAreaElement;
    private updateLinting: Function;
    private timestamp: number; // For checking if the data validated is still the data loaded 
    private autoMode: boolean; // For indicating if live validation and sync is on
    private autoModeNotification: boolean; // For indicating if the notification should be displayed
    private edited: boolean; // For indicating if the XML content is edited but not synchronized
    private enabled: boolean; // For indicating the XML editor is open
    private formatting: boolean; // For indicating that XML formatting is under progress
    private CMeditor: any;
    private lintOptions: Object;

    constructor(div: HTMLDivElement, app: App, validator: ValidatorWorkerProxy, rngLoader: RNGLoader) {
        super(div, app);
        // Validator object
        this.validator = validator;

        // RNGLoader object
        this.rngLoader = rngLoader;

        this.currentId = null;

        this.xmlValid = appendDivTo(this.element, { class: `vrv-xml-valid` });
        this.xmlEditorView = appendTextAreaTo(this.element, {});

        this.updateLinting = null;
        this.currentId = "";
        this.timestamp = Date.now();
        this.edited = false;
        this.autoMode = false;
        this.autoModeNotification = false;
        this.enabled = false;
        this.formatting = false;

        const cmThis = this;

        this.lintOptions = {
            "caller": cmThis,
            "getAnnotations": cmThis.validate,
            "async": true
        }

        this.CMeditor = CodeMirror.fromTextArea(this.xmlEditorView, {
            lineNumbers: true,
            readOnly: false,
            autoCloseTags: true,
            indentUnit: 3,
            mode: "xml",
            theme: theme,
            foldGutter: true,
            styleActiveLine: true,
            hintOptions: { schemaInfo: this.rngLoader.tags },
            extraKeys: {
                "'<'": completeAfter,
                "'/'": completeIfAfterLt,
                "' '": completeIfInTag,
                "'='": completeIfInTag,
            },
            gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
        });

        const map = {
            "Shift-Ctrl-V": function (cm) { cmThis.triggerValidation(); },
            "Shift-Ctrl-F": function (cm) { cmThis.formatXML(); },
        }
        this.CMeditor.addKeyMap(map);

        this.CMeditor.on("cursorActivity", function (cm) {
            cmThis.onCursorActivity(cm);
        });

        this.CMeditor.on("keyHandled", function (cm, string, event) {
            cmThis.keyHandled(cm, string, event);
        });

        this.CMeditor.on("change", function (cm, changes, event) {
            if (changes.origin === "setValue" || (cmThis.autoMode && !cmThis.formatting)) {
                cmThis.triggerValidation();
            }
            else {
                cmThis.suspendValidation();
                cmThis.setStatus(Status.Unknown);
            }
        });

        this.CMeditor.options.hintOptions.schemaInfo = this.rngLoader.tags;
    }

    ////////////////////////////////////////////////////////////////////////
    // Getters and Setter
    ////////////////////////////////////////////////////////////////////////

    isEdited(): boolean { return this.edited; }
    setEdited(edited: boolean): void { this.edited = edited; }

    isEnabled(): boolean { return this.enabled; }

    isAutoMode(): boolean { return this.autoMode; }
    setMode(fileSize: number): void {
        this.autoMode = (fileSize < (autoModeLimit * 1024 * 1024));
        this.autoModeNotification = !this.autoMode;
    }

    ////////////////////////////////////////////////////////////////////////
    // Async methods
    ////////////////////////////////////////////////////////////////////////

    async setEnabled(enabled: boolean): Promise<any> {
        this.enabled = enabled;
        if (this.enabled && this.autoModeNotification && !this.autoMode) {
            const dlg = new Dialog(this.app.dialog, this.app, "Live validation off", { icon: "warning", type: Dialog.Type.Msg });
            dlg.setContent(marked.parse(autoModeOff));
            await dlg.show();
            // Do not show it again for that file.
            this.autoModeNotification = false;
        }
    }

    async validate(text: string, updateLinting: Function, options: any): Promise<any> {
        //console.debug( "XMLEditorView::validate");
        if (!updateLinting || !options.caller || !text) return;

        const editor: XMLEditorView = options.caller;
        //console.debug( "XMLEditorView::validate", editor );

        if (!editor.enabled) return;
        if (editor.formatting) return;

        // keep the callback
        editor.setStatus(Status.Validating);
        editor.updateLinting = updateLinting;
        editor.app.startLoading("Validating ...", true);
        let validation = "[]";
        if (editor.app.options.enableValidation) {
            validation = await editor.validator.validateNG(text);
        }
        else {
            validation = await editor.validator.check(text);
        }
        editor.app.endLoading(true);
        editor.highlightValidation(text, validation, editor.timestamp);

    }

    async replaceSchema(schemaFile: string): Promise<any> {
        try {
            const response = await fetch(schemaFile);
            const data = await response.text();
            if (this.app.options.enableValidation) {
                const res = await this.validator.setRelaxNGSchema(data);
                console.log("New schema loaded", res);
            }
            this.rngLoader.setRelaxNGSchema(data);
            this.CMeditor.options.hintOptions.schemaInfo = this.rngLoader.tags
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    setStatus(status: Status): void {
        if (!this.xmlValid) return;

        this.xmlValid.classList.remove("wait");
        this.xmlValid.classList.remove("ok");
        this.xmlValid.classList.remove("error");
        this.xmlValid.classList.remove("unknown");

        let statusClass: string;
        switch (status) {
            case (Status.Validating): statusClass = "wait"; break;
            case (Status.Valid): statusClass = "ok"; break;
            case (Status.Invalid): statusClass = "error"; break;
            case (Status.Unknown): statusClass = "unknown"; break;
        }
        this.xmlValid.classList.add(statusClass);
    }

    setCurrent(id: string): void {
        //console.debug( "XMLEditorView::setCurrent" );
        const cursor = this.CMeditor.getSearchCursor(`xml:id="${id}"`);
        cursor.findNext();
        if (cursor.atOccurrence) {
            // Move with a margin in order to make the highlighted line more visible
            this.CMeditor.scrollIntoView({ line: cursor.pos.from.line, char: 0 }, this.element.clientHeight / 2);
            this.CMeditor.setCursor(cursor.from());
        }
    }

    highlightValidation(text: string, validation: string, timestamp: number): void {
        let lines = [];
        let found = [];
        let i = 0;
        let messages = [];

        try {
            lines = text.split("\n");
            messages = JSON.parse(validation);
        } catch (err) {
            console.log("could not parse json:", err);
            return;
        }
        while (i < messages.length) {
            let line = Math.max(messages[i].line - 1, 0);
            found.push({
                from: new CodeMirror.Pos(line, 0),
                to: new CodeMirror.Pos(line, lines[line].length),
                severity: "error",
                message: messages[i].message
            });
            i += 1;
        }
        this.updateLinting(this.CMeditor, found);
        if (found.length == 0) {
            if (timestamp === this.timestamp) {
                this.setStatus(Status.Valid);
                this.edited = false;
                if (this.app.mei == text) return;
                this.app.mei = text;
                this.app.startLoading("Updating data ...", true);
                let event = new CustomEvent('onUpdateData', {
                    detail: {
                        caller: this
                    }
                });

                this.app.customEventManager.dispatch(event);
            }
            else {
                console.log("Validated data is obsolete");
                this.setStatus(Status.Unknown);
                this.edited = false;
            }
        }
        else {
            this.setStatus(Status.Invalid);
            this.edited = true;
        }
    }

    formatXML(): void {
        console.debug("XMLEditorView::FormatXML");
        // A flag for suspending validation
        this.formatting = true;
        // Store the current line
        let currentLine = this.CMeditor.getCursor();
        let totalLines = this.CMeditor.lineCount();
        this.CMeditor.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
        // Re-enable validation
        this.formatting = false;
        this.CMeditor.setCursor(currentLine);
    }

    triggerValidation(): void {
        this.CMeditor.setOption("lint", this.lintOptions);
    }

    suspendValidation(): void {
        this.CMeditor.setOption("lint", false);
    }

    getValue(): string {
        return this.CMeditor.getValue();
    }

    ////////////////////////////////////////////////////////////////////////
    // Codemirror event methods
    ////////////////////////////////////////////////////////////////////////

    onCursorActivity(cm): void {
        if (this.formatting) return;

        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        const id = line.match(/.*xml:id=\"([^"]*)\".*/);
        const elementType = line.match(/[^\>]*\<([^\ ]*).*/);
        if (id) {
            if (this.currentId !== id[1]) {
                let event = new CustomEvent('onSelect', {
                    detail: {
                        id: id[1],
                        elementType: elementType[1],
                        caller: this
                    }
                });
                //console.debug( "Dispatch-onSelect" );
                this.app.customEventManager.dispatch(event);
            }
            this.currentId = id[1];
        }
    }

    keyHandled(cm, string, event): void {
        this.setEdited(true);
        if (event.key === "Enter") {
            let ch = cm.getCursor().ch;
            let line = cm.getCursor().line;
            let nextChar = cm.getLine(line).substr(cm.getCursor().ch, 1);
            let lastLine = cm.getLine(line - 1);
            let lastChar = lastLine.substr(lastLine.length - 1);
            if (lastChar === ">" && nextChar === "<") {
                let tabSize = cm.getOption("tabSize");
                cm.doc.replaceRange(" ".repeat(tabSize) + "\n" + " ".repeat(ch), cm.getCursor());
                cm.setCursor({ line: line, ch: (ch + tabSize) });
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onActivate(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        //console.debug("XMLEditorView::onActivate");
        this.CMeditor.setValue(this.app.mei);
        this.CMeditor.refresh();
        this.CMeditor.setSize(this.element.style.width, this.element.style.height);

        return true;
    }

    override onLoadData(e: CustomEvent): boolean {
        if (!super.onLoadData(e)) return false;
        //console.debug("XMLEditorView::onLoadData");
        this.timestamp = Date.now();
        this.CMeditor.setValue(e.detail.mei);
        this.setCurrent(this.currentId);

        return true;
    }

    override onSelect(e: CustomEvent): boolean {
        if (!super.onSelect(e)) return false;
        //console.debug("XMLEditorView::onSelect");
        this.currentId = e.detail.id;
        this.setCurrent(this.currentId);

        return true;
    }

    override onUpdateData(e: CustomEvent): boolean {
        if (!super.onUpdateData(e)) return false;
        if (this === e.detail.caller) return false;
        //console.debug("XMLEditorView::onUpdateData");
        this.timestamp = Date.now();
        this.CMeditor.setValue(this.app.mei);
        this.setCurrent(this.currentId);

        return true;
    }

    override onResized(e: CustomEvent): boolean {
        if (!super.onResized(e)) return false;
        //console.debug("XMLEditorView::onResized");

        this.CMeditor.setSize(this.element.style.width, this.element.style.height);

        return true;
    }
}

////////////////////////////////////////////////////////////////////////
// CodeMirror extraKeys functions 
// Could be move to XMLEditorView:: keyHandled ?
////////////////////////////////////////////////////////////////////////

function completeAfter(cm, pred): void {
    let cur = cm.getCursor();
    if (!pred || pred()) setTimeout(function () {
        if (!cm.state.completionActive)
            CodeMirror.showHint(cm, CodeMirror.hint.xml, { schemaInfo: CodeMirror.schemaInfo, completeSingle: false });
    }, 100);
    return CodeMirror.Pass;
}

function completeIfAfterLt(cm): void {
    return completeAfter(cm, function () {
        let cur = cm.getCursor();
        return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
    });
}

function completeIfInTag(cm): void {
    return completeAfter(cm, function () {
        let tok = cm.getTokenAt(cm.getCursor());
        if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
        let inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
        return inner.tagName;
    });
}

////////////////////////////////////////////////////////////////////////
// CodeMirror extension for autoFormatRange
////////////////////////////////////////////////////////////////////////

if (typeof CodeMirror !== 'undefined') {
    CodeMirror.extendMode("xml", {
        commentStart: "<!--",
        commentEnd: "-->",
        newlineAfterToken: function (type, content, textAfter) {
            // Never at new lines for now because this causes problem with text in MEI - e.g., with <rend> spacing
            //return ( type == "tag" && />$/.test( content ) || /^<.</.test( textAfter ) ) || ( type == "tag bracket" && />$/.test( content ) );
            return false;
        }
    });

    CodeMirror.defineExtension("commentRange", function (isComment, from, to) {
        var cm = this, curMode = CodeMirror.innerMode(cm.getMode(), cm.getTokenAt(from).state).mode;
        cm.operation(function () {
            if (isComment) { // Comment range
                cm.replaceRange(curMode.commentEnd, to);
                cm.replaceRange(curMode.commentStart, from);
                if (from.line == to.line && from.ch == to.ch) // An empty comment inserted - put cursor inside
                    cm.setCursor(from.line, from.ch + curMode.commentStart.length);
            } else { // Uncomment range
                var selText = cm.getRange(from, to);
                var startIndex = selText.indexOf(curMode.commentStart);
                var endIndex = selText.lastIndexOf(curMode.commentEnd);
                if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
                    // Take string till comment start
                    selText = selText.substr(0, startIndex)
                        // From comment start till comment end
                        + selText.substring(startIndex + curMode.commentStart.length, endIndex)
                        // From comment end till string end
                        + selText.substr(endIndex + curMode.commentEnd.length);
                }
                cm.replaceRange(selText, from, to);
            }
        });
    });

    CodeMirror.defineExtension("autoIndentRange", function (from, to) {
        var cmInstance = this;
        this.operation(function () {
            for (var i = from.line; i <= to.line; i++) {
                cmInstance.indentLine(i, "smart");
            }
        });
    });

    CodeMirror.defineExtension("autoFormatRange", function (from, to) {
        var cm = this;
        var outer = cm.getMode(), text = cm.getRange(from, to).split("\n");
        var state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
        var tabSize = cm.getOption("tabSize");

        var out = "", lines = 0, atSol = from.ch == 0;
        function newline() {
            out += "\n";
            atSol = true;
            ++lines;
        }

        for (var i = 0; i < text.length; ++i) {
            var stream = new CodeMirror.StringStream(text[i], tabSize);
            while (!stream.eol()) {
                var inner = CodeMirror.innerMode(outer, state);
                var style = outer.token(stream, state), cur = stream.current();
                stream.start = stream.pos;
                if (!atSol || /\S/.test(cur)) {
                    out += cur;
                    atSol = false;
                }

                if (!atSol && inner.mode.newlineAfterToken &&
                    inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i + 1] || "", inner.state))
                    newline();
            }
            if (!stream.pos && outer.blankLine) outer.blankLine(state);
            if (!atSol) newline();
        }

        cm.operation(function () {
            cm.replaceRange(out, from, to);
            for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
                cm.indentLine(cur, "smart");
            cm.setSelection(from, cm.getCursor(false));
        });
    });
}
