const remote = require('@electron/remote');
const win = remote.getCurrentWindow();
const remoteMain = remote.require("@electron/remote/main");
remoteMain.enable(win.webContents);
const { ipcRenderer } = require('electron');
const tableify = require('tableify')

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};
window.onbeforeunload = (event) => {
    win.removeAllListeners();
}

function handleWindowControls() {
    document.getElementById('btn_fake_min').addEventListener("click", event => {
        win.minimize();
    });
    document.getElementById('btn_fake_max').addEventListener("click", event => {
        win.maximize();
    });
    document.getElementById('btn_fake_restore').addEventListener("click", event => {
        win.unmaximize();
    });
    document.getElementById('btn_fake_close').addEventListener("click", event => {
        win.close();
    });
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.getElementById('btn_fake_max').style.display = "none";
            document.getElementById('btn_fake_restore').style.display = "inline";
        } else {
            document.getElementById('btn_fake_max').style.display = "inline";
            document.getElementById('btn_fake_restore').style.display = "none";
        }
    }
}

//get portlist datas back from main, construct modal
ipcRenderer.on('portList-data', function(event, ports) {
    document.getElementById('serialMenu').options.length = 0;
    Code.ports = ports;
    Code.ports.forEach(function(port) {
        var option = document.createElement('option');
        option.value = port.portName;
        option.text = port.portName;
        document.getElementById('serialMenu').appendChild(option);
    });
    let portsList = Code.ports.map(function(obj) {
        return {
            path: obj.portName,
            manufacturer: obj.displayName,
            vendorId: obj.vendorId,
            productId: obj.productId
        }
    });
    if (portsList && portsList.length > 0) {
        document.getElementById('portListModalBody').innerHTML = tableify(portsList);
        var table = document.getElementById("portListModalBody").querySelectorAll("table");
        table[0].border = '1px solid black';
        table[0].style.borderCollapse = 'collapse';
        table[0].style.width = '100%';
        table[0].style.textAlign = 'center';
    } else {
        document.getElementById('portListModalBody').innerHTML = "Aucun port n'est disponible";
    }
    if (Code.selectedIndex >= 0) {
        document.getElementById("serialMenu").selectedIndex = Code.selectedIndex;
        var rows = document.getElementById("portListModalBody").querySelectorAll("table")[0].getElementsByTagName("tr");
        rows[Code.selectedIndex + 1].style.backgroundColor = "#ffcc00";
    }
    Code.portsListModalShow();
});

ipcRenderer.on('portList-info', function(event, arg) {
    Blockly.alert(arg);
})

/**
 * Set COM port
 */
Code.setPort = async function() {
    var serialPortMenu = document.getElementById('serialMenu');
    var newPort_COM = encodeURIComponent(serialPortMenu.options[serialPortMenu.selectedIndex].value);
    document.getElementById('overlayForModals').style.display = "none";
    document.getElementById('portListModal').classList.remove('show');
    document.getElementById("portSelected_span").textContent = ' : ' + newPort_COM;
    Code.selectedIndex = serialPortMenu.selectedIndex;
    if (newPort_COM != 'none') {
        document.getElementById('serialButton').classList.add('active');
        document.getElementById('serialButton').title = newPort_COM;
        document.getElementById('serialButton').onmouseover = function() {
            document.getElementById("content_hoverButton").textContent = newPort_COM;
        };
        document.getElementById('serialButton').onmouseout = function() {
                document.getElementById("content_hoverButton").textContent = "";
            }
            //send information to main, and fire a port selection with this informations
        ipcRenderer.send('variableSelectedPort', [Code.ports[serialPortMenu.selectedIndex].vendorId, Code.ports[serialPortMenu.selectedIndex].productId]);
        Code.serialPort = await navigator.serial.requestPort();
    } else {
        await Code.serialPort.close();
        Code.serialPort = null;
        document.getElementById('serialButton').classList.remove('active');
        document.getElementById('serialButton').title = MSG['serialButtonSpan'];
        document.getElementById('serialButton').onmouseover = function() {
            document.getElementById("content_hoverButton").textContent = MSG['serialButtonSpan'];
        };
        document.getElementById('serialButton').onmouseout = function() {
            document.getElementById("content_hoverButton").textContent = "";
        };
    }
    document.getElementById("closeModalPorts").click();
};