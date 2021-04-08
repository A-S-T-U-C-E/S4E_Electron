var SERVER_PORT = 8443;
var serviceVersion = 1;
var serviceURI = "STudio4Education";
var ssid = "STudio4Education";
var password = "arrowhead";

var serviceRegistry_addr = "http://arrowhead.tmit.bme.hu:8442";
var serviceDefinition = "Studio4Education";
var serviceInterface = "JSON_Insecure_S4E";
var systemName = "InsecureBlocklyInterface";

var XHR = new XMLHttpRequest();
var urlEncodedData = "";
var urlEncodedDataPairs = [];
var name;

'use strict';

const { spawn } = require( 'child_process' );
const dir = spawn('./node_modules/nodemon/bin/nodemon.js --config nodemon.json --exec npm run NODE_ENV=development node ./bin/dev', ['']);

function ArrowheadRegister() {
    document.getElementById('content_serial').style.color = '#00FF00';
    document.getElementById('content_serial').innerHTML = "connecting...";
    dir.stdout.on( 'data', data => console.log( `stdout: ${data}` ) );
    dir.stderr.on( 'data', data => console.log( `stderr: ${data}` ) );
    dir.on( 'close', code => console.log( `child process exited with code ${code}` ) );
}
