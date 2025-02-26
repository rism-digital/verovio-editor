/**
 * The Keyboard class.
 */

import { App } from './app.js';
import { EventManager } from './event-manager.js';
import { appendDivTo, insertDivBefore } from './utils/functions.js';

export class Keyboard {
    app: App;
    eventManager: EventManager;
    element: HTMLDivElement;

    boundKeyDown: { (event: KeyboardEvent): void };

    constructor(div: HTMLDivElement, app: App) {
        let iconsLeft = `${app.host}/icons/keyboard/left.png`;
        let iconsRight = `${app.host}/icons/keyboard/right.png`;

        this.element = div;
        // Remove previous content
        this.element.innerHTML = "";

        this.app = app;

        this.eventManager = new EventManager(this);
        this.bindListeners(); // Document/Window-scoped events

        let left = appendDivTo(this.element, { class: `vrv-keyboard-navigator`, style: { backgroundImage: `url(${iconsLeft})` } });
        let keyboardWrapper = appendDivTo(this.element, { class: `vrv-keyboard-wrapper` });
        let right = appendDivTo(this.element, { class: `vrv-keyboard-navigator`, style: { backgroundImage: `url(${iconsRight})` } });

        let octaves = appendDivTo(keyboardWrapper, { class: `vrv-keyboard-octaves` });
        let keyboard = appendDivTo(keyboardWrapper, { class: `vrv-keyboard` });

        let octaveNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
        octaveNumbers.forEach(octave => {
            let oct = appendDivTo(octaves, { class: `vrv-keyboard-octave` });
            oct.innerHTML = `C${octave}`;

            let c2 = appendDivTo(keyboard, { class: `vrv-keyboard-key white`, 'data-key': `A` });
            let c2s = appendDivTo(keyboard, { class: `vrv-keyboard-key black`, 'data-key': `W` });
            let d2 = appendDivTo(keyboard, { class: `vrv-keyboard-key white`, 'data-key': `S` });
            let d2s = appendDivTo(keyboard, { class: `vrv-keyboard-key black`, 'data-key': `E` });
            let e2 = appendDivTo(keyboard, { class: `vrv-keyboard-key white`, 'data-key': `D` });
            let f2 = appendDivTo(keyboard, { class: `vrv-keyboard-key white`, 'data-key': `F` });
            let f2s = appendDivTo(keyboard, { class: `vrv-keyboard-key black`, 'data-key': `T` });
            let g2 = appendDivTo(keyboard, { class: `vrv-keyboard-key white`, 'data-key': `G` });
            let g2s = appendDivTo(keyboard, { class: `vrv-keyboard-key black`, 'data-key': `Y` });
            let a2 = appendDivTo(keyboard, { class: `vrv-keyboard-key white`, 'data-key': `H` });
            let a2s = appendDivTo(keyboard, { class: `vrv-keyboard-key black`, 'data-key': `U` });
            let b2 = appendDivTo(keyboard, { class: `vrv-keyboard-key white`, 'data-key': `J` });
        })

        this.eventManager.bind(this.element, 'mouseleave', this.mouseLeaveListener);
        this.eventManager.bind(this.element, 'mouseenter', this.mouseEnterListener);

        //keyboard.style.left = "-50px";
    }

    bindListeners(): void {
        this.boundKeyDown = (e: KeyboardEvent) => this.keyDownListener(e);
    }

    keyDownListener(e: KeyboardEvent): void {
        console.log(e);
    }

    mouseEnterListener(e: MouseEvent): void {
        document.addEventListener('keydown', this.boundKeyDown);
    }

    mouseLeaveListener(e: MouseEvent): void {
        document.removeEventListener('keydown', this.boundKeyDown);
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
}
