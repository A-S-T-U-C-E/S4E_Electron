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
 * serialConnectButton: open modal with serial console
 * verifyButton: verify and compile in hex file
 * uploadButton: upload hex file in Arduino board
 * @author scanet@libreduc.cc (Sébastien CANET)
 */

const {ipcRenderer} = require('electron');
const {exec} = require('child_process');
const fs = require('fs-extra');
const tableify = require('tableify')
const SerialPort = require('serialport');

//COM port list inside the modal
document.getElementById('serialMenu').addEventListener("mouseover", function (event) {
    SerialPort.list().then(ports => {
        document.getElementById('serialMenu').options.length = 0;
        ports.forEach(function (port) {
            var option = document.createElement('option');
            option.value = port.path;
            option.text = port.path;
            document.getElementById('serialMenu').appendChild(option);
        });
    });
});

window.addEventListener('load', function load(event) {
    document.getElementById('serialConnectButton').onclick = function (event) {
        var langChoice = 'en';
        var comPortSelected = document.getElementById('serialMenu').value;
        if (comPortSelected === "none") {
                document.getElementById('content_serial').style.color = '#FF0000';
                document.getElementById('content_serial').innerHTML = MSG['IDE_select_port'];
                return;
            } else {
                document.getElementById('content_hoverButton').style.color = '#FFFFFF';
                document.getElementById('content_hoverButton').innerHTML = MSG['IDE_connect'] + comPortSelected;
                localStorage.setItem("comPort", comPortSelected);
                localStorage.setItem("availableSpeed", JSON.stringify(profile.default['serialList']));
                ipcRenderer.send("serialConnect", langChoice);
        }
    };
});