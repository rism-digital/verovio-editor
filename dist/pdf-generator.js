/**
 * The PDFGenerator class handling the verovio and the pdf WorkerProxy instances.
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
export class PDFGenerator {
    constructor(verovioProxy, pdfProxy, scale) {
        this.verovio = verovioProxy;
        this.pdf = pdfProxy;
        this.currentScale = scale;
    }
    generateFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentOptions = yield this.verovio.getOptions();
            currentOptions.scale = this.currentScale;
            console.log(currentOptions);
            const pdfOptions = {
                adjustPageHeight: false,
                footer: "auto",
                justifyVertically: true,
                mmOutput: true,
                pageHeight: 2970,
                pageWidth: 2100,
                scale: 100
            };
            yield this.verovio.setOptions(pdfOptions);
            yield this.verovio.redoLayout();
            const pageCount = yield this.verovio.getPageCount();
            yield this.pdf.start({ useCSS: true, compress: true, autoFirstPage: false, layout: "portrait" });
            for (let i = 0; i < pageCount; i++) {
                const svg = yield this.verovio.renderToSVG(i + 1);
                yield this.pdf.addPage(svg);
            }
            const pdfOutputStr = yield this.pdf.end();
            yield this.verovio.setOptions(currentOptions);
            yield this.verovio.redoLayout();
            return pdfOutputStr;
        });
    }
}
