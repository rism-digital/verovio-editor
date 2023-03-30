import { Deferred } from "./deferred.js";
let id = 1;
let callList = new Map;
export class WorkerProxy {
    constructor(worker) {
        this.worker = worker;
        // Listen to response of the service worker
        this.worker.addEventListener("message", (event) => {
            const { taskId, result } = event.data;
            // Check if there is a Deferred instance in workerTasks
            const task = callList.get(taskId);
            if (task) {
                // If so resolve deferred promise and pass the returned value
                // @ts-ignore
                task.resolve(result);
                // delete it from the list
                callList.delete(taskId);
            }
        }, false);
        // Return a Proxy so it is possible to catch all property and method or function calls of the worker
        return new Proxy(this, {
            get: (target, method) => {
                return function () {
                    const taskId = id++;
                    const args = Array.prototype.slice.call(arguments);
                    // Post a message to service worker with UUID, method or function name of the worker and passed arguments
                    target.worker.postMessage({
                        taskId,
                        method,
                        args
                    });
                    // Create a new Deferred instance and store it in workerTasks HashMap
                    const deferred = new Deferred();
                    callList.set(taskId, deferred);
                    // Return the (currently still unresolved) Promise of the Deferred instance
                    return deferred.promise;
                };
            }
        });
    }
}
export class PDFWorkerProxy extends WorkerProxy {
    constructor(worker) {
        super(worker);
    }
}
export class ValidatorWorkerProxy extends WorkerProxy {
    constructor(worker) {
        super(worker);
    }
}
export class VerovioWorkerProxy extends WorkerProxy {
    constructor(worker) {
        super(worker);
    }
}
//# sourceMappingURL=worker-proxy.js.map