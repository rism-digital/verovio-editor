/**
 * The XMLEditorView class implements an code editor, with validation and code completion.
 * It uses the CodeMirror editor package and a ValidatorMessenger
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GenericView } from './generic-view.js';
import { appendDivTo, appendTextAreaTo } from './utils/functions.js';
const theme = "vrv"; // default for light theme
export class XMLEditorView extends GenericView {
    constructor(div, app, validator, rngLoader) {
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
        this.loaded = false;
        this.timestamp = Date.now();
        this.skipValidation = false;
        this.formatting = false;
        const cmThis = this;
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
                "'='": completeIfInTag
            },
            gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
            lint: {
                "caller": cmThis,
                "getAnnotations": this.validate,
                "async": true
            }
        });
        this.CMeditor.on("cursorActivity", function (cm) {
            cmThis.onCursorActivity(cm);
        });
        this.CMeditor.on("focus", function (cm) {
            cmThis.onFocus(cm);
        });
        this.CMeditor.on("keyHandled", function (cm, string, event) {
            cmThis.keyHandled(cm, string, event);
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    validate(text, updateLinting, options) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.debug( "XMLEditorView::validate");
            if (options && options.caller && text) {
                const editor = options.caller;
                //console.debug( "XMLEditorView::validate", editor );
                if (editor.formatting)
                    return;
                if (editor.skipValidation)
                    return;
                // keep the callback
                if (editor.xmlValid) {
                    editor.xmlValid.classList.remove("ok");
                    editor.xmlValid.classList.remove("error");
                    editor.xmlValid.classList.add("wait");
                }
                editor.updateLinting = updateLinting;
                editor.app.startLoading("Validating ...", true);
                let validation = "[]";
                if (editor.app.options.enableValidation) {
                    validation = yield editor.validator.validateNG(text);
                }
                else {
                    validation = yield editor.validator.check(text);
                }
                editor.app.endLoading(true);
                editor.highlightValidation(text, validation, editor.timestamp);
            }
        });
    }
    suspendedValidate(text, updateLinting, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Do nothing...
        });
    }
    replaceSchema(schemaFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(schemaFile);
                const data = yield response.text();
                if (this.app.options.enableValidation) {
                    const res = yield this.validator.setRelaxNGSchema(data);
                    console.log("New schema loaded", res);
                }
                this.rngLoader.setRelaxNGSchema(data);
                this.CMeditor.options.hintOptions.schemaInfo = this.rngLoader.tags;
                return true;
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    setCurrent(id) {
        //console.debug( "XMLEditorView::setCurrent" );
        const cursor = this.CMeditor.getSearchCursor(`xml:id="${id}"`);
        cursor.findNext();
        if (cursor.atOccurrence) {
            // Move with a margin in order to make the highlighted line more visible
            this.CMeditor.scrollIntoView({ line: cursor.pos.from.line, char: 0 }, this.element.clientHeight / 2);
            this.CMeditor.setCursor(cursor.from());
        }
    }
    highlightValidation(text, validation, timestamp) {
        let lines = [];
        let found = [];
        let i = 0;
        let messages = [];
        try {
            lines = text.split("\n");
            messages = JSON.parse(validation);
        }
        catch (err) {
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
            if (this.loaded && timestamp === this.timestamp) {
                this.app.mei = text;
                this.app.startLoading("Updating data ...", true);
                let event = new CustomEvent('onUpdateData', {
                    detail: {
                        caller: this
                    }
                });
                this.app.customEventManager.dispatch(event);
            }
            else if (!this.loaded && timestamp === this.timestamp) {
                this.loaded = true;
            }
            else {
                console.log("Validated data is obsolete");
            }
            this.xmlValid.classList.remove("wait");
            this.xmlValid.classList.remove("error");
            this.xmlValid.classList.add("ok");
        }
        else {
            this.xmlValid.classList.remove("wait");
            this.xmlValid.classList.remove("ok");
            this.xmlValid.classList.add("error");
        }
    }
    formatXML() {
        console.debug("XMLEditorView::FormatXML");
        this.formatting = true;
        this.skipValidation = true;
        // Suspend lint.getAnnotations to avoid recursive callbacks
        this.CMeditor.options.lint.getAnnotations = this.suspendedValidate;
        // Store the current line
        let currentLine = this.CMeditor.getCursor();
        var totalLines = this.CMeditor.lineCount();
        this.CMeditor.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
        // Reset everything
        this.formatting = false;
        this.skipValidation = false;
        this.CMeditor.options.lint.getAnnotations = this.validate;
        this.CMeditor.setCursor(currentLine);
    }
    getValue() {
        return this.CMeditor.getValue();
    }
    ////////////////////////////////////////////////////////////////////////
    // Codemirror event methods
    ////////////////////////////////////////////////////////////////////////
    onCursorActivity(cm) {
        if (this.formatting)
            return;
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
                this.skipValidation = false;
                this.app.customEventManager.dispatch(event);
            }
            this.currentId = id[1];
        }
    }
    keyHandled(cm, string, event) {
        if (event.ctrlKey && event.shiftKey && event.key === "P") {
            this.formatXML();
        }
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
    onFocus(cm) {
        //console.debug( "XMLEditorView::onFocus" );
        this.skipValidation = false;
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("XMLEditorView::onActivate");
        this.CMeditor.setValue(this.app.mei);
        this.CMeditor.refresh();
        this.CMeditor.setSize(this.element.style.width, this.element.style.height);
        this.skipValidation = !this.app.options.editorSplitterShow;
        return true;
    }
    onLoadData(e) {
        if (!super.onLoadData(e))
            return false;
        //console.debug("XMLEditorView::onLoadData");
        this.timestamp = Date.now();
        this.loaded = false;
        this.CMeditor.setValue(e.detail.mei);
        this.setCurrent(this.currentId);
        return true;
    }
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        //console.debug("XMLEditorView::onSelect");
        this.currentId = e.detail.id;
        this.setCurrent(this.currentId);
        return true;
    }
    onUpdateData(e) {
        if (!super.onUpdateData(e))
            return false;
        if (this === e.detail.caller)
            return false;
        //console.debug("XMLEditorView::onUpdateData");
        this.timestamp = Date.now();
        this.loaded = true;
        this.skipValidation = true;
        this.CMeditor.setValue(this.app.mei);
        this.setCurrent(this.currentId);
        return true;
    }
    onResized(e) {
        if (!super.onResized(e))
            return false;
        //console.debug("XMLEditorView::onResized");
        this.CMeditor.setSize(this.element.style.width, this.element.style.height);
        return true;
    }
}
////////////////////////////////////////////////////////////////////////
// CodeMirror extraKeys functions 
// Could be move to XMLEditorView:: keyHandled ?
////////////////////////////////////////////////////////////////////////
function completeAfter(cm, pred) {
    let cur = cm.getCursor();
    if (!pred || pred())
        setTimeout(function () {
            if (!cm.state.completionActive)
                CodeMirror.showHint(cm, CodeMirror.hint.xml, { schemaInfo: CodeMirror.schemaInfo, completeSingle: false });
        }, 100);
    return CodeMirror.Pass;
}
function completeIfAfterLt(cm) {
    return completeAfter(cm, function () {
        let cur = cm.getCursor();
        return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
    });
}
function completeIfInTag(cm) {
    return completeAfter(cm, function () {
        let tok = cm.getTokenAt(cm.getCursor());
        if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1))
            return false;
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
            }
            else { // Uncomment range
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
            if (!stream.pos && outer.blankLine)
                outer.blankLine(state);
            if (!atSol)
                newline();
        }
        cm.operation(function () {
            cm.replaceRange(out, from, to);
            for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
                cm.indentLine(cur, "smart");
            cm.setSelection(from, cm.getCursor(false));
        });
    });
}
//# sourceMappingURL=xml-editor-view.js.map