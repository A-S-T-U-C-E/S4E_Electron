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
 * serialMonitorButton: open modal with serial console
 * verifyButton: verify and compile in hex file
 * uploadButton: upload hex file in Arduino board
 * @author scanet@libreduc.cc (Sébastien CANET)
 */

const { exec } = require('child_process');
const fs = require('fs-extra');
const tableify = require('tableify')

window.addEventListener('load', function load(event) {
    document.getElementById('verifyButton').onclick = function(event) {
        try {
            fs.accessSync('.\\compiler\\tmp', fs.constants.W_OK);
        } catch (err) {
            fs.mkdirSync('.\\compiler\\tmp', {
                recursive: false
            }, (error) => {
                if (error)
                    throw error;
            });
        }
        var file_path = '.\\tmp';
        var file = '.\\compiler\\tmp\\tmp.ino';
        // 'Code.editor' object was defined as Monaco editor object
        var data;
        if (Code.editor)
            data = Code.editor.getValue();
        else data = Blockly.Arduino.workspaceToCode(Code.mainWorkspace);
        var boardSelected = document.getElementById('boardDescriptionSelector').value;
        if ((boardSelected == "none") || (boardSelected == "...") || (boardSelected == "") || (boardSelected == "undefined")) {
            document.getElementById('content_serial').style.color = '#FF0000';
            document.getElementById('content_serial').innerHTML = MSG['IDE_select_board'];
        } else {
            document.getElementById('content_serial').style.color = '#FFFFFF';
            document.getElementById('content_serial').innerHTML = MSG['IDE_upload1'] + profile.default['description'];
            var upload_arg = profile.default['upload_arg'];
            if (document.getElementById('detailedCompilation').checked === true)
                var cmd = 'arduino-cli.exe compile -v -b ' + upload_arg + ' ' + file_path;
            else
                var cmd = 'arduino-cli.exe compile -b ' + upload_arg + ' ' + file_path;

            fs.writeFile(file, data, (err) => {
                if (err)
                    return console.log(err);
            });
            document.getElementById('content_serial').innerHTML += '<br>' + MSG['IDE_verif_progress'];
            exec(cmd, {
                cwd: './compiler'
            }, (error, stdout, stderr) => {
                if (error) {
                    document.getElementById('content_serial').style.color = '#FF0000';
                    document.getElementById('content_serial').innerHTML = stderr;
                    return;
                }
                document.getElementById('content_serial').style.color = '#00FF00';
                document.getElementById('content_serial').innerHTML = stdout + '<br>' + MSG['IDE_verif_ok'];
            });
        }
    };
    document.getElementById('uploadButton').onclick = function(event) {
        var file_path = '.\\tmp';
        var boardSelected = document.getElementById('boardDescriptionSelector').value;
        var comPortSelected = document.getElementById('serialMenu').value;
        if ((boardSelected == "none") || (boardSelected == "...") || (boardSelected == "") || (boardSelected == "undefined")) {
            document.getElementById('content_serial').style.color = '#FF0000';
            document.getElementById('content_serial').innerHTML = MSG['IDE_select_board'];
            return;
        } else {
            if (comPortSelected === "none") {
                document.getElementById('content_serial').style.color = '#FF0000';
                document.getElementById('content_serial').innerHTML = MSG['IDE_select_port'];
                return;
            } else {
                document.getElementById('content_serial').style.color = '#FFFFFF';
                document.getElementById('content_serial').innerHTML = MSG['IDE_upload1'] + profile.default['description'] + MSG['IDE_upload2'] + comPortSelected;
                document.getElementById('content_serial').innerHTML += '<br>' + MSG['IDE_upload3'];
                var upload_arg = profile.default['upload_arg'];
            }
        }
        if (document.getElementById('detailedCompilation').checked === true)
            var cmd = 'arduino-cli.exe upload -v -p ' + comPortSelected + ' -b ' + upload_arg + ' ' + file_path;
        else
            var cmd = 'arduino-cli.exe upload -p ' + comPortSelected + ' -b ' + upload_arg + ' ' + file_path;
        exec(cmd, {
            cwd: './compiler'
        }, (error, stdout, stderr) => {
            if (error) {
                document.getElementById('content_serial').style.color = '#FF0000';
                document.getElementById('content_serial').innerHTML = stderr;
                return;
            }
            document.getElementById('content_serial').style.color = '#00FF00';
            document.getElementById('content_serial').innerHTML = stdout + '<br>' + MSG['IDE_upload_ok'];
            const path = require('path');
            fs.readdir('.\\compiler\\tmp', (err, files) => {
                if (err)
                    throw err;
                for (const file of files) {
                    fs.unlink(path.join('.\\compiler\\tmp', file), err => {
                        if (err)
                            throw err;
                    });
                }
            });
        });
    };
});