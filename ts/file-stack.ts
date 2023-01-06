/**
 * The FileStack class for storing previously loading files in the window.localStorage.
 */
//@ts-ignore
const pako = window.pako;

interface Stack {
    idx: number;
    items: number;
    maxItems: number;
    filenames: Array<string>;
}

export interface File {
    filename: string;
    data: string;
}

export class FileStack {
    stack: Stack;

    constructor() {
        const cache = window.localStorage.getItem("fileStack");
        //console.debug( cache );

        this.stack = Object.assign({
            idx: 0,
            items: 0,
            maxItems: 6,
            filenames: []
        }, JSON.parse(cache));

        //console.debug( this.stack );
    }

    store(filename: string, data: string): void {
        let list: Array<{ idx: number, filename: string }> = this.fileList();
        for (let i = 0; i < list.length; i++) {
            // Same filename, check the content
            if (filename === list[i].filename) {
                let file = this.load(list[i].idx);
                if (data === file.data) {
                    console.debug("File already in the list");
                    return;
                }
            }
        }

        this.stack.idx--;
        if (this.stack.idx < 0) this.stack.idx = this.stack.maxItems - 1;

        this.stack.filenames[this.stack.idx] = filename;
        //let compressedData = zlib.deflateSync( data ).toString( 'base64' );
        let compressedData = btoa(pako.deflate(data, { to: 'string' }));
        window.localStorage.setItem("file-" + this.stack.idx, compressedData);

        // Increase the stack items if not full
        if (this.stack.items < this.stack.maxItems - 1) this.stack.items++;

        window.localStorage.setItem("fileStack", JSON.stringify(this.stack));
    }

    load(idx: number): File {
        let data = window.localStorage.getItem("file-" + idx);
        //let decompressedData = zlib.inflateSync( new Buffer( data, 'base64' ) ).toString();
        let decompressedData = pako.inflate(atob(data), { to: 'string' });
        return { filename: this.stack.filenames[idx], data: decompressedData };
    }

    getLast(): File {
        if (this.stack.items > 0) {
            return this.load(this.stack.idx);
        }
    }

    fileList(): Array<{ idx: number, filename: string }> {
        let list = new Array<{ idx: number, filename: string }>
        for (let i = 0; i < this.stack.items; i++) {
            let idx = (this.stack.idx + i) % this.stack.maxItems;
            list.push({ idx: idx, filename: this.stack.filenames[idx] });
            //console.log(idx, this.stack.storage[idx]);
        }
        return list;
    }

    reset(): void {
        let list: Array<{ idx: number, filename: string }> = this.fileList();
        for (let i = 0; i < list.length; i++) {
            window.localStorage.removeItem("file-" + list[i][0]);
        }
        window.localStorage.removeItem("fileStack");
        this.stack.items = 0;
    }
}