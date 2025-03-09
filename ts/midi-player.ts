/**
 * The MidiPlayer class interfacing with lower level midi functions.
 */

import { ResponsiveView } from './responsive-view.js';
import { MidiToolbar } from './midi-toolbar.js';
import { appendHTMLElementTo } from './utils/functions.js';


//let song = "data:audio/midi;base64,TVRoZAAAAAYAAQADAHhNVHJrAAAABAD/LwBNVHJrAAAJPR6QPkAekD4AAJBAQB6QQAAAkEJAHpBCAACQQ0AekEMAAJBFQB6QRQAAkEZAHpBGAACQQ0AekEMAAJBFQB6QRQAAkENAHpBDAACQQkAekEIAAJBAQB6QQAAAkD5AHpA+AACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBBQB6QQQAAkEBAHpBAAACQPkAekD4AAJA8QB6QPAAAkEZAHpBGAACQRUAekEUAAJBDQB6QQwAAkEpAHpBKAACQSEAekEgAAJBGQB6QRgAAkEpAHpBKAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBFQB6QRQAAkEZAHpBGAACQSEAekEgAAJBKQB6QSgAAkExAHpBMAACQTUA8kE0AAJBKQDyQSgA8kEpAPJBKAACQS0AekEsAAJBKQB6QSgAAkEhAHpBIAACQSkAekEoAAJBLQDyQSwAAkExAPJBMAACQTUAekE0AAJBMQB6QTAAAkEpAHpBKAACQTEAekEwAAJBNQDyQTQAAkE5APJBOAACQT0A8kE8AAJBKQB6QSgAAkEhAHpBIAACQSkAekEoAAJBLQB6QSwAAkE1AHpBNAACQSkAekEoAAJBLQB6QSwAAkEpAHpBKAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQT0AekE8AAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEpAHpBKAACQTEAekEwAAJBNQB6QTQAAkE9AHpBPAACQUUAekFEAAJBNQB6QTQAAkE9AHpBPAACQTUAekE0AAJBMQB6QTAAAkEpAHpBKAACQSUAekEkAAJBSQB6QUgAAkFFAHpBRAACQT0AekE8AAJBNQHiQTQAAkE1AHpBNAACQT0AekE8AAJBRQB6QUQAAkFJAHpBSAACQSUAekEkAAJBKQB6QSgAAkExAHpBMAACQSkAekEoAAJBJQDyQSQAAkEhAPJBIAACQR0AekEcAAJBIQB6QSAAAkEpAHpBKAACQSEAekEgAAJBHQDyQRwAAkEZAPJBGAACQRUA8kEUAAJBKQHiQSgAAkElAPJBJAACQRUA8kEUAAJBNQHiQTQAAkExAPJBMAACQRUA8kEUAAJBRQHiQUQAAkE9APJBPAACQT0A8kE8AAJBNQB6QTQAAkExAHpBMAACQTUAekE0AAJBKQB6QSgAAkExAHpBMAACQSUAekEkAAJBKQFqQSgAAkExAHpBMAACQTEBakEwAAJBKQB6QSgAAkEpAPJBKAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQRkAekEYAAJBIQB6QSAAAkEVAHpBFAACQRkAekEYAAJBFQB6QRQAAkENAHpBDAACQQUAekEEAAJBAQB6QQAAAkEpAHpBKAACQSEAekEgAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBFQB6QRQAAkEdAHpBHAACQSEB4kEgAAJBIQB6QSAAAkEVAHpBFAACQR0AekEcAAJBIQB6QSAAAkEpAeJBKAACQSkAekEoAAJBDQB6QQwAAkEVAHpBFAACQR0AekEcAAJBIQB6QSAAAkEpAHpBKAACQS0AekEsAAJBIQB6QSAAAkEpAHpBKAACQSEAekEgAAJBHQB6QRwAAkEVAHpBFAACQQ0AekEMAAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEZAHpBGAACQREAekEQAAJBDQB6QQwAAkEFAHpBBAACQS0AekEsAAJBKQB6QSgAAkEhAHpBIAACQT0AekE8AAJBNQB6QTQAAkEtAHpBLAACQT0AekE8AAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEpAHpBKAACQS0AekEsAAJBNQB6QTQAAkE9AHpBPAACQUEAekFAAAJBHQDyQRwAAkEpAPJBKADyQQUA8kEEAAJA/QDyQPwAAkEhAPJBIAACQPkA8kD4AAJBHQDyQRwAAkEhAHpBIAACQQ0AekEMAAJBIQB6QSAAAkEpAHpBKAACQS0B4kEsAAJBLQB6QSwAAkEhAHpBIAACQSkAekEoAAJBLQB6QSwAAkE1AeJBNAACQTUA8kE0AAJBLQB6QSwAAkEpAHpBKAACQT0BakE8AAJBNQB6QTQAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEZAHpBGAACQRUAekEUAAJBDQB6QQwAAkEJAHpBCAACQRUAekEUAAJA/QB6QPwAAkD5AHpA+AACQQEAekEAAAJBCQB6QQgAAkENAHpBDAACQRUAekEUAAJBGQB6QRgAAkENAHpBDAACQRUAekEUAAJBDQB6QQwAAkEJAHpBCAACQQEAekEAAAJA+QB6QPgAAkEhAHpBIAACQRkAekEYAAJBFQB6QRQAAkENAHpBDAACQQUAekEEAAJBAQB6QQAAAkD5AHpA+AACQPEAekDwAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBKQB6QSgAAkEhAHpBIAACQRkAekEYAAJBKQB6QSgAAkEhAHpBIAACQRkAekEYAAJBFQB6QRQAAkEhAHpBIAACQRkAekEYAAJBFQB6QRQAAkENAHpBDAACQRkAekEYAAJBFQB6QRQAAkENAHpBDAACQQkAekEIAAJBFQB6QRQAAkENAHpBDAACQRUAekEUAAJBGQB6QRgAAkEhAHpBIAACQSkAekEoAAJBMQB6QTAAAkE5AHpBOAACQT0AekE8AAJBRQB6QUQAAkE5AHpBOAACQT0AekE8AAJBRQB6QUQAAkEpAeJBKAACQSkAekEoAAJBIQB6QSAAAkEtAHpBLAACQSkAekEoAAJBIQB6QSAAAkEZAHpBGAACQRUAekEUAAJBIQB6QSAAAkEJAHpBCAACQRUAekEUAAJBGQB6QRgAAkEVAHpBFAACQQ0AekEMAAJBBQB6QQQAAkD9AHpA/AACQQ0AekEMAAJA9QB6QPQAAkENAHpBDAACQRUAekEUAAJBGQB6QRgAAkD5AHpA+AACQRUAekEUAAJBDQB6QQwAAkEJAHpBCAACQQ0CBcJBDAAD/LwBNVHJrAAAI5QCQK0B4kCsAPJA3QDyQNwAAkDZAHpA2AACQN0AekDcAAJA5QB6QOQAAkDdAHpA3AACQNkA8kDYAAJA1QDyQNQAAkDRAHpA0AACQNUAekDUAAJA3QB6QNwAAkDVAHpA1AACQNEA8kDQAAJAzQDyQMwAAkDJAPJAyAACQN0B4kDcAAJA2QDyQNgAAkDdAHpA3AACQMkAekDIAAJA0QB6QNAAAkDZAHpA2AACQN0AekDcAAJA5QB6QOQAAkDpAHpA6AACQN0AekDcAAJA5QB6QOQAAkDdAHpA3AACQNUAekDUAAJA0QB6QNAAAkDJAHpAyAACQPEAekDwAAJA6QB6QOgAAkDlAHpA5AACQN0AekDcAAJA1QB6QNQAAkDNAHpAzAACQMkAekDIAAJAwQB6QMAAAkDpAHpA6AACQOUAekDkAAJA3QB6QNwAAkD5AHpA+AACQPEAekDwAAJA6QB6QOgAAkD5AHpA+AACQPEAekDwAAJA6QB6QOgAAkDlAHpA5AACQPEAekDwAAJA6QB6QOgAAkDlAHpA5AACQN0AekDcAAJA5QB6QOQAAkDpAHpA6AACQPEAekDwAAJA+QB6QPgAAkDpAHpA6AACQPEA8kDwAAJAzQDyQMwAAkDVAPJA1AACQKUA8kCkAAJAuQDyQLgAAkDpAPJA6AACQOUA8kDkAAJA+QDyQPgAAkDpAPJA6AACQN0A8kDcAAJA5QDyQOQAAkC1APJAtAACQJkAekCYAAJAtQB6QLQAAkC9AHpAvAACQMUAekDEAAJAyQB6QMgAAkDRAHpA0AACQNUAekDUAAJAyQB6QMgAAkDRAHpA0AACQMkAekDIAAJAxQB6QMQAAkC9AHpAvAACQLUAekC0AAJA3QB6QNwAAkDVAHpA1AACQNEAekDQAAJAyQB6QMgAAkDBAHpAwAACQL0AekC8AAJAtQB6QLQAAkCtAHpArAACQNUAekDUAAJA0QB6QNAAAkDJAHpAyAACQOUAekDkAAJA3QB6QNwAAkDVAHpA1AACQOUAekDkAAJA3QB6QNwAAkDVAHpA1AACQNEAekDQAAJA3QB6QNwAAkDVAHpA1AACQNEAekDQAAJAyQB6QMgAAkDVAHpA1AACQNEAekDQAAJAyQB6QMgAAkDFAHpAxAACQNEAekDQAAJAyQB6QMgAAkDRAHpA0AACQNUAekDUAAJAyQB6QMgAAkDdAHpA3AACQOUAekDkAAJA8QB6QPAAAkDdAHpA3AACQPUAekD0AAJA5QB6QOQAAkDtAHpA7AACQPUAekD0AAJA+QB6QPgAAkDVAHpA1AACQN0AekDcAAJA5QB6QOQAAkDpAHpA6AACQNEAekDQAAJA1QB6QNQAAkDdAHpA3AACQOUA8kDkAAJAtQDyQLQAAkDJAeJAyAB6QMkAekDIAAJA0QB6QNAAAkDVAHpA1AACQN0AekDcAAJA5QB6QOQAAkDpAHpA6AACQN0AekDcAAJA8QDyQPAAAkDBAPJAwAACQNUA8kDUAAJAzQB6QMwAAkDJAHpAyAACQM0AekDMAAJA1QB6QNQAAkDdAHpA3AACQM0AekDMAAJA1QB6QNQAAkDNAHpAzAACQMkAekDIAAJAwQB6QMAAAkC9AHpAvAACQOEAekDgAAJA3QB6QNwAAkDVAHpA1AACQM0AekDMAAJAyQB6QMgAAkDBAHpAwAACQMkAekDIAAJAzQB6QMwAAkDVAHpA1AACQN0AekDcAAJA4QB6QOAAAkC9APJAvAACQK0A8kCsAPJArQDyQKwAAkCxAHpAsAACQK0AekCsAAJApQB6QKQAAkCtAHpArAACQLEA8kCwAAJAtQDyQLQAAkC5AHpAuAACQLUAekC0AAJArQB6QKwAAkC1AHpAtAACQLkA8kC4AAJAvQDyQLwAAkDBAHpAwAACQK0AekCsAAJAtQB6QLQAAkC9AHpAvAACQMEAekDAAAJAyQB6QMgAAkDNAHpAzAACQMEAekDAAAJAyQB6QMgAAkDBAHpAwAACQL0AekC8AAJAtQB6QLQAAkCtAHpArAACQNUAekDUAAJAzQB6QMwAAkDJAHpAyAACQMEAekDAAAJAuQB6QLgAAkCxAHpAsAACQK0AekCsAAJApQB6QKQAAkCdAHpAnAACQKUAekCkAAJArQB6QKwAAkCRAHpAkAACQMkAekDIAAJAzQB6QMwAAkDVAHpA1AACQN0AekDcAAJA4QB6QOAAAkDpAHpA6AACQN0AekDcAAJA4QB6QOAAAkDdAHpA3AACQNUAekDUAAJAzQB6QMwAAkDJAHpAyAACQPEAekDwAAJA6QB6QOgAAkDhAHpA4AACQN0AekDcAAJA1QB6QNQAAkDdAHpA3AACQOUAekDkAAJA6QB6QOgAAkDxAHpA8AACQPkAekD4AAJA6QB6QOgAAkDxAHpA8AACQOkAekDoAAJA5QB6QOQAAkDdAHpA3AACQNkAekDYAAJA/QB6QPwAAkD5AHpA+AACQPEAekDwAAJA6QHiQOgAAkDpAHpA6AACQPEAekDwAAJA+QB6QPgAAkD9AHpA/AACQNkAekDYAAJA3QB6QNwAAkDlAHpA5AACQN0AekDcAAJA2QDyQNgAAkDVAPJA1AACQNEAekDQAAJA1QB6QNQAAkDdAHpA3AACQNUAekDUAAJA0QDyQNAAAkDNAPJAzAACQMkA8kDIAAJA3QHiQNwAAkDZAPJA2AACQMkA8kDIAAJA6QHiQOgAAkDlAPJA5AACQMkA8kDIAAJA+QHiQPgAAkDxAPJA8AACQPEAekDwAAJA/QB6QPwAAkD5AHpA+AACQPEAekDwAAJA6QB6QOgAAkDlAHpA5AACQN0AekDcAAJA6QB6QOgAAkDNAeJAzAACQM0AekDMAAJAyQB6QMgAAkDBAHpAwAACQM0AekDMAAJAtQDyQLQAAkDJAPJAyAACQMkA8kDIAAJAwQDyQMAAAkC5APJAuAACQLUAekC0AAJArQB6QKwAAkDJAPJAyAACQJkA8kCYAAJArQIFwkCsAAP8vAA==";

