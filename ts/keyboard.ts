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
    octaves: HTMLDivElement;
    keyboardWrapper: HTMLDivElement;
    keys: HTMLDivElement;
    currentOctave: number;

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
        this.eventManager.bind(left, 'click', this.activateLower);
        this.keyboardWrapper = appendDivTo(this.element, { class: `vrv-keyboard-wrapper` });
        let right = appendDivTo(this.element, { class: `vrv-keyboard-navigator`, style: { backgroundImage: `url(${iconsRight})` } });
        this.eventManager.bind(right, 'click', this.activateHigher);

        this.octaves = appendDivTo(this.keyboardWrapper, { class: `vrv-keyboard-octaves` });
        this.keys = appendDivTo(this.keyboardWrapper, { class: `vrv-keyboard-keys` });

        let octaveNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
        octaveNumbers.forEach(octave => {
            let oct = appendDivTo(this.octaves, { class: `vrv-keyboard-octave` });
            oct.innerHTML = `C${octave}`;

            let c2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-key': `A` });
            let c2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-key': `W` });
            let d2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-key': `S` });
            let d2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-key': `E` });
            let e2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-key': `D` });
            let f2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-key': `F` });
            let f2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-key': `T` });
            let g2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-key': `G` });
            let g2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-key': `Y` });
            let a2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-key': `H` });
            let a2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-key': `U` });
            let b2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-key': `J` });
        })

        this.eventManager.bind(this.element, 'mouseleave', this.mouseLeaveListener);
        this.eventManager.bind(this.element, 'mouseenter', this.mouseEnterListener);

        this.currentOctave = 3;
        this.activate();
    }

    bindListeners(): void {
        this.boundKeyDown = (e: KeyboardEvent) => this.keyDownListener(e);
    }

    keyDownListener(e: KeyboardEvent): void {
        if (e.key === 'ArrowLeft') this.activateLower();
        else if (e.key === 'ArrowRight') this.activateHigher();
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

    activateLower() {
        if (this.currentOctave <= 1) return;
        this.currentOctave--;
        this.activate();
    }

    activateHigher() {
        if (this.currentOctave >= 7) return;
        this.currentOctave++;
        this.activate();
    }

    activate() {
        this.keys.querySelectorAll('.vrv-keyboard-key').forEach(element => element.classList.remove('selected'));
        this.octaves.querySelectorAll('.vrv-keyboard-octave').forEach(element => element.classList.remove('selected'));

        let letters = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H', 'U', 'J', 'K', 'O', 'L', 'P', ';'];
        let key = this.keys.children[(this.currentOctave - 1) * 12];
        letters.forEach(letter => {
            if (key) {
                key.setAttribute('data-key', letter);
                key.classList.add('selected');
                key = key.nextElementSibling;
            }
        })
        let octave = (this.octaves.children[this.currentOctave - 1] as HTMLElement);

        octave.classList.add('selected');

        let totalWidth = this.keys.scrollWidth;
        if (totalWidth === 0) return;

        let visibleWidth = this.keys.clientWidth;
        let octaveWidth = octave.scrollWidth;
        let octaveOffset = octave.offsetLeft;
        let shift = octaveOffset - (visibleWidth / 2) + (octaveWidth / 2);
        //this.keyboardWrapper.scrollLeft = shift;
        this.keyboardWrapper.scrollBy({
            left: shift,
            behavior: "smooth",
        });
    }
}

class Octave {

}
