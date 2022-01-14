let {
    app,
    BrowserWindow,
    Tray,
    globalShortcut,
    ipcMain
} = require('electron');
let path = require('path');
let remoteMain = require('@electron/remote/main');
remoteMain.initialize();

let S4E_mainWindow = null;
let NodeRedWindow = null;
app.commandLine.appendSwitch('enable-features', 'ElectronSerialChooser');

let vendorId = '';
let productId = '';
ipcMain.on('variableSelectedPort', function(event, arg) {
    vendorId = arg[0];
    productId = arg[1];
});

function createS4E_mainWindow() {
    S4E_mainWindow = new BrowserWindow({
        width: 1510,
        height: 700,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            enableBlinkFeatures: 'Serial',
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
        // icon: __dirname + '/www/S4E/media/icon.ico'
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    })

    remoteMain.enable(S4E_mainWindow.webContents);

    S4E_mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
        event.preventDefault();
        //send port list to renderer, create list in table
        S4E_mainWindow.webContents.send('portList-data', portList);
        const selectedPort = portList.find((device) => {
            return device.vendorId === vendorId && device.productId === productId
        })
        if (!selectedPort) {
            callback('')
        } else {
            callback(selectedPort.portId)
        }
    })

    S4E_mainWindow.webContents.session.on('serial-port-added', (event, port) => {
        console.log('serial-port-added FIRED WITH', port);
        event.preventDefault();
        S4E_mainWindow.webContents.send('portList-info', 'New connection on port' + port.portName);
    })

    S4E_mainWindow.webContents.session.on('serial-port-removed', (event, port) => {
        console.log('serial-port-removed FIRED WITH', port);
        event.preventDefault();
        S4E_mainWindow.webContents.send('portList-info', 'Disconnection on port' + port.portName);
    })

    // var url = '/www/index.html';
    var url = '../../../www/index.html';
    url = `file://${__dirname}` + url;
    S4E_mainWindow.loadURL(url);
}

app.whenReady().then(() => {
    createS4E_mainWindow();
    globalShortcut.register('F8', openDevTools);
    globalShortcut.register('F5', refresh);
    let tray = new Tray(path.join(__dirname, '../../../www/S4E/media/logo_only.png'));
    tray.setToolTip('STudio4Education');

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createS4E_mainWindow()
    })
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

function openDevTools(S4E_mainWindow = BrowserWindow.getFocusedWindow()) {
    if (S4E_mainWindow) {
        S4E_mainWindow.webContents.toggleDevTools();
    }
}

function refresh(S4E_mainWindow = BrowserWindow.getFocusedWindow()) {
    S4E_mainWindow.webContents.reloadIgnoringCache();
}

module.exports.openDevTools = openDevTools;
module.exports.refresh = refresh;

function createNodeRedWindow(argLangChoice) {
    NodeRedWindow = new BrowserWindow({
        width: 1066,
        height: 640,
        'parent': S4E_mainWindow,
        webPreferences: {
            //needed for jQuery use inside Node-RED
            nodeIntegration: false,
            contextIsolation: false
        },
        resizable: true,
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    var url = 'http://localhost:8000';
    // if (argLangChoice !== "" || argLangChoice !== "undefined")
    //     url = url + '?lang=' + argLangChoice;
    NodeRedWindow.loadURL('http://localhost:8000/red/');
    NodeRedWindow.setMenu(null);
    NodeRedWindow.on('closed', function() {
        NodeRedWindow = null;
    });
    // const $ = require( "jquery" )( NodeRedWindow );
}


var Redserver;
let connections = [];
ipcMain.on('launchNodeRed', (event, langChoice, onOff) => {
    if (onOff) {
        var httpLaunchNodeRed = require('http');
        var expressLaunchNodeRed = require("express");
        var RED = require("node-red");
        var appLaunchNodeRed = expressLaunchNodeRed();
        appLaunchNodeRed.use("/", expressLaunchNodeRed.static("public"));
        var serverLaunchNodeRed = httpLaunchNodeRed.createServer(appLaunchNodeRed);
        var settings = {
            httpAdminRoot: "/red",
            httpNodeRoot: "/api",
            userDir: __dirname + "/nodejs/nodered",
            functionGlobalContext: {},
            logging: {
                console: {
                    level: process.env.NODE_RED_LOGLEVEL || "info"
                }
            },
            editorTheme: {
                page: {
                    title: "STudio4Education - Node-RED"
                        // favicon: "/absolute/path/to/theme/icon",
                        // css: "/absolute/path/to/custom/css/file",
                        // scripts: "/absolute/path/to/custom/js/file"  // As of 0.17
                },
                header: {
                    title: "STudio4Education - Node-RED"
                        // image: "/absolute/path/to/header/image", // or null to remove image
                        // url: "http://nodered.org" // optional url to make the header text/image a link to this url
                }

                // deployButton: {
                //     type:"simple",
                //     label:"Save",
                //     icon: "/absolute/path/to/deploy/button/image" // or null to remove image
                // },

                // menu: { // Hide unwanted menu items by id. see editor/js/main.js:loadEditor for complete list
                //     "menu-item-import-library": false,
                //     "menu-item-export-library": false,
                //     "menu-item-keyboard-shortcuts": false,
                //     "menu-item-help": {
                //         label: "Alternative Help Link Text",
                //         url: "http://example.com"
                //     }
                // },

                // userMenu: false, // Hide the user-menu even if adminAuth is enabled

                // login: {
                //     image: "/absolute/path/to/login/page/big/image" // a 256x256 image
                // },

                // logout: {
                //     redirect: "http://example.com" // As of 0.17
                // }
            }
        };
        console.log(settings.userDir);
        RED.init(serverLaunchNodeRed, settings);
        appLaunchNodeRed.use(settings.httpAdminRoot, RED.httpAdmin);
        appLaunchNodeRed.use(settings.httpNodeRoot, RED.httpNode);
        // serverLaunchNodeRed.listen(8000);
        Redserver = serverLaunchNodeRed.listen(8000, 'localhost', function() {
            console.log(
                "Express 4 https server listening on http%s://%s:%d%s, serving node-red",
                serverLaunchNodeRed.address().address.replace("0.0.0.0", "localhost"),
                serverLaunchNodeRed.address().port);
        });
        RED.start();
        setTimeout(() => {
            createNodeRedWindow();
        }, 3000);
        setInterval(() => Redserver.getConnections(
            (err, connections) => console.log(`${connections} connections currently open`)
        ), 1000);
        process.on('SIGTERM', shutDown);
        process.on('SIGINT', shutDown);

        Redserver.on('connection', connection => {
            connections.push(connection);
            connection.on('close', () => connections = connections.filter(curr => curr !== connection));
        });

        function shutDown() {
            console.log('Received kill signal, shutting down gracefully');
            Redserver.close(() => {
                console.log('Closed out remaining connections');
                process.exit(0);
            });

            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);

            connections.forEach(curr => curr.end());
            setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
        }
    } else {
        shutDown()
        NodeRedWindow.close();
    }
});