interface MidiPlayerElement extends HTMLElement {
    start(): void;
    pause(): void;
    stop(): void;
    currentTime: number;
    duration: number;
    playing: boolean;
}

function appendMidiPlayerTo(parent: HTMLElement, options: object): MidiPlayerElement {
    const midiPlayer = <MidiPlayerElement>appendHTMLElementTo(parent, options, 'midi-player');
    midiPlayer.setAttribute('sound-font', '');
    midiPlayer.style.display = 'none';
    return midiPlayer;
}

export class MidiPlayer {
    private midiPlayerElement: MidiPlayerElement;
    currentTime: number;
    currentTimeStr: string;
    totalTime: number;
    totalTimeStr: string;
    midiToolbar: MidiToolbar;
    view: ResponsiveView;
    progressBarTimer: number | null;

    constructor(midiToolbar: MidiToolbar) {
        
        this.midiToolbar = midiToolbar;
        this.midiToolbar.midiPlayer = this;

        this.midiPlayerElement = appendMidiPlayerTo(this.midiToolbar.element, {});
        this.midiPlayerElement.addEventListener('load', () => this.play());
        this.midiPlayerElement.addEventListener('note', () => this.onUpdateNoteTime(this.midiPlayerElement.currentTime));
        this.midiPlayerElement.addEventListener('stop', (e: CustomEvent) => this.onStop(e));

        this.currentTime = 0;
        this.currentTimeStr = "0.00";
        this.totalTime = 0;
        this.totalTimeStr = "0.00";

        this.progressBarTimer = null;

        // A view responding to midiUpdate and midiStop
        this.view = null;
    }

