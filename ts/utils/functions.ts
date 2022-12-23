
export function appendDivTo(parent: HTMLElement, options: object): HTMLDivElement {
    const div = document.createElement('div');
    setAttributes(div, options);
    parent.appendChild(div);
    return div;
}

/**
 * Set attributes of a DOM element. The `style` property is special-cased to
 * accept an object whose own attributes are assigned to element.style.
 */
function setAttributes(element: HTMLElement, attributes: object) {
    for (const prop in attributes) {
        if (prop === 'style') {
            setStyle(element, attributes[prop]);
        }
        else {
            element.setAttribute(prop, attributes[prop]);
        }
    }
}

function setStyle(element: HTMLElement, style: object) {
    for (const cssProp in style) {
        if (!style.hasOwnProperty(cssProp))
            continue;

        element.style[cssProp] = style[cssProp];
    }
}