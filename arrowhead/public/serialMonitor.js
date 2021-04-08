/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview Utility functions for handling serial communication & plotter.
 * @author scanet@libreduc.cc (Sébastien CANET)
 */
 
import fs from 'fs';
var serialConnected = false;

export function serialConnect() {
    var comPortToUse = 'COM12';
    var baud = 9600;
    const SerialPort = require('serialport');
    const Readline = require('@serialport/parser-readline');
    let SerialPortToMonitor = new SerialPort(comPortToUse, {
        autoOpen: false,
        baudRate: baud
    });
    var parser = SerialPortToMonitor.pipe(new Readline({ delimiter: '\n' }));
    if (!serialConnected) {
        SerialPortToMonitor.open(function (err) {
            // document.getElementById('data').innerHTML += 'serial start']
            });
        serialConnected = true;
        parser.on('data', function (data) {
            if (serialConnected){
                // document.getElementById('data').innerHTML += data + "<br>";
                // document.getElementById('data').scrollTop = document.getElementById('data').scrollHeight;
                // document.getElementById('data').animate({
                    // scrollTop: document.getElementById('data').scrollHeight
                // });
            }
        });
    } else {
        SerialPortToMonitor.close(function (err) {
            // document.getElementById('data').innerHTML += 'stop';
        });
        serialConnected = false;
    }
}