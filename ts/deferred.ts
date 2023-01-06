/**
 * The Deferred class wrapping a Promise
 */

export class Deferred {
    promise: Promise<string>;
    reject: Function;
    resolve: Function

    constructor() {
        this.promise = new Promise((resolve: Function, reject: Function) => {
            this.reject = reject
            this.resolve = resolve
        });
    }
}