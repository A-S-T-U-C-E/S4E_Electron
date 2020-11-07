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

let BlocklyWindow = null;
let SerialWindow = null;
let FactoryWindow = null;
let devtools = null;
let tray = null;
//for settings file or argument from Arrowhead
const fs = require('fs-extra');
var fileSettings = "./STudio4Education.json";
var papyrusSettings = "./HomeAutomationSystemST4Econfig.json";
var Settings = '';

function createBlocklyWindow() {
    let BlocklyWindow = new BrowserWindow({
        width: 1510,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        // icon: __dirname + '/www/S4E/media/icon.ico'
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    // var url = '/www/index.html';
    var url = '../../../www/index.html';
    // if (process.platform === 'win32' && process.argv.length >= 2) {    
        // url = url + process.argv[1];
    // }
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
    if (!fs.existsSync(papyrusSettings)) {
        console.log("File not found");
        BlocklyWindow.loadURL(`file://${__dirname}` + url);
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
        BlocklyWindow.loadURL(`file://${__dirname}` + url + '?' + idsCategories.arguments + '&toolboxids=' + idsCategories.components[0].id + ',' + idsCategories.components[1].id);
        fs.writeFileSync(fileSettings, `file://${__dirname}` + url + '?' + idsCategories.arguments + '&toolboxids=' + idsCategories.components[0].id + ',' + idsCategories.components[1].id);
    }
    BlocklyWindow.setMenu(null);
    BlocklyWindow.on('closed', function () {
        BlocklyWindow = null;
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
        height: 530,
        'parent': BlocklyWindow,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
        // icon: __dirname + '/src/icon.ico'
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    // var url = '/electron/serialMonitor.html';
    var url = '../../../electron/serialMonitor.html';
    if (argLangChoice !== "" || argLangChoice !== "undefined")
        url = url + '?lang=' + argLangChoice;
    SerialWindow.loadURL(`file://${__dirname}` + url);
    SerialWindow.setMenu(null);
    SerialWindow.on('closed', function () {
        SerialWindow = null;
    });
    // devtools = new BrowserWindow();
    // SerialWindow.webContents.setDevToolsWebContents(devtools.webContents);
    // SerialWindow.webContents.openDevTools({
        // mode: 'detach'
    // });
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
        movable: true,
        frame: false,
        modal: false,
        // icon: __dirname + '/www/S4E/media/icon.ico'
        icon: __dirname + '../../../www/S4E/media/icon.ico'
    });
    // var url = '/www/blocksfactory/blocksfactory.html';
    var url = '../../../www/blocksfactory/blocksfactory.html';
    if (argLangChoice !== "" || argLangChoice !== "undefined")
        url = url + '?lang=' + argLangChoice;
    FactoryWindow.loadURL(`file://${__dirname}` + url);
    FactoryWindow.setMenu(null);
    FactoryWindow.on('closed', function () {
        FactoryWindow = null;
    });
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

app.on('ready', () => {
    createBlocklyWindow();
    globalShortcut.register('F8', openDevTools);
    globalShortcut.register('F5', refresh);
    tray = new Tray('./www/S4E/media/logo_only.png');
    tray.setToolTip('S4E');
});

app.on('activate', function () {
    if (BlocklyWindow === null)
        createBlocklyWindow();
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});

ipcMain.on("serialConnect", (event, argLangChoice) => {
    createSerialWindow(argLangChoice);
});
ipcMain.on("factory", function () {
    createFactoryWindow(argLangChoice);
});
ipcMain.on('save-csv', function(event) {
	var filename = dialog.showSaveDialog(BlocklyWindow,{
		title: 'Export CSV',
		defaultPath: './',
		filters: [{ name: 'data', extensions: ['csv'] }]
	},
	function(filename){
		event.sender.send('saved-csv', filename)
	})
})
module.exports.openDevTools = openDevTools;
module.exports.refresh = refresh;
