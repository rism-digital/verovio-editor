import { App } from "./dist/app.js";

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
    defaultView: 'editor',
    editorSplitterShow: true,
    enableValidation: true
}

let isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
if ( isSafari )
{
    options.isSafari = true;
    options.enableValidation = false;
}

let view = getParameterByName( 'view' );
if ( view != null )
{
    options.defaultView = view;
}

// Rescue option to reset to default before loading
if ( getParameterByName( 'reset' ) != null ) options.appReset = true;

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