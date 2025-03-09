/**
 * The MidiPlayer class interfacing with lower level midi functions.
 */
import { appendHTMLElementTo } from './utils/functions.js';
function appendMidiPlayerTo(parent, options) {
    const midiPlayer = appendHTMLElementTo(parent, options, 'midi-player');
    midiPlayer.setAttribute('sound-font', '');
    midiPlayer.style.display = 'none';
    return midiPlayer;
}
export class MidiPlayer {
    constructor(midiToolbar) {
        this.midiToolbar = midiToolbar;
        this.midiToolbar.midiPlayer = this;
        this.midiPlayerElement = appendMidiPlayerTo(this.midiToolbar.element, {});
        this.midiPlayerElement.addEventListener('load', () => this.play());
        this.midiPlayerElement.addEventListener('note', () => this.onUpdateNoteTime(this.midiPlayerElement.currentTime));
        this.midiPlayerElement.addEventListener('stop', (e) => this.onStop(e));
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
    playFile(midiFile) {
        this.midiPlayerElement.setAttribute('src', midiFile);
        // play called by html-midi-player callback
    }
    play() {
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
    stop() {
        this.currentTime = 0;
        this.currentTimeStr = "0.00";
        this.totalTime = 0;
        this.totalTimeStr = "0.00";
        this.midiPlayerElement.stop();
        this.stopTimer();
        this.midiToolbar.pausing = false;
        this.midiToolbar.playing = false;
        this.midiToolbar.updateAll();
        if (this.view)
            this.view.midiStop();
    }
    pause() {
        this.midiPlayerElement.stop();
        this.stopTimer();
        this.midiToolbar.pausing = true;
        this.midiToolbar.playing = false;
        this.midiToolbar.updateAll();
        if (this.view)
            this.view.midiStop();
    }
    seekToPercent(percent) {
        if (!this.midiPlayerElement.playing)
            return;
        let seekTime = this.totalTime * percent;
        this.stopTimer();
        this.midiPlayerElement.currentTime = (seekTime / 1000);
        // play called by html-midid-player callback
    }
    ////////////////////////////////////////////////////////////////////////
    // Internal methods for updating the UI
    ////////////////////////////////////////////////////////////////////////
    onUpdateNoteTime(time) {
        const midiTime = time * 1000;
        // If the progress bar timer is behind, use the note time
        if (this.currentTime < midiTime) {
            this.currentTime = midiTime;
            this.onUpdate(this.currentTime);
        }
    }
    onUpdate(time) {
        this.currentTime = time;
        this.currentTimeStr = this.samplesToTime(this.currentTime);
        this.midiToolbar.updateProgressBar();
        if (this.view)
            this.view.midiUpdate(time);
    }
    onStop(e) {
        // Custom event from the html-midi-player
        if (e.detail.finished) {
            this.midiToolbar.pausing = false;
            this.midiToolbar.playing = false;
            this.midiToolbar.updateAll();
            if (this.view)
                this.view.midiStop();
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Internal methods
    ////////////////////////////////////////////////////////////////////////
    startTimer() {
        if (this.progressBarTimer === null) {
            this.progressBarTimer = setInterval(() => {
                this.onUpdate(this.currentTime);
                this.currentTime += 50;
            }, 50);
        }
    }
    stopTimer() {
        if (this.progressBarTimer !== null) {
            clearInterval(this.progressBarTimer);
            this.progressBarTimer = null;
        }
    }
    samplesToTime(time) {
        let timeInSec = Math.floor(time / 1000);
        let sec = timeInSec % 60;
        let min = timeInSec / 60 | 0;
        return min + ':' + (sec === 0 ? '00' : sec < 10 ? '0' + sec : sec);
    }
}
//# sourceMappingURL=midi-player.js.map