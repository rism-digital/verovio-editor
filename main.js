import { App } from "./dist/app.js";

let isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    
if (isSafari) {
    alert("It seems that you are using Safari, on which the Verovio Editor unfortunately does not work at this stage.\nPlease use another browser.");
}

function getParameterByName( name )
{
    var match = RegExp( '[?&]' + name + '=([^&]*)' ).exec( window.location.search );
    return match && decodeURIComponent( match[1].replace( /\+/g, ' ' ) );
}

const options =
{
    documentViewSVG: false,
    enableDocument: true,
    enableResponsive: true,
    enableEditor: true,
    defaultZoom: 5,
    defaultView: 'editor',
    editorSplitterShow: true
}

// Rescue option to reset to default before loading
if ( getParameterByName( 'reset' ) != null ) options.reset = true;

// Create the app - here with an empty option object
const app = new App( document.getElementById( "app" ), options );

let file = 'examples/puccini.mei';
let convert = false;
let onlyIfEmpty = true;
let urlFile = getParameterByName( 'file' );
if ( urlFile != null )
{
    file = urlFile;
    onlyIfEmpty = false;
}
if ( getParameterByName( 'musicxml' ) != null ) convert = false;

// Load a file (MEI or MusicXML)
fetch( file )
    .then( function ( response )
    {
        if ( response.status !== 200 )
        {
            alert( 'File could not be fetched, loading default file');
            throw new Error( "Not 200 response" );
        }
        return response.text();
    } )
    .then( function ( text )
    {
        app.loadData( text, file.substring(file.lastIndexOf("/") + 1), convert, onlyIfEmpty );
    } );