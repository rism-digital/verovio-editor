import { App } from "./js/app.js";

const options =
{
    documentViewSVG: false,
    enableDocument: true,
    enableResponsive: true,
    enableEditor: true,
    defaultZoom: 5,
    defaultView: 'editor',

    //schema: 'http://localhost:31338/xml-validator-c/schema/4.0.1/mei-all.rng',
    //schema: 'https://raw.githubusercontent.com/music-encoding/music-encoding/7ec2ba82b7aa1f8bc02aa7d233a0b57fd96ca18a/schemata/mei-basic.rng',
    //schema: 'https://music-encoding.org/schema/4.0.1/mei-Mensural.rng',
    editorSplitterShow: true
}

// Create the App
const verovioApp = new App(document.getElementById("app"), options);

let filename;
// Very simple AJAX request to handle a successful load of an included MEI file
filename = 'examples/puccini.mei';

const xhr = new XMLHttpRequest();
xhr.open( 'GET', '/' + filename );

xhr.onreadystatechange = function()
{
    if (xhr.readyState === 4 && xhr.status === 200)
    {
        verovioApp.loadData( xhr.responseText, filename, false, true );

    }
};
xhr.send( );
