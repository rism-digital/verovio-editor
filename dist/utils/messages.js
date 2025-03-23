/**
 * Messages and values
 */
export const version = "1.4.0";
export const autoModeLimit = 0.5;
export const autoModeOff = `Live validation and synchronization from the XML editor is disabled for files larger than ${autoModeLimit}MB.\n\nPress 'Shift-Ctrl-V' to trigger validation and refreshing of the rendering.`;
export const aboutMsg = `The Verovio Editor is an experimental online MEI editor prototype. It is based on [Verovio](https://www.verovio.org) and can be connected to [GitHub](https://github.com)\n\nVersion: ${version}`;
export const editedXML = `You have un-synchronized modifications in the XML editor which will be lost.\n\nDo you want to continue?`;
export const reloadMsg = `Changing the Verovio version requires the editor to be reloaded for the selected version to be active.\n\nDo you want to proceed now?`;
export const resetMsg = `This will reset all default options, reset the default file, remove all previous files, and reload the application.\n\nDo you want to proceed?`;
export const changelogUrl = `https://raw.githubusercontent.com/rism-digital/verovio-editor/refs/heads/main/CHANGELOG.md`;
export const licenseUrl = `https://raw.githubusercontent.com/rism-digital/verovio-editor/refs/heads/main/LICENSE`;
export const libraries = `Libraries used in this application:\n\
* [blob-stream](https://github.com/devongovett/blob-stream)\n\
* [codemirror](https://codemirror.net/)\n\
* [html-midi-player](https://github.com/cifkao/html-midi-player)\n\
* [marked](https://marked.js.org/)\n\
* [pako](https://github.com/nodeca/pako)\n\
\n`;
//# sourceMappingURL=messages.js.map