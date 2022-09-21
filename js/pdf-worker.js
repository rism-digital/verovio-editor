/**
 * The Worker for PDFkit.
 */


importScripts( "https://www.verovio.org/javascript/pdfkit/pdfkit.js" );
importScripts( "https://www.verovio.org/javascript/pdfkit/blobstream.js" );
importScripts( "https://www.verovio.org/javascript/pdfkit/source.js" );
importScripts( "https://www.verovio.org/javascript/pdfkit/Leipzig-ttf.js" );

class Deferred
{
    constructor()
    {
        this.promise = new Promise( ( resolve, reject ) =>
        {
            this.reject = reject
            this.resolve = resolve
        } );
    }
}

let pdfSize = [2100, 2970];
let pdfFormat = "A4";
let pdfOrientation = "portrait";
let pdfHeight = pdfSize[1];
let pdfWidth = pdfSize[0];

// Font callback and buffer
let fontCallback = function ( family, bold, italic, fontOptions )
{
    if ( family == "Leipzig" )
    {
        return family;
    }
    if ( family.match( /(?:^|,)\s*sans-serif\s*$/ ) || true )
    {
        if ( bold && italic ) { return 'Times-BoldItalic'; }
        if ( bold && !italic ) { return 'Times-Bold'; }
        if ( !bold && italic ) { return 'Times-Italic'; }
        if ( !bold && !italic ) { return 'Times-Roman'; }
    }
};

let options = {};
options.fontCallback = fontCallback;
let vrvFontBuffer = Uint8Array.from( atob( LeipzigTTF ), c => c.charCodeAt( 0 ) );

// Variables that will be instantiated through start()
let doc = null;
let outStream = null;
let outString = "";
let docEnd = null;

// Listen to messages send to this worker
addEventListener( 'message', function ( event )
{
    // Destruct properties passed to this message event
    const { taskId, method, args } = event.data;

    // Check if verovio toolkit has passed method
    //const fn = methods[method || null];
    let result;

    if ( method === 'start' )
    {
        doc = new PDFDocument( { useCSS: true, compress: true, autoFirstPage: false, layout: pdfOrientation } );
        outString = "";
        const outStream = blobStream();
        doc.pipe(outStream);
        doc.registerFont( 'Leipzig', vrvFontBuffer );

        // The deferred promised that will be resolved through end() via on('finish')
        docEnd = new Deferred();

        outStream.on( 'finish', function ()
        {
            outString = outStream.toBlob( "application/pdf" );

            var reader = new FileReader();
            reader.readAsDataURL(outString); 
            reader.onloadend = function() {
                outString = reader.result;   
                docEnd.resolve();
                return;
            }

        } );

        result = "ok";
    }
    else if ( method === 'end' )
    {
        doc.end();
        console.debug( "Waiting for doc to finish" );
        docEnd.promise.then( () =>
        {
            postMessage( {
                taskId,
                method,
                args,
                result: outString,
            }, event );
        } );
        return;
    }
    else if ( method === 'addPage' )
    {
        doc.addPage( { size: pdfFormat, layout: pdfOrientation } );
        SVGtoPDF( doc, args[0], 0, 0, options );
    }
    else
    {
        console.warn( "Unkown", method );
    }

    // Always respond to worker calls with postMessage
    postMessage( {
        taskId,
        method,
        args,
        result,
    }, event );
}, false );