    ////////////////////////////////////////////////////////////////////////
    // Public method to be called by the user
    ////////////////////////////////////////////////////////////////////////

    playFile(midiFile: string): void {
        this.midiPlayerElement.setAttribute('src', midiFile);
        // play called by html-midi-player callback
    }

    play(): void {
        this.midiPlayerElement.start();

        // html-midi-player time is in seconds
        this.totalTime = this.midiPlayerElement.duration * 1000;
        this.totalTimeStr = this.samplesToTime(this.totalTime);
        this.currentTime = this.midiPlayerElement.currentTime * 1000;
        this.currentTimeStr = this.samplesToTime(this.currentTime);

        this.startTimer();

        this.midiToolbar.pausing = false;
        this.midiToolbar.playing = true;
        this.midiToolbar.updateAll();
    }

    stop(): void {
        this.currentTime = 0;
        this.currentTimeStr = "0.00";
        this.totalTime = 0;
        this.totalTimeStr = "0.00";

        this.midiPlayerElement.stop();
        this.stopTimer();

        this.midiToolbar.pausing = false;
        this.midiToolbar.playing = false;
        this.midiToolbar.updateAll();

        if (this.view) this.view.midiStop();
    }

    pause(): void {
        this.midiPlayerElement.stop();
        this.stopTimer();

        this.midiToolbar.pausing = true;
        this.midiToolbar.playing = false;
        this.midiToolbar.updateAll();

        if (this.view) this.view.midiStop();
    }

