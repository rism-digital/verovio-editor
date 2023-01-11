/**
 * The DialogGhExport class for navigating GitHub and writing a file.
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
import { Dialog } from './dialog.js';
import { appendDivTo } from './utils/functions.js';
export class DialogGhImport extends Dialog {
    constructor(div, app, title, options, githubManager) {
        super(div, app, title, options);
        this.iconsBranch = `${app.host}/icons/dialog/branch.png`;
        this.iconsInstitution = `${app.host}/icons/dialog/institution.png`;
        this.iconsFile = `${app.host}/icons/dialog/file.png`;
        this.iconsFolder = `${app.host}/icons/dialog/folder.png`;
        this.iconsRepo = `${app.host}/icons/dialog/repo.png`;
        this.iconsUser = `${app.host}/icons/dialog/user.png`;
        // output members
        this.data = null;
        this.filename = '';
        this.githubManager = githubManager;
        this.tabs = appendDivTo(this.content, { class: `vrv-dialog-tabs` });
        this.tabUser = appendDivTo(this.tabs, { class: `vrv-dialog-tab active`, dataset: { tab: `user` } });
        this.tabUser.innerHTML = 'User / Organisations';
        this.eventManager.bind(this.tabUser, 'click', this.selectTab);
        this.tabRepo = appendDivTo(this.tabs, { class: `vrv-dialog-tab`, dataset: { tab: `rep` } });
        this.tabRepo.innerHTML = 'Repositories';
        this.eventManager.bind(this.tabRepo, 'click', this.selectTab);
        this.tabBranch = appendDivTo(this.tabs, { class: `vrv-dialog-tab`, dataset: { tab: `branch` } });
        this.tabBranch.innerHTML = 'Branches';
        this.eventManager.bind(this.tabBranch, 'click', this.selectTab);
        this.tabFile = appendDivTo(this.tabs, { class: `vrv-dialog-tab`, dataset: { tab: `file` } });
        this.tabFile.innerHTML = 'Files';
        this.eventManager.bind(this.tabFile, 'click', this.selectTab);
        this.loading = appendDivTo(this.content, { class: `vrv-dialog-gh-loading` });
        this.list = appendDivTo(this.content, { class: `vrv-dialog-gh-list` });
        this.selection = appendDivTo(this.content, { class: `vrv-dialog-gh-selection` });
        this.breadCrumbs = appendDivTo(this.content, { class: `vrv-dialog-breadcrumbs` });
        // Hide the OK button because the selection is done by clicking on a file
        this.okBtn.style.display = 'none';
        if (this.githubManager.selectedBranchName !== '') {
            this.listFiles();
        }
        else {
            this.listRepos();
        }
    }
    loadingStart(tab) {
        for (const node of this.tabs.querySelectorAll('.vrv-dialog-tab')) {
            node.classList.remove("selected");
        }
        tab.classList.add("selected");
        this.list.innerHTML = "";
        this.list.style.display = 'none';
        this.loading.style.display = 'block';
    }
    loadingEnd() {
        this.list.innerHTML = "";
        this.list.style.display = 'flex';
        this.loading.style.display = 'none';
    }
    addItemToList(name, icon, dataset, checked, bind) {
        const item = appendDivTo(this.list, { class: `vrv-dialog-gh-item`, style: { backgroundImage: `url(${icon})` }, 'data-before': `${name}` });
        const keys = Object.keys(dataset);
        ;
        for (let i = 0; i < keys.length; i++) {
            item.dataset[keys[i]] = dataset[keys[i]];
        }
        if (checked)
            item.classList.add("checked");
        this.eventManager.bind(item, 'click', bind);
    }
    updateSelectionAndBreadcrumbs() {
        this.selection.style.display = 'none';
        this.selection.innerHTML = '';
        this.selection.style.display = 'none';
        this.breadCrumbs.innerHTML = '';
        const icon = (this.githubManager.selectedOrganization !== null) ? this.iconsInstitution : this.iconsUser;
        if (!this.addSelection(this.githubManager.selectedAccountName, icon))
            return;
        if (!this.addSelection(this.githubManager.selectedRepoName, this.iconsRepo))
            return;
        if (!this.addSelection(this.githubManager.selectedBranchName, this.iconsBranch))
            return;
        const path = this.githubManager.selectedPath;
        if (path.length < 2)
            return;
        this.breadCrumbs.style.display = 'flex';
        for (let i = 0; i < path.length; i++)
            this.addCrumb(path[i], i + 1);
    }
    addSelection(name, icon) {
        if (name === '')
            return false;
        this.selection.style.display = 'flex';
        const selection = appendDivTo(this.selection, { class: `vrv-dialog-gh-selection-item`, style: { backgroundImage: `url(${icon})` } });
        selection.innerHTML = name;
        return true;
    }
    addCrumb(name, value) {
        const crumb = appendDivTo(this.breadCrumbs, { class: `vrv-dialog-breadcrumb` });
        crumb.innerHTML = name;
        crumb.dataset.value = value.toString();
        this.eventManager.bind(crumb, 'click', this.selectCrumb);
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    selectTab(e) {
        const element = e.target;
        switch (element.dataset.tab) {
            case ('user'):
                this.listUsers();
                break;
            case ('repo'):
                this.listRepos();
                break;
            case ('branch'):
                this.listBranches();
                break;
            case ('file'):
                this.listFiles();
                break;
        }
    }
    listUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadingStart(this.tabUser);
            const orgs = yield this.githubManager.user.listOrgs();
            this.loadingEnd();
            const userChecked = (this.githubManager.selectedAccountName === this.githubManager.login);
            this.addItemToList(this.githubManager.login, this.iconsUser, { login: this.githubManager.login }, userChecked, this.selectUser);
            for (let i = 0; i < orgs.data.length; i++) {
                const login = orgs.data[i].login;
                const checked = (this.githubManager.selectedAccountName === login);
                this.addItemToList(login, this.iconsInstitution, { login: login }, checked, this.selectUser);
            }
            this.updateSelectionAndBreadcrumbs();
        });
    }
    listRepos() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadingStart(this.tabRepo);
            let repos;
            if (this.githubManager.selectedOrganization !== null) {
                repos = yield this.githubManager.selectedOrganization.getRepos();
            }
            else {
                repos = yield this.githubManager.selectedUser.listRepos({ type: 'owner' });
            }
            repos.data.sort((a, b) => (a.name > b.name) ? 1 : -1);
            this.loadingEnd();
            for (let i = 0; i < repos.data.length; i++) {
                const name = repos.data[i].name;
                const checked = (this.githubManager.selectedRepoName === name);
                this.addItemToList(name, this.iconsRepo, { name: name }, checked, this.selectRepo);
            }
            this.updateSelectionAndBreadcrumbs();
        });
    }
    listBranches() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.githubManager.selectedRepo === null) {
                this.app.showNotification("Select a repository first");
                return;
            }
            this.loadingStart(this.tabBranch);
            const branches = yield this.githubManager.selectedRepo.listBranches();
            branches.data.sort((a, b) => (a.name > b.name) ? 1 : -1);
            this.loadingEnd();
            for (let i = 0; i < branches.data.length; i++) {
                const name = branches.data[i].name;
                const checked = (this.githubManager.selectedBranchName === name);
                this.addItemToList(name, this.iconsBranch, { name: name }, checked, this.selectBranch);
            }
            this.updateSelectionAndBreadcrumbs();
        });
    }
    listFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.githubManager.selectedRepo === null) {
                this.app.showNotification("Select a repository first");
                return;
            }
            this.loadingStart(this.tabFile);
            const branch = this.githubManager.selectedBranchName;
            const path = this.githubManager.getPathString();
            const contents = yield this.githubManager.selectedRepo.getContents(branch, path);
            contents.data.sort((a, b) => (a.type > b.type) ? 1 : -1);
            this.loadingEnd();
            if (this.githubManager.selectedPath.length > 1) {
                this.addItemToList('..', this.iconsFolder, { name: '..', type: 'dir' }, false, this.selectFile);
            }
            for (let i = 0; i < contents.data.length; i++) {
                const name = contents.data[i].name;
                const type = contents.data[i].type;
                const icon = (type === 'dir') ? this.iconsFolder : this.iconsFile;
                this.addItemToList(name, icon, { name: name, type: type }, false, this.selectFile);
            }
            this.updateSelectionAndBreadcrumbs();
        });
    }
    selectUser(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            yield this.githubManager.selectAccount(element.dataset.login);
            this.listRepos();
        });
    }
    selectRepo(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            yield this.githubManager.selectRepo(element.dataset.name);
            this.listBranches();
        });
    }
    selectBranch(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            yield this.githubManager.selectBranch(element.dataset.name);
            this.listFiles();
        });
    }
    selectFile(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = e.target;
            if (element.dataset.type === 'dir') {
                if (element.dataset.name === '..') {
                    this.githubManager.selectedPath.pop();
                }
                else {
                    this.githubManager.appendToPath(element.dataset.name);
                }
                this.listFiles();
            }
            else {
                const branch = this.githubManager.selectedBranchName;
                const filename = this.githubManager.getPathString() + '/' + element.dataset.name;
                const contents = yield this.githubManager.selectedRepo.getContents(branch, filename, true);
                this.data = contents.data;
                this.filename = element.dataset.name;
                this.ok();
            }
        });
    }
    selectCrumb(e) {
        const element = e.target;
        this.githubManager.slicePathTo(Number(element.dataset.value));
        this.listFiles();
    }
}
