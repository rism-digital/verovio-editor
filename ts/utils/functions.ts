
export function appendAnchorTo(parent: HTMLElement, options: object): HTMLAnchorElement {
    return <HTMLAnchorElement>appendHTMLElementTo(parent, options, 'a');
}

export function appendCanvasTo(parent: HTMLElement, options: object): HTMLCanvasElement {
    return <HTMLCanvasElement>appendHTMLElementTo(parent, options, 'canvas');
}

export function appendDetailsTo(parent: HTMLElement, options: object): HTMLDetailsElement {
    return <HTMLDetailsElement>appendHTMLElementTo(parent, options, 'details');
}

export function appendDivTo(parent: HTMLElement, options: object): HTMLDivElement {
    return <HTMLDivElement>appendHTMLElementTo(parent, options, 'div');
}

export function insertDivBefore(parent: HTMLElement, options: object, before: HTMLElement): HTMLDivElement {
    return <HTMLDivElement>insertHTMLElementBefore(parent, options, 'div', before);
}

export function appendInputTo(parent: HTMLElement, options: object): HTMLInputElement {
    return <HTMLInputElement>appendHTMLElementTo(parent, options, 'input');
}

export function appendLinkTo(parent: HTMLElement, options: object): HTMLLinkElement {
    return <HTMLLinkElement>appendHTMLElementTo(parent, options, 'link');
}

export function appendOptionTo(parent: HTMLSelectElement, options: object): HTMLOptionElement {
    return <HTMLOptionElement>appendHTMLElementTo(parent, options, 'option');
}

export function appendSelectTo(parent: HTMLElement, options: object): HTMLSelectElement {
    return <HTMLSelectElement>appendHTMLElementTo(parent, options, 'select');
}

export function appendSpanTo(parent: HTMLElement, options: object, text: string = "") : HTMLSpanElement {
    let span = appendHTMLElementTo(parent, options, 'span');
    span.innerHTML = text;
    return <HTMLSpanElement>span;
}

export function appendSummaryTo(parent: HTMLElement, options: object): HTMLElement {
    return <HTMLElement>appendHTMLElementTo(parent, options, 'summary');
}

export function appendTextAreaTo(parent: HTMLElement, options: object): HTMLTextAreaElement {
    return <HTMLTextAreaElement>appendHTMLElementTo(parent, options, 'textarea');
}

export function randomHex(digits: number): string {
    return Math.floor((1 + Math.random()) * Math.pow(16, digits)).toString(16).substring(1);
}

export function appendHTMLElementTo(parent: HTMLElement, options: object, tag: string): HTMLElement {
    const element = document.createElement(tag);
    setAttributes(element, options);
    parent.appendChild(element);
    return element;
}

function insertHTMLElementBefore(parent: HTMLElement, options: object, tag: string, before: HTMLElement): HTMLElement {
    const element = document.createElement(tag);
    setAttributes(element, options);
    parent.insertBefore(element, before);
    return element;
}

/**
 * interface for the html-midi-player custom element
 */

export interface MidiPlayerElement extends HTMLElement {
    start(): void;
    pause(): void;
    stop(): void;
    currentTime: number;
    duration: number;
    playing: boolean;
}

export function appendMidiPlayerTo(parent: HTMLElement, options: object): MidiPlayerElement {
    const midiPlayer = <MidiPlayerElement>appendHTMLElementTo(parent, options, 'midi-player');
    midiPlayer.setAttribute('sound-font', '');
    midiPlayer.style.display = 'none';
    return midiPlayer;
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