/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview Utility functions for handling typed variables.
 * fake IDE code Arduino
 * boardSelector: boards list
 * serialMenu: serial port list
 * verifyButton: verify and compile in hex file
 * uploadButton: upload hex file in Arduino board
 * @author scanet@libreduc.cc (Sébastien CANET)
 */

const { ipcRenderer } = require('electron');

// const electron = require('electron');
// const { dialog } = require('electron');
const fs = require('fs');
const editJsonFile = require("edit-json-file");
const ArrowheadConfigFilePathName = './arrowhead/arrowhead_config.json';

window.addEventListener('load', function load(event) {
    var localWebServerLaunched = false;
    var ArrowheadConfiguration_autoLaunched = false;
    document.getElementById('wiringButton').onclick = function(event) {
        // var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
        // var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("hackCable", langChoice);
    };
    document.getElementById('factoryButton').onclick = function(event) {
        // var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
        // var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("blockFactory", langChoice);
    };
    document.getElementById('htmlButton').onclick = function(event) {
        // var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
        // var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("blocklyHTML", langChoice);
    };
    document.getElementById('launchRedServer').onclick = function(event) {
        // var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
        // var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("launchNodeRed", langChoice);
    };
    document.getElementById('launchWebServer').onclick = function(event) {
        // var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
        // var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        if (localWebServerLaunched == false) {
            document.getElementById('launchWebServer').className = 'iconButtonsClicked';
            localWebServerLaunched = true;
        } else {
            document.getElementById('launchWebServer').className = 'iconButtons';
            localWebServerLaunched = false;
        };
        ipcRenderer.send("launch_local_webserver", langChoice, localWebServerLaunched);
    };
    // document.getElementById('papyrusConnect').onclick = function(event) {
    // var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
    // var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
    //     var langChoice = document.getElementById('languageMenu').value;
    //     ipcRenderer.send("launch_papyrus_connection", langChoice);
    // };
    // document.getElementById('ArrowheadConfiguration_auto').onclick = function(event) {
    //     document.getElementById("content_serial").style.color = '#00FF00';
    //     document.getElementById("content_serial").innerHTML = 'start AH script';
    //     ipcRenderer.send("registerToArrowhead");
    // };
    // document.getElementById('blynkConnect').onclick = function (event) {
    // var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
    // var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
    // run_script("java -jar ./nodejs/blynk/server.jar -dataFolder ./nodejs/blynk", [""], null);
    // var langChoice = document.getElementById('languageMenu').value;
    // ipcRenderer.send("launch_Blynk_server", langChoice);
    // };
    document.getElementById('serialConnectIOT').onclick = function(event) {
        // var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
        // var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var comPortToUse = localStorage.getItem("comPort");
        document.getElementById('content_serial').innerHTML += "ok on port " + comPortToUse + "<br>";
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("serialConnectIOT_launch_websocket", langChoice, comPortToUse);
    };
    ipcRenderer.on('serialConnectIOT_websocket_ok', (event) => {
        function zeroFill(i) { return (i < 10 ? '0' : '') + i }

        function now() {
            var d = new Date()
            return d.getFullYear() + '-' +
                zeroFill((d.getMonth() + 1)) + '-' +
                zeroFill(d.getDate()) + ' ' +
                zeroFill(d.getHours()) + ':' +
                zeroFill(d.getMinutes()) + ':' +
                zeroFill(d.getSeconds())
        }
        document.getElementById('content_serial').innerHTML += "tentative...<br>";
        const io = require("socket.io-client");
        var connectionOptions = {
            "force new connection": true,
            "reconnectionAttempts": "Infinity",
            "timeout": 10000,
            "transports": ["websocket"]
        }
        var socket = io.connect('http://192.168.0.200:8888', connectionOptions);
        socket.on('init', (data) => {
            console.log(data.message);
            document.getElementById('content_serial').innerHTML += data.message + "<br>";
        })
        socket.on('connected', () => {
            console.log('Socket Connected')
            document.getElementById('content_serial').innerHTML += "connected<br>";
        });
        socket.on('disconnected', () => {
            console.log('Socket Disconnected');
            document.getElementById('content_serial').innerHTML += "disconnected<br>";
        });
        socket.on('data', (data) => {
            var msgs = document.getElementById("content_serial");
            var txt = msgs.innerHTML;
            var rep = data.data.replace(/\x0D\x0A/g, "<br />");
            txt = txt + "<br>" + now() + " " + rep;
            msgs.innerHTML = txt;
            msgs.scrollTop = msgs.scrollHeight;
        });
    });
    document.getElementById('nodeRedFlowButton').onmouseover = function(event) {
        const scanFolder = '.\\nodejs\\nodered\\lib\\flows';
        const path = require('path');
        let files = [];
        const fs = require('fs-extra');
        fs.readdirSync(scanFolder).forEach(filename => {
            files.push(filename);
        });
        var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        files = files.sort(collator.compare);
        files.forEach(filename => {
            var node = document.createElement('li');
            node.appendChild(document.createTextNode(filename));
            document.querySelector('#filesFlowList').appendChild(node);
        });
    };
    /*
     * helpers for Arrowhead config modals
     */
    // Service registry
    document.getElementById('ArrowheadServRegConfigurationModal_okay_nodejs').onclick = function(event) {
        //create from submit
        document.getElementById('ArrowheadServRegConfigurationModal_okay').click();
        var form = sessionStorage.getItem("ArrowheadServRegConfigurationModalForm");
        console.log(form);
        let file = editJsonFile(ArrowheadConfigFilePathName);
        // var configFormArrowhead = "{}";
        file.set(JSON.parse(form));
        console.log(file.get());
        file.save();
        // fs.readFile(ArrowheadConfigFilePathName, 'utf8', function readFileCallback(err, data) {
        //     var configFormArrowhead = "{}";
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         configFormArrowhead = JSON.parse(data);
        //         configFormArrowhead = JSON.stringify(form, null, " ");
        //     }
        //     try {
        //         fs.promises.writeFile(ArrowheadConfigFilePathName, configFormArrowhead, 'utf8');
        //         sessionStorage.setItem("ArrowheadServRegConfigurationModalForm", configFormArrowhead);
        //         return true;
        //     } catch (err) {
        //         return false;
        //     }
        // });
    };
    document.getElementById('ArrowheadServRegConfigurationModal_cancel').onclick = function(event) {
        sessionStorage.setItem("ArrowheadServRegConfigurationModalForm", "{}");
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, "{}", 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };

    // Provider
    document.getElementById('ArrowheadProviderConfigurationModal_okay_nodejs').onclick = function(event) {
        document.getElementById('ArrowheadProviderConfigurationModal_okay').click();
        var form = sessionStorage.getItem("ArrowheadProviderConfigurationModalForm");
        console.log(form);
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, form, 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
    document.getElementById('ArrowheadProviderConfigurationModal_cancel').onclick = function(event) {
        sessionStorage.setItem("ArrowheadProviderConfigurationModalForm", "{}");
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, "{}", 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
    // Consumer
    document.getElementById('ArrowheadConsumerConfigurationModal_okay_nodejs').onclick = function(event) {
        document.getElementById('ArrowheadConsumerConfigurationModal_okay').click();
        var form = sessionStorage.getItem("ArrowheadConsumerConfigurationModalForm");
        console.log(form);
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, form, 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
    document.getElementById('ArrowheadConsumerConfigurationModal_cancel').onclick = function(event) {
        sessionStorage.setItem("ArrowheadConsumerConfigurationModalForm", "{}");
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, "{}", 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
    // Authorization
    document.getElementById('ArrowheadAuthConfigurationModal_okay_nodejs').onclick = function(event) {
        document.getElementById('ArrowheadAuthConfigurationModal_okay').click();
        var form = sessionStorage.getItem("ArrowheadAuthConfigurationModalForm");
        console.log(form);
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, form, 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
    document.getElementById('ArrowheadAuthConfigurationModal_cancel').onclick = function(event) {
        sessionStorage.setItem("ArrowheadAuthConfigurationModalForm", "{}");
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, "{}", 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
    // Orchestrator
    document.getElementById('ArrowheadOrchConfigurationModal_okay_nodejs').onclick = function(event) {
        document.getElementById('ArrowheadOrchConfigurationModal_okay').click();
        var form = sessionStorage.getItem("ArrowheadOrchConfigurationModalForm");
        console.log(form);
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, form, 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
    document.getElementById('ArrowheadOrchConfigurationModal_cancel').onclick = function(event) {
        sessionStorage.setItem("ArrowheadOrchConfigurationModalForm", "{}");
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, "{}", 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
    // Papyrus
    document.getElementById('PapyrusConfiguration_save').onclick = function(event) {
        var form = sessionStorage.getItem("PapyrusConfigurationForm");
        console.log(document.getElementById('papyrusConnectInputId').value)
        console.log(document.getElementById('papyrusConnectInputFile').value)
        try {
            fs.promises.writeFile(ArrowheadConfigFilePathName, form, 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    };
});