    seekToPercent(percent: number): void {
        if (!this.midiPlayerElement.playing) return;

        let seekTime = this.totalTime * percent;
        this.stopTimer();
        this.midiPlayerElement.currentTime = (seekTime / 1000);
        // play called by html-midid-player callback
    }

    ////////////////////////////////////////////////////////////////////////
    // Internal methods for updating the UI
    ////////////////////////////////////////////////////////////////////////

    onUpdateNoteTime(time: number): void {        
        const midiTime = time * 1000;
        // If the progress bar timer is behind, use the note time
        if (this.currentTime < midiTime) {
            this.currentTime = midiTime;
            this.onUpdate(this.currentTime);
        }
    }

    onUpdate(time: number): void {
        this.currentTime = time;
        this.currentTimeStr = this.samplesToTime(this.currentTime);

        this.midiToolbar.updateProgressBar();

        if (this.view) this.view.midiUpdate(time);
    }

    onStop(e: CustomEvent): void {
        // Custom event from the html-midi-player
        if (e.detail.finished) {
            this.midiToolbar.pausing = false;
            this.midiToolbar.playing = false;
            this.midiToolbar.updateAll();

            if (this.view) this.view.midiStop();
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Internal methods
    ////////////////////////////////////////////////////////////////////////


    startTimer(): void {
      if (this.progressBarTimer === null) {
        this.progressBarTimer = setInterval(() => {
            this.onUpdate(this.currentTime);
            this.currentTime += 50;
        }, 50);
      }
    }

    stopTimer(): void {
      if (this.progressBarTimer !== null) {
        clearInterval(this.progressBarTimer);
          this.progressBarTimer = null;
      }
    }

    samplesToTime(time: number): string {
        let timeInSec = Math.floor( time / 1000 );
        let sec = timeInSec % 60;
        let min = timeInSec / 60 | 0;
        return min + ':' + ( sec === 0 ? '00' : sec < 10 ? '0' + sec : sec );        
    }
}
