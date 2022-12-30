/**
 * The GitHubManager class managing a connection to GitHub through the GitHub API.
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
export class GitHubManager {
    constructor(app) {
        this.app = app;
        this.name = 'GitHub';
        this.login = 'unkown';
        this.user = null;
        this.selectedUser = null;
        this.selectedOrganization = null;
        this.selectedAccountName = '';
        this.selectedBranchName = '';
        this.selectedRepo = null;
        this.selectedRepoName = '';
        this.selectedPath = ['.'];
        this.gh = null;
        let tk = this.getSessionCookie('ghtoken');
        if (tk) {
            tk = JSON.parse(atob(tk)).ghtoken;
        }
        if (tk !== null) {
            this.gh = new GitHub({ token: tk });
            this.initUser();
        }
    }
    getSessionCookie(name) {
        let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    }
    isLoggedIn() {
        return (this.gh !== null);
    }
    storeSelection() {
        this.app.options.github =
            {
                login: this.login,
                account: this.selectedAccountName,
                repo: this.selectedRepoName,
                branch: this.selectedBranchName,
                path: this.selectedPath
            };
    }
    resetSelectedPath() {
        this.selectedPath = ["."];
    }
    getPathString() {
        return this.selectedPath.join('/');
    }
    appendToPath(dir) {
        this.selectedPath.push(dir);
        this.storeSelection();
    }
    slicePathTo(value) {
        this.selectedPath = this.selectedPath.slice(0, value);
        this.storeSelection();
    }
    initUser() {
        return __awaiter(this, void 0, void 0, function* () {
            this.user = this.gh.getUser();
            const profile = yield this.user.getProfile();
            this.login = profile.data.login;
            this.name = (profile.data.name !== null) ? profile.data.name : profile.data.login;
            // also use it as default account
            this.selectedUser = this.user;
            this.selectedAccountName = this.login;
            let options = this.app.options.github || {};
            if (options.login === this.login) {
                yield this.selectAccount(options.account);
                yield this.selectRepo(options.repo);
                yield this.selectBranch(options.branch);
                this.selectedPath = options.path;
            }
        });
    }
    selectAccount(login) {
        return __awaiter(this, void 0, void 0, function* () {
            if (login === this.login) {
                this.selectedOrganization = null;
                this.selectedUser = this.gh.getUser();
            }
            else {
                this.selectedUser = null;
                this.selectedOrganization = this.gh.getOrganization(login);
            }
            this.selectedAccountName = login;
            this.selectedBranchName = '';
            this.selectedRepo = null;
            this.selectedRepoName = '';
            this.resetSelectedPath();
            this.storeSelection();
        });
    }
    selectBranch(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (name === '')
                return;
            // Only need to check the name, but make sure it exists?
            this.selectedBranchName = name;
            this.resetSelectedPath();
            this.storeSelection();
        });
    }
    selectRepo(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (name === '')
                return;
            try {
                this.selectedRepo = this.gh.getRepo(this.selectedAccountName, name);
                const getDetails = yield this.selectedRepo.getDetails();
                this.selectedBranchName = getDetails.data.default_branch;
                this.selectedRepoName = name;
                this.resetSelectedPath();
                this.storeSelection();
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    writeFile(filename, commitMsg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.selectedRepo.writeFile(this.selectedBranchName, filename, this.app.mei, commitMsg, {});
                this.app.showNotification("File was successfully pushed to GitHub");
            }
            catch (err) {
                console.error(err);
                this.app.showNotification("Something went wrong when pushing to GitHub");
            }
        });
    }
}
