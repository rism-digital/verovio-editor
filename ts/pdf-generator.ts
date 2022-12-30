/**
 * The PDFGenerator class handling the verovio and the pdf WorkerProxy instances.
 */

import { PDFWorkerProxy, VerovioWorkerProxy } from "./worker-proxy.js";

export class PDFGenerator
{
    verovio: VerovioWorkerProxy;
    pdf: PDFWorkerProxy;
    currentScale: number;

    constructor( verovioProxy: VerovioWorkerProxy, pdfProxy: PDFWorkerProxy, scale: number )
    {
        this.verovio = verovioProxy;
        this.pdf = pdfProxy;
        this.currentScale = scale;
    }

    async generateFile(): Promise<any>
    {
        const currentOptions = await this.verovio.getOptions();
        currentOptions.scale = this.currentScale;
        console.log( currentOptions );
        const pdfOptions = {
            adjustPageHeight: false,
            footer: "auto",
            justifyVertically: true,
            mmOutput: true,
            pageHeight: 2970,
            pageWidth: 2100,
            scale: 100
        }
        await this.verovio.setOptions( pdfOptions );
        await this.verovio.redoLayout();
        const pageCount = await this.verovio.getPageCount();

        await this.pdf.start( { useCSS: true, compress: true, autoFirstPage: false, layout: "portrait" } );

        for ( let i = 0; i < pageCount; i++ )
        {
            const svg = await this.verovio.renderToSVG( i + 1 );
            await this.pdf.addPage( svg );
        }

        const pdfOutputStr = await this.pdf.end();

        await this.verovio.setOptions( currentOptions );
        await this.verovio.redoLayout();

        return pdfOutputStr;
    }
}