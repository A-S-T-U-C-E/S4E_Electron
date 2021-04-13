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

const {ipcRenderer} = require('electron');

const electron = require('electron');
const nodemon = require('nodemon');
const child_process = require('child_process');
const { dialog } = require('electron');

// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(command, args, callback) {
    var child = child_process.fork(command, args, {
        silent: true,
        detached: true,
        encoding: 'utf8',
        shell: true,
        env: {
            ELECTRON_RUN_AS_NODE:1
        }
    });
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
        dialog.showMessageBox({
            title: 'Title',
            type: 'warning',
            message: 'Error occured.\r\n' + error
        });
        console.log(error);
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
        //Here is the output
        data = data.toString();   
        document.getElementById('content_serial').innerHTML += data;
        console.log(data);
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
        // Return some data to the renderer process with the mainprocess-response ID
        // BlocklyWindow.webContents.send('mainprocess-response', data);
        //Here is the output from the command
        document.getElementById('content_serial').innerHTML = data;
    });

    child.on('close', (code) => {
        //Here you can get the exit code of the script  
        switch (code) {
            case 0:
                dialog.showMessageBox({
                    title: 'Title',
                    type: 'info',
                    message: 'End process.\r\n'
                });
                break;
        }

    });
    if (typeof callback === 'function')
        callback();
}

window.addEventListener('load', function load(event) {
    var localWebServerLaunched = false;
    var registerToOrchestrator_autoLaunched = false;
    document.getElementById('wiringButton').onclick = function (event) {
  		// var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
  		// var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("hackCable", langChoice);
    };
    document.getElementById('factoryButton').onclick = function (event) {
  		// var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
  		// var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("blockFactory", langChoice);
    };
    document.getElementById('htmlButton').onclick = function (event) {
  		// var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
  		// var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("blocklyHTML", langChoice);
    };
    document.getElementById('launchRedServer').onclick = function (event) {
  		// var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
  		// var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("launchNodeRed", langChoice);
    };
    document.getElementById('launchWebServer').onclick = function (event) {
  		// var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
  		// var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        if (localWebServerLaunched == false) {
            document.getElementById('launchWebServer').className = 'iconButtonsClicked';
            localWebServerLaunched = true;
        }
        else {
            document.getElementById('launchWebServer').className = 'iconButtons';
            localWebServerLaunched = false;
        };
        ipcRenderer.send("launch_local_webserver", langChoice, localWebServerLaunched);
    };
    document.getElementById('papyrusConnect').onclick = function (event) {
  		// var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
  		// var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        var langChoice = document.getElementById('languageMenu').value;
        ipcRenderer.send("launch_papyrus_connection", langChoice);
    };
    document.getElementById('registerToOrchestrator_auto').onclick = function (event) {
  		// var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
  		// var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        // run_script("cd ./arrowhead", [""], null);        
        // console.log("echo ${PWD}");
        // run_script("cd arrowhead\n launcher_script.cmd", [""], null);
        // run_script('echo toto', [""], null);       
        // run_script('arrowhead\\launcher_script.cmd', [""], null);
        const { spawn } = require('child_process');

        function spawnNodemon() {
          const cp = spawn('nodemon', ['.\\arrowhead\\system\\index.js', '--watch', '.\\arrowhead\\system/**/*'], {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
          });
          return cp;
        }

        // var monitorApp = spawnNodemon();

        // monitorApp.on('message', function (event) {
          // if (event.type === 'start') {
            // console.log('nodemon started');
          // } else if (event.type === 'crash') {
            // console.log('script crashed for some reason');
          // }
        // });
        var nodemon = require('nodemon');
        // force a restart
        // monitorApp.send('restart');

        // force a quit
        // monitorApp.send('quit');
        if (registerToOrchestrator_autoLaunched == false) {
            document.getElementById('registerToOrchestrator_auto').className = 'iconButtonsClicked';
            registerToOrchestrator_autoLaunched = true;
            // nodemon({ script: '.\\arrowhead\\system\\index.js' }).on('start', function () {
              // console.log('nodemon started');
            // }).on('crash', function () {
              // console.log('script crashed for some reason');
            // });

            var monitorApp = spawnNodemon();

            monitorApp.on('message', function (event) {
              if (event.type === 'start') {
                console.log('nodemon started');
              } else if (event.type === 'crash') {
                console.log('script crashed for some reason');
              }
            });
        }
        else {
            document.getElementById('registerToOrchestrator_auto').className = 'iconButtons';
            registerToOrchestrator_autoLaunched = false;
            monitorApp.send('quit');
            // nodemon.emit('quit');
        };
        // var langChoice = document.getElementById('languageMenu').value;
        // ipcRenderer.send("registerToArrowhead", langChoice, registerToOrchestrator_autoLaunched);
    };
    // document.getElementById('blynkConnect').onclick = function (event) {
  		// var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
  		// var argLangChoice = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : 'en';
        // run_script("java -jar ./nodejs/blynk/server.jar -dataFolder ./nodejs/blynk", [""], null);
        // var langChoice = document.getElementById('languageMenu').value;
        // ipcRenderer.send("launch_Blynk_server", langChoice);
    // };
    document.getElementById('serialConnectIOT').onclick = function (event) {
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
          return d.getFullYear() + '-'
            + zeroFill((d.getMonth() + 1)) + '-'
            + zeroFill(d.getDate())        + ' '
            + zeroFill(d.getHours())       + ':'
            + zeroFill(d.getMinutes())     + ':'
            + zeroFill(d.getSeconds())
        }
        document.getElementById('content_serial').innerHTML += "tentative...<br>";
        const io = require("socket.io-client");
        var connectionOptions = {
          "force new connection" : true,
          "reconnectionAttempts" : "Infinity",
          "timeout" : 10000,
          "transports" : ["websocket"]
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
          var msgs  = document.getElementById("content_serial");
          var txt   = msgs.innerHTML;
          var rep   = data.data.replace(/\x0D\x0A/g,"<br />");
          txt       = txt + "<br>" + now() + " " + rep;
          msgs.innerHTML = txt;
          msgs.scrollTop = msgs.scrollHeight;
        });
    });
    document.getElementById('nodeRedFlowButton').onmouseover = function (event) {
        const scanFolder = '.\\nodejs\\nodered\\lib\\flows';
        const path = require('path');
        let files = [];
        const fs = require('fs-extra');
        fs.readdirSync(scanFolder).forEach(filename => {
            files.push(filename);
        });
        var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        files = files.sort(collator.compare);
        files.forEach(filename => {
            var node = document.createElement('li');
            node.appendChild(document.createTextNode(filename));         
            document.querySelector('#filesFlowList').appendChild(node);
        });
    };
});