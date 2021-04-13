/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview Modules to control application life and create native browser window.
 * @author scanet@libreduc.cc (Sébastien CANET)
 */

const {
    app,
    BrowserWindow,
    electron,
    ipcMain,
    globalShortcut,
    dialog,
    Tray
} = require('electron');

const {
    exec
} = require('child_process');
const processToFork = require('child_process');

let BlocklyWindow = null;
let SerialWindow = null;
let FactoryWindow = null;
let devtools = null;
let tray = null;
//for settings file or argument from Arrowhead
const fs = require('fs-extra');
var fileSettings = "./STudio4Education.json";
var papyrusSettings = "./PapyrusST4Econfig.json";
var Settings = '';

function createBlocklyWindow() {
    let BlocklyWindow = new BrowserWindow({
        width: 1510,
        height: 700,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        // icon: __dirname + '/www/S4E/media/icon.ico'
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    // var url = '/www/index.html';
    var url = '../../../www/index.html';
    if (process.platform === 'win32' && process.argv.length >= 2) {
        url = url + process.argv[1];
    }
    // if (!fs.existsSync(fileSettings)) {
    // console.log("File not found");
    // fs.writeFileSync(fileSettings, '', (err) => {
    // if (err) console.log("An error ocurred creating the file " + err.message);
    // else console.log("The file has been succesfully saved");
    // })
    // } else {
    // Settings = fs.readFileSync(fileSettings, 'utf8', (err, Settings) => {
    // if (err) {
    // console.log("An error occured reading the file :" + err.message);
    // Settings = "";
    // return
    // }
    // console.log("The file Settings is : " + Settings);
    // })
    // }
    url = `file://${__dirname}` + url;
    if (!fs.existsSync(papyrusSettings)) {
        console.log("File not found");
        BlocklyWindow.loadURL(url);
    } else {
        Settings = fs.readFileSync(papyrusSettings, 'utf8', (err, Settings) => {
            if (err) {
                console.log("An error occured reading the file :" + err.message);
                Settings = "";
                return;
            }
            console.log("The file Settings is : " + Settings);
        })
            var idsCategories = JSON.parse(Settings);
        var toolboxidsList = "";
        for (let i = 0; i < idsCategories.components.length; i++)
            toolboxidsList += idsCategories.components[i].id + ',';
        toolboxidsList = toolboxidsList.slice(0, -1);
        if (idsCategories.arguments) {
            url += '?' + idsCategories.arguments;
            if (toolboxidsList)
                url += '&toolboxids=' + toolboxidsList;
        } else if (toolboxidsList)
            url += '?toolboxids=' + toolboxidsList;
        BlocklyWindow.loadURL(url);
    }

    // BlocklyWindow.loadURL(`file://${__dirname}` + url + '?' + idsCategories.arguments + '&toolboxids=' + idsCategories.components[0].id + ',' + idsCategories.components[1].id);
    // fs.writeFileSync(fileSettings, `file://${__dirname}` + url + '?' + idsCategories.arguments + '&toolboxids=' + idsCategories.components[0].id + ',' + idsCategories.components[1].id);
    BlocklyWindow.setMenu(null);
    BlocklyWindow.on('closed', function () {
        BlocklyWindow = null;
        SerialWindow = null;
    });
    // devtools = new BrowserWindow();
    // BlocklyWindow.webContents.setDevToolsWebContents(devtools.webContents);
    // BlocklyWindow.webContents.openDevTools({
    // mode: 'detach'
    // });
};

function createSerialWindow(argLangChoice) {
    SerialWindow = new BrowserWindow({
        width: 640,
        height: 560,
        'parent': BlocklyWindow,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: true,
        // icon: __dirname + '/src/icon.ico'
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    // var url = '/nodejs/serialMonitor.html';
    var url = '../../../nodejs/serialMonitor.html';
    if (argLangChoice !== "" || argLangChoice !== "undefined")
        url = url + '?lang=' + argLangChoice;
    SerialWindow.loadURL(`file://${__dirname}` + url);
    SerialWindow.setMenu(null);
    SerialWindow.on('closed', function () {
        SerialWindow = null;
        // BlocklyWindow.document.getElementById('serialConnectButton').className = 'iconButtons';
    });
    // BlocklyWindow.document.getElementById('serialConnectButton').className = 'iconButtonsClicked';
    // devtools = new BrowserWindow();
    // SerialWindow.webContents.setDevToolsWebContents(devtools.webContents);
    // SerialWindow.webContents.openDevTools({
    // mode: 'detach'
    // });
};

function createHackCableWindow(argLangChoice) {
    HackCableWindow = new BrowserWindow({
        width: 1066,
        height: 640,
        'parent': BlocklyWindow,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: true,
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    var url = '../../../www/tools/hackcable/index.html';
    if (argLangChoice !== "" || argLangChoice !== "undefined")
        url = url + '?lang=' + argLangChoice;
    HackCableWindow.loadURL(`file://${__dirname}` + url);
    HackCableWindow.setMenu(null);
    HackCableWindow.on('closed', function () {
        HackCableWindow = null;
    });
};

function createFactoryWindow(argLangChoice) {
    FactoryWindow = new BrowserWindow({
        width: 1066,
        height: 640,
        'parent': BlocklyWindow,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: true,
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    var url = '../../../www/tools/blockFactory/blockFactory.html';
    if (argLangChoice !== "" || argLangChoice !== "undefined")
        url = url + '?lang=' + argLangChoice;
    FactoryWindow.loadURL(`file://${__dirname}` + url);
    FactoryWindow.setMenu(null);
    FactoryWindow.on('closed', function () {
        FactoryWindow = null;
    });
};

function createBlocklyHtmlWindow(argLangChoice) {
    BlocklyHtmlWindow = new BrowserWindow({
        width: 1066,
        height: 640,
        'parent': BlocklyWindow,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: true,
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    var url = '../../../www/tools/html/html_factory.html';
    if (argLangChoice !== "" || argLangChoice !== "undefined")
        url = url + '?lang=' + argLangChoice;
    BlocklyHtmlWindow.loadURL(`file://${__dirname}` + url);
    BlocklyHtmlWindow.setMenu(null);
    BlocklyHtmlWindow.on('closed', function () {
        BlocklyHtmlWindow = null;
    });
};

function createNodeRedWindow(argLangChoice) {
    NodeRedWindow = new BrowserWindow({
        width: 1066,
        height: 640,
        'parent': BlocklyWindow,
        webPreferences: {
            //needed for jQuery use inside Node-RED
            nodeIntegration: false
        },
        resizable: true,
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    var url = 'http://localhost:8000';
    if (argLangChoice !== "" || argLangChoice !== "undefined")
        url = url + '?lang=' + argLangChoice;
    NodeRedWindow.loadURL('http://localhost:8000/red/');
    NodeRedWindow.setMenu(null);
    NodeRedWindow.on('closed', function () {
        NodeRedWindow = null;
    });
    // const $ = require( "jquery" )( NodeRedWindow );
};

function openDevTools(BlocklyWindow = BrowserWindow.getFocusedWindow()) {
    if (BlocklyWindow) {
        BlocklyWindow.webContents.toggleDevTools();
    }
};

function refresh(BlocklyWindow = BrowserWindow.getFocusedWindow()) {
    BlocklyWindow.webContents.reloadIgnoringCache();
};
//need to be deleted at next serialport upgrade > 9.0.0
app.allowRendererProcessReuse = false;

app.whenReady().then(() => {
    createBlocklyWindow();
    globalShortcut.register('F8', openDevTools);
    globalShortcut.register('F5', refresh);
    tray = new Tray('./www/S4E/media/logo_only.png');
    tray.setToolTip('S4E');
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0)
        createBlocklyWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});
ipcMain.on('hackCable', (event, argLangChoice) => {
    createHackCableWindow(argLangChoice);
});
ipcMain.on('blockFactory', (event, argLangChoice) => {
    createFactoryWindow(argLangChoice);
});
ipcMain.on('blocklyHTML', (event, argLangChoice) => {
    createBlocklyHtmlWindow(argLangChoice);
});

ipcMain.on('launch_local_webserver', (event, argLangChoice, state) => {
    const express = require('express');
    const localWebServer = express();
    const path = require('path');
    const port = 999;
    const truc = {
        server: null,
        sockets: [],
    };
    if (state) {
        localWebServer.use(express.static(`${__dirname}` + "../../../www"));
        localWebServer.get('/', function (req, res) {
            res.sendFile(path.join(`${__dirname}`, "../../../www", 'index.html'));
        });
        truc.server = localWebServer.listen(port, function () {
            dialog.showMessageBox({
                title: 'Launch',
                type: 'info',
                message: `server is listening on port: ${port}`
            });
        });
        truc.server.on('connection', (socket) => {
            console.log('Add socket', truc.sockets.length + 1);
            truc.sockets.push(socket);
        });
    } else {
        // clean the cache
        Object.keys(require.cache).forEach((id) => {
            delete require.cache[id];
        });
        truc.sockets.forEach((socket, index) => {
            console.log('Destroying socket', index + 1);
            if (socket.destroyed === false) {
                socket.destroy();
            }
        });
        truc.sockets = [];
        dialog.showMessageBox({
            title: 'Stop',
            type: 'warning',
            message: `server is stopped on port: ${port}`
        });
    }
});
ipcMain.on('launch_papyrus_connection', (event, argLangChoice) => {
    dialog.showMessageBox({
        title: 'Launch',
        type: 'info',
        message: 'Papyrus launched'
    });
});
ipcMain.on('registerToArrowhead', (event, argLangChoice, registerToOrchestrator_autoLaunched) => {
    // run_script("npm run nodemon", [""], null);
});
ipcMain.on('registerToArrowheadOld', (event) => {
    var sh = require('child_process');
    const os = require('os');
    var toLaunch;
    if (os.platform() === 'win32')
        toLaunch = 'arrowhead\launcher_script.cmd';
    else
        toLaunch = './arrowhead/launcher_script.sh';
    // var cmdObj = shExec.exec('./arrowhead/launcher_script.sh', {silent: false});
    // var child = sh.exec('echo test> zzz.txt', {async:true, silent:true});
    var child = sh.exec(toLaunch, function (code, stdout, stderr) {
        // exec('echo "cool" > ../../xxx.txt', {async:true, silent:false});
        console.log('Exit code:', code);
        // sh.echo(`exit code ${code}`);
        sh.exec('echo "exit code" + ${code} > ../../yyy.txt');
        console.log('Program output:', stdout);
        // sh.echo(`Program output: ${stdout}`);
        sh.exec('echo "Program output: " + ${stdout} > ../../yyy.txt');
        console.log('Program error:', stderr);
        // sh.echo(`Program error: ${stderr}`);
        sh.exec('echo "Program error: " + ${stderr} > ../../yyy.txt');
        fs.writeFileSync(fileSettings, `${stderr}`);
    });
    // var child = sh.exec('npm exec cross-env ./resources/app.asar/node_modules/nodemon/bin/nodemon.js --config nodemon.json --exec npm exec NODE_ENV=development node ./arrowhead/bin/dev', function(code, stdout, stderr) {
    // console.log('Exit code:', code);
    // sh.exec('echo ' + code + '> ../../xxx.txt', {async:true, silent:false});
    // console.log('Program output:', stdout);
    // sh.exec('echo ' + stdout + '> ../../yyy.txt', {async:true, silent:false});
    // console.log('Program stderr:', stderr);
    // sh.exec('echo ' + stderr + '> ../../zzz.txt', {async:true, silent:false});
    // });
});
ipcMain.on('launch_Blynk_server', (event, argLangChoice) => {
    // run_script("java -jar ./nodejs/blynk/server.jar -dataFolder ./nodejs/blynk", [""], null);
});
ipcMain.on('serialConnect', (event, argLangChoice) => {
    createSerialWindow(argLangChoice);
});
ipcMain.on('save-csv', (event) => {
    var filename = dialog.showSaveDialog(BlocklyWindow, {
        title: 'Export CSV',
        defaultPath: './',
        filters: [{
                name: 'data',
                extensions: ['csv']
            }
        ]
    }).then(result => {
        event.sender.send('saved-csv', result.filePath)
    });
});
ipcMain.on('save-json', (event) => {
    var filename = dialog.showSaveDialog(BlocklyWindow, {
        title: 'Save JSON',
        defaultPath: './',
        filters: [{
                name: 'data',
                extensions: ['json']
            }
        ]
    }).then(result => {
        event.sender.send('saved-json', result.filePath)
    });
});

ipcMain.on('serialConnectIOT_launch_websocket', (event, argLangChoice, comPortToUse) => {
    dialog.showMessageBox({
        title: 'Launch',
        type: 'info',
        message: 'launching on port ' + comPortToUse
    });
    const express = require('express');
    const path = require('path');
    const app = express();
    const port = 8888;
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        dialog.showMessageBox({
            title: 'Launch',
            type: 'info',
            message: 'new connection made'
        });
    });

    app.use(express.static(path.join(__dirname + '../../../www')));
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '../../../www/index.html'));
    });

    server.listen(port, function () {
        dialog.showMessageBox({
            title: 'Launch',
            type: 'info',
            message: 'server listening on port ' + port
        });
    });

    const SerialPort = require('serialport');
    const Readline = SerialPort.parsers.Readline;
    const portCOM = new SerialPort(comPortToUse);
    const parser = portCOM.pipe(new Readline({
                delimiter: '\n'
            }));
    portCOM.on('open', () => {
        dialog.showMessageBox({
            title: 'Launch',
            type: 'info',
            message: 'Serial Port Opened'
        });
        io.on('connection', socket => {
            socket.emit('connected')
            parser.on('data', temp => {
                dialog.showMessageBox({
                    title: 'Launch',
                    type: 'info',
                    message: temp
                });
                socket.emit('dataFromBoard', temp)
            })
        })
    })
    event.sender.send("serialConnectIOT_websocket_ok");
});

ipcMain.on('serialConnectIOT_launch_websocket2', (event, argLangChoice, comPortToUse) => {
    dialog.showMessageBox({
        title: 'Launch',
        type: 'info',
        message: 'launching on port ' + comPortToUse
    });
    var serialConnected = false;
    // prepare serial window
    // var serialConnectSpeedMenu = document.getElementById('serialConnectSpeed_Menu');
    // var serialConnectSpeedAvailable = JSON.parse(localStorage.getItem("availableSpeed"));
    // serialConnectSpeedAvailable.forEach(function (serialConnectSpeedAvailable) {
    // var option = document.createElement('option');
    // option.value = serialConnectSpeedAvailable;
    // option.text = serialConnectSpeedAvailable;
    // serialConnectSpeedMenu.appendChild(option);
    // });
    const SerialPort = require('serialport');
    const Readline = require('@serialport/parser-readline');
    let SerialPortToMonitor = new SerialPort(comPortToUse, {
        autoOpen: false,
        baudRate: 9600
    });

    var parser = SerialPortToMonitor.pipe(new Readline({
                delimiter: '\n'
            }));
    const appExpress = require('express')();
    const http = require('http').Server(appExpress);
    const ioIoT = require('socket.io')(http);
    SerialPortToMonitor.open(function (err) {
        dialog.showMessageBox({
            title: 'Launch',
            type: 'info',
            message: 'launching ???'
        });
    });
    // if (!serialConnected) {
    // document.getElementById('btn_serialConnect').innerHTML = MSG['serial_btn_stop'];
    // document.getElementById('btn_serialSend').disabled = false;
    SerialPortToMonitor.on('open', () => {
        console.log('port opened');
        dialog.showMessageBox({
            title: 'Launch',
            type: 'info',
            message: 'port opened'
        });
        serialConnected = true;
        appExpress.use(express.static(__dirname));
        appExpress.get('/', (req, res) => {
            res.sendFile(__dirname + '../../../www/index.html');
        });
        ioIoT.on('connection', socket => {
            console.log('socket opened');
            socket.emit('connected');
            dialog.showMessageBox({
                title: 'Launch',
                type: 'info',
                message: 'user connected'
            });
            parser.on('data', function (dataToSend) {
                // if (document.getElementById('btn_serialAddTimeStamp').checked) {
                // document.getElementById('content_serial').innerHTML += getDateString() + "<br>";
                // }
                console.log(dataToSend);
                socket.emit('dataFromBoard', {
                    value: dataToSend.toString()
                });
                dialog.showMessageBox({
                    title: 'Launch',
                    type: 'info',
                    message: 'data' + dataToSend.toString()
                });
            });
        });
    });
    http.listen(3000, () => {
        dialog.showMessageBox({
            title: 'Launch',
            type: 'info',
            message: 'launched on port 3000'
        });
    });
    // } else {
    // document.getElementById('btn_serialConnect').innerHTML = MSG['serial_btn_start'];
    // document.getElementById('btn_serialSend').disabled = true;
    // SerialPortToMonitor.close(function (err) {
    // document.getElementById('content_serial').innerHTML += MSG['serial_info_stop'];
    // });
    // serialConnected = false;
    // }
    event.sender.send("serialConnectIOT_websocket_ok");
});
ipcMain.on('launchNodeRed', (event) => {
    var httpLaunchNodeRed = require('http');
    var expressLaunchNodeRed = require("express");
    var RED = require("node-red");
    var appLaunchNodeRed = expressLaunchNodeRed();
    appLaunchNodeRed.use("/", expressLaunchNodeRed.static("public"));
    var serverLaunchNodeRed = httpLaunchNodeRed.createServer(appLaunchNodeRed);
    var settings = {
        httpAdminRoot: "/red",
        httpNodeRoot: "/api",
        // userDir: __dirname + "/nodejs/nodered",
        userDir: "./nodejs/nodered",
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
    serverLaunchNodeRed.listen(8000, 'localhost', function () {
        console.log(
            "Express 4 https server listening on http%s://%s:%d%s, serving node-red",
            serverLaunchNodeRed.address().address.replace("0.0.0.0", "localhost"),
            serverLaunchNodeRed.address().port);
    });
    RED.start();
    setTimeout(() => {
        createNodeRedWindow();
    }, 3000);
});
module.exports.openDevTools = openDevTools;
module.exports.refresh = refresh;
