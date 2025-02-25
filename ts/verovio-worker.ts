/**
 * The Worker for Verovio
 */

let verovioToolkit = {};


class VerovioDeferred {
    promise;
    reject;
    resolve;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}

const isVerovioModuleReady = new VerovioDeferred();

// Listen for the first message to get the script URL
addEventListener('message', async function (event) {
    if (event.data.verovioUrl) {
        importScripts(event.data.verovioUrl);

        // Initialize the Verovio module once the script is loaded
        //@ts-ignore
        verovio.module.onRuntimeInitialized = function () {
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
    } else {
        console.warn('Unknown method:', method);
    }

    // Always respond to worker calls with postMessage
    postMessage({ taskId, method, args, result });
}, false);
