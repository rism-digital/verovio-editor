/**
 * The Worker for Verovio
 */
importScripts("https://www.verovio.org/javascript/develop/verovio-toolkit-wasm.js");
//importScripts("http://localhost:8082/emscripten/build/verovio-toolkit-wasm.js");
class VerovioDeferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}
// Initializing an empty object to prevent if in onMessage listener the toolkit
// is being accessed before Module.onRuntimeInitialized
let verovioToolkit = {};
// Global deferred Promise that can be resolved when Module is initialized
const isVerovioModuleReady = new VerovioDeferred();
// Create a new toolkit instance when Module is ready
//@ts-ignore
verovio.module.onRuntimeInitialized = function () {
    //@ts-ignore
    verovioToolkit = new verovio.toolkit();
    isVerovioModuleReady.resolve(null);
};
// Listen to messages send to this worker
addEventListener('message', function (event) {
    // Destruct properties passed to this message event
    const { taskId, method, args } = event.data;
    // postMessage on a `onRuntimeInitialized` method as soon as
    // Module is initialized
    if (method === 'onRuntimeInitialized') {
        isVerovioModuleReady.promise.then(() => {
            postMessage({
                taskId,
                method,
                args,
                result: null,
            });
        });
        return;
    }
    // Check if verovio toolkit has passed method
    const fn = verovioToolkit[method || null];
    let result;
    if (fn) {
        // console.debug( "Calling", method );
        // Call verovio toolkit method and pass arguments
        result = fn.apply(verovioToolkit, args || []);
    }
    else {
        console.warn("Unknown", method);
    }
    // Always respond to worker calls with postMessage
    postMessage({
        taskId,
        method,
        args,
        result,
    });
}, false);
