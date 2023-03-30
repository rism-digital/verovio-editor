/**
 * The AppStatusbar class is the implementation of the application status.
 * Events are attached to the App.eventManager.
 */
import { GenericView } from './generic-view.js';
import { appendDivTo } from './utils/functions.js';
export class AppStatusbar extends GenericView {
    constructor(div, app) {
        super(div, app);
        this.active = true;
        this.statustext = appendDivTo(this.element, { class: `vrv-status-text` });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onEndLoading(e) {
        if (!super.onEndLoading(e))
            return false;
        //console.debug("AppStatusbar::onEndLoading");
        this.statustext.innerHTML = "Completed";
        return true;
    }
    onStartLoading(e) {
        if (!super.onStartLoading(e))
            return false;
        //console.debug("AppStatusbar:onStartLoading");
        let msg = (e.detail.light) ? e.detail.msg : "In progress ...";
        this.statustext.innerHTML = msg;
        return true;
    }
}
//# sourceMappingURL=app-statusbar.js.map