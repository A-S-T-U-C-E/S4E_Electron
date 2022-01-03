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

app.commandLine.appendSwitch('enable-features', 'ElectronSerialChooser');

let vendorId = '';
let productId = '';
ipcMain.on('variableSelectedPort', function(event, arg) {
    vendorId = arg[0];
    productId = arg[1];
});

function createS4E_mainWindow() {
    const S4E_mainWindow = new BrowserWindow({
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