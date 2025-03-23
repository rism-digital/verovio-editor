/**
 * The Worker for Verovio
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
let verovioToolkit = {};
class VerovioDeferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}
const isVerovioModuleReady = new VerovioDeferred();
// Listen for the first message to get the script URL
addEventListener('message', function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (event.data.verovioUrl) {
            importScripts(event.data.verovioUrl);
            // Initialize the Verovio module once the script is loaded
            //@ts-ignore
            verovio.module.onRuntimeInitialized = function () {
                //@ts-ignore
                verovio.enableLog(verovio.LOG_DEBUG);
                console.log("DEBUG");
                //@ts-ignore
                verovioToolkit = new verovio.toolkit();
                isVerovioModuleReady.resolve(null);
            };
            return;
        }
        // Destruct properties passed to this message event
        const { taskId, method, args } = event.data;
        // Wait until the Verovio module is ready
        if (method === 'onRuntimeInitialized') {
            isVerovioModuleReady.promise.then(() => {
                postMessage({ taskId, method, args, result: null });
            });
            return;
        }
        // Check if Verovio toolkit has the requested method
        const fn = verovioToolkit[method || null];
        let result;
        if (fn) {
            result = fn.apply(verovioToolkit, args || []);
        }
        else {
            console.warn('Unknown method:', method);
        }
        // Always respond to worker calls with postMessage
        postMessage({ taskId, method, args, result });
    });
}, false);
//# sourceMappingURL=verovio-worker.js.map