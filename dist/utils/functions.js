export function appendAnchorTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'a');
}
export function appendCanvasTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'canvas');
}
export function appendDetailsTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'details');
}
export function appendDivTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'div');
}
export function insertDivBefore(parent, options, before) {
    return insertHTMLElementBefore(parent, options, 'div', before);
}
export function appendInputTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'input');
}
export function appendLinkTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'link');
}
export function appendOptionTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'option');
}
export function appendSelectTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'select');
}
export function appendSpanTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'span');
}
export function appendSummaryTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'summary');
}
export function appendTextAreaTo(parent, options) {
    return appendHTMLElementTo(parent, options, 'textarea');
}
export function randomHex(digits) {
    return Math.floor((1 + Math.random()) * Math.pow(16, digits)).toString(16).substring(1);
}
function appendHTMLElementTo(parent, options, tag) {
    const element = document.createElement(tag);
    setAttributes(element, options);
    parent.appendChild(element);
    return element;
}
function insertHTMLElementBefore(parent, options, tag, before) {
    const element = document.createElement(tag);
    setAttributes(element, options);
    parent.insertBefore(element, before);
    return element;
}
/**
 * Set attributes of a DOM element. The `style` property is special-cased to
 * accept an object whose own attributes are assigned to element.style.
 */
function setAttributes(element, attributes) {
    for (const prop in attributes) {
        if (prop === 'style') {
            setStyle(element, attributes[prop]);
        }
        else if (prop === 'dataset') {
            setDataset(element, attributes[prop]);
        }
        else {
            element.setAttribute(prop, attributes[prop]);
        }
    }
}
function setStyle(element, style) {
    for (const cssProp in style) {
        if (!style.hasOwnProperty(cssProp))
            continue;
        element.style[cssProp] = style[cssProp];
    }
}
function setDataset(element, dataset) {
    for (const value in dataset) {
        element.dataset[value] = dataset[value];
    }
}
//# sourceMappingURL=functions.js.map