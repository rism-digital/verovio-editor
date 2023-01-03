
export function appendDivTo(parent: HTMLElement, options: object): HTMLDivElement {
    return <HTMLDivElement> appendHTMLElementTo(parent, options, 'div');
}

export function appendInputTo(parent: HTMLElement, options: object): HTMLInputElement {
    return <HTMLInputElement> appendHTMLElementTo(parent, options, 'input');
}

export function appendTextAreaTo(parent: HTMLElement, options: object): HTMLTextAreaElement {
    return <HTMLTextAreaElement> appendHTMLElementTo(parent, options, 'textarea');
}

function appendHTMLElementTo( parent: HTMLElement, options: object, tag: string ): HTMLElement {
    const element = document.createElement(tag);
    setAttributes(element, options);
    parent.appendChild(element);
    return element;
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
        else if (prop === 'dataset') {
            setDataset(element, attributes[prop]);
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

function setDataset(element: HTMLElement, dataset: object) {
    for (const value in dataset) {
        element.dataset[value] = dataset[value];
    }
}