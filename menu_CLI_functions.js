﻿/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview Arduino CLI control.
 * @author scanet@libreduc.cc (Sébastien CANET)
 */

let { exec } = require('child_process');
const { profile } = require('console');
const fs = require('fs-extra');
let _coreToInstall = '';

window.addEventListener('load', function load(event) {
    document.getElementById('coreUpdateButton').onclick = function(event) {
        document.getElementById('compiler-output-text').style.color = '#00FF00';
        document.getElementById('compiler-output-text').innerHTML = MSG['coreUpdateButton_msg'];
        var cmd = 'arduino-cli.exe core update-index';
        exec(cmd, {
            cwd: './compiler'
        }, (error, stdout, stderr) => {
            if (error) {
                document.getElementById('compiler-output-text').style.color = '#FF0000';
                document.getElementById('compiler-output-text').innerHTML = stderr;
                return;
            }
            document.getElementById('compiler-output-text').style.color = '#00FF00';
            document.getElementById('compiler-output-text').innerHTML = stdout;
        });
    };
    document.getElementById('cleanCLIcacheButton').onclick = function(event) {
        var file_path = '.\\tmp';
        document.getElementById('compiler-output-text').style.color = '#00FF00';
        document.getElementById('compiler-output-text').innerHTML = MSG['cleanCLIcacheButton_msg'];
        fs.remove(file_path, err => {
            recursive: true;
            if (err) {
                document.getElementById('compiler-output-text').style.color = '#FF0000';
                document.getElementById('compiler-output-text').innerHTML = MSG['cleanCLIcacheButton_error_msg'];
                return console.log(err);
            } else {
                document.getElementById('compiler-output-text').style.color = '#00FF00';
                document.getElementById('compiler-output-text').innerHTML = MSG['cleanCLIcacheButton_success_msg'];
            }
        });
    };
    document.getElementById('listBoardsButton').onclick = function(event) {
        var cmd = 'arduino-cli.exe board list';
        document.getElementById('compiler-output-text').style.color = '#00FF00';
        document.getElementById('compiler-output-text').innerHTML = MSG['listBoardsButton_msg'];
        exec(cmd, {
            cwd: './compiler'
        }, (error, stdout, stderr) => {
            if (error) {
                document.getElementById('compiler-output-text').style.color = '#FF0000';
                document.getElementById('compiler-output-text').innerHTML = stderr;
                document.getElementById('compiler-output-text').scrollTop = stderr.offsetHeight + stderr.offsetTop;
                return;
            }
            document.getElementById('compiler-output-text').style.color = '#00FF00';
            document.getElementById('compiler-output-text').innerHTML = stdout;
            document.getElementById('compiler-output-text').scrollTop = stdout.offsetHeight + stdout.offsetTop;
        });
    };
    document.getElementById('installSTBoards').onclick = function() {
        _coreToInstall = 'ST';
        document.getElementById('installBoardsButton').click();
    }
    document.getElementById('installArduinoBoards').onclick = function() {
        _coreToInstall = 'Arduino';
        document.getElementById('installBoardsButton').click();
    }
    document.getElementById('installEspBoards').onclick = function() {
        _coreToInstall = 'ESP';
        document.getElementById('installBoardsButton').click();
    }
    document.getElementById('installMicrobitBoards').onclick = function() {
        _coreToInstall = 'MicroBit';
        document.getElementById('installBoardsButton').click();
    }
    document.getElementById('installBoardsButton').onclick = function() {
        var cmd = 'arduino-cli.exe core install "';
        switch (_coreToInstall) {
            case 'ST':
                cmd += 'STMicroelectronics:stm32"';
                Code.installBoards('ST');
                break;
            case 'Arduino':
                cmd += 'arduino:avr"';
                Code.installBoards('arduino');
                break;
            case 'ESP':
                cmd += 'esp8266:esp8266"';
                Code.installBoards('ESP');
                break;
            case 'MicroBit':
                cmd += document.getElementById("installBoardsInput").value + '"';
                Code.installBoards('microbit');
                break;
            default:
                cmd += document.getElementById("installBoardsInput").value + '"';
                break;
        }
        _coreToInstall = '';
        document.getElementById('compiler-output-text').style.color = '#00FF00';
        document.getElementById('compiler-output-text').innerHTML = MSG['installBoardsButton_msg'];
        exec(cmd, {
            cwd: './compiler'
        }, (error, stdout, stderr) => {
            if (error) {
                document.getElementById('compiler-output-text').style.color = '#FF0000';
                document.getElementById('compiler-output-text').innerHTML = stderr;
                document.getElementById('compiler-output-text').scrollTop = stderr.offsetHeight + stderr.offsetTop;
                return;
            }
            document.getElementById('compiler-output-text').style.color = '#00FF00';
            document.getElementById('compiler-output-text').innerHTML = stdout;
            document.getElementById('compiler-output-text').scrollTop = stdout.offsetHeight + stdout.offsetTop;
        });
    };
    document.getElementById('searchlLibButton').onclick = function(event) {
        var cmd = 'arduino-cli.exe lib search "' + document.getElementById("searchlLibInput").value + '"';
        document.getElementById('compiler-output-text').style.color = '#00FF00';
        document.getElementById('compiler-output-text').innerHTML = MSG['searchlLibButton_msg'];
        exec(cmd, {
            cwd: './compiler'
        }, (error, stdout, stderr) => {
            if (error) {
                document.getElementById('compiler-output-text').style.color = '#FF0000';
                document.getElementById('compiler-output-text').innerHTML = stderr;
                document.getElementById('compiler-output-text').scrollTop = stderr.offsetHeight + stderr.offsetTop;
                return;
            }
            document.getElementById('compiler-output-text').style.color = '#00FF00';
            document.getElementById('compiler-output-text').innerHTML = stdout;
            document.getElementById('compiler-output-text').scrollTop = stdout.offsetHeight + stdout.offsetTop;
        });
    };
    document.getElementById('installLibButton').onclick = function(event) {
        var cmd = 'arduino-cli.exe lib install "' + document.getElementById("installLibInput").value + '"';
        document.getElementById('compiler-output-text').style.color = '#00FF00';
        document.getElementById('compiler-output-text').innerHTML = MSG['installLibButton_msg'];
        exec(cmd, {
            cwd: './compiler'
        }, (error, stdout, stderr) => {
            if (error) {
                document.getElementById('compiler-output-text').style.color = '#FF0000';
                document.getElementById('compiler-output-text').innerHTML = stderr;
                document.getElementById('compiler-output-text').scrollTop = stderr.offsetHeight + stderr.offsetTop;
                return;
            }
            document.getElementById('compiler-output-text').style.color = '#00FF00';
            document.getElementById('compiler-output-text').innerHTML = stdout;
            document.getElementById('compiler-output-text').scrollTop = stdout.offsetHeight + stdout.offsetTop;
            //error sent without 'error' in function, need to double instruction
            // document.getElementById('compiler-output-text').style.color = '#FF0000';
            // document.getElementById('compiler-output-text').innerHTML += stderr;
        });
    };
});