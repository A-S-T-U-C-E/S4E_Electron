/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview Utility functions for handling serial communication & plotter.
 * @author scanet@libreduc.cc (Sébastien CANET)
 */

var {
    ipcRenderer,
    dialog
} = require('electron');
var fs = require('fs-extra');
var Chart = require('chart.js');

// helper function to get a nicely formatted date string
function getDateString() {
    var time = new Date().getTime();
    // 32400000 is (GMT+9 Japan)
    // for your timezone just multiply +/-GMT by 36000000
    var datestr = new Date(time + 36000000).toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
}

function download_table_as_csv(table_id, separator = ',') {
    // Select rows from table_id
    var rows = document.querySelectorAll('table#' + table_id + ' tr');
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var csv_string = csv.join('\n');
    // Download it
    var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.addEventListener('load', function load(event) {
    var serialConnected = false;
    // prepare serial window
    var serialConnectSpeedMenu = document.getElementById('serialConnectSpeed_Menu');
    var serialConnectSpeedAvailable = JSON.parse(localStorage.getItem("availableSpeed"));
    serialConnectSpeedAvailable.forEach(function (serialConnectSpeedAvailable) {
        var option = document.createElement('option');
        option.value = serialConnectSpeedAvailable;
        option.text = serialConnectSpeedAvailable;
        serialConnectSpeedMenu.appendChild(option);
    });
    var graph = false;
    document.getElementById('btn_serialSend').disabled = true;
    document.getElementById('btn_serialPeekClear').onclick = function () {
        document.getElementById('serialPeek').textContent = '';
        line0.data = [];
    };
    document.getElementById('btn_serialSend').onclick = function () {
        var input = document.getElementById('serialSendBox').value;
        if (SerialPortToMonitor.isOpen) {
            document.getElementById('serialPeek').innerHTML += input + "<br>";
            SerialPortToMonitor.write(input);
        }
    };
    document.getElementById('btn_serialConnect').onclick = function () {
        const SerialPort = require('serialport');
        const Readline = require('@serialport/parser-readline');
        const db = require('../../nodejs/js/dbservice');
        var baud = parseInt(document.getElementById('serialConnectSpeed_Menu').value);
        console.log(baud);
        var comPortToUse = localStorage.getItem("comPort");
        let SerialPortToMonitor = new SerialPort(comPortToUse, {
            autoOpen: false,
            baudRate: baud
        });
        var parser = SerialPortToMonitor.pipe(new Readline({
                    delimiter: '\r\n'
                }));
        if (!serialConnected) {
            document.getElementById('btn_serialConnect').innerHTML = MSG['serial_btn_stop'];
            document.getElementById('btn_serialSend').disabled = false;
            SerialPortToMonitor.open(function (err) {
                document.getElementById('serialPeek').innerHTML += MSG['serial_info_start']
            });
            serialConnected = true;
            var today = new Date();
            var chart = new Chart(document.getElementById('serialGraph').getContext('2d'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Sensor',
                        borderColor: "#FF5733",
                        backgroundColor: '#FFFFFF',
                        data: [],
                        fill: true,
                        pointStyle: 'circle',
                        pointRadius: 2,
                        pointHoverRadius: 7,
                        lineTension: 0,
                    }]
                },
                options: {}             
            });
            chart.options.responsive = true;
            parser.on('data', function (dataToDraw) {
                if (serialConnected) {
                    document.getElementById('serialSendBox').value = parseInt(dataToDraw, 10); 
                    var time = today.getHours() + ":" + today.getMinutes();
                    if(chart.data.labels.length != 30) { //If we have less than 15 data points in the graph
                        chart.data.labels.push(time);  //Add time in x-asix
                        chart.data.datasets.forEach((dataset) => {
                            dataset.data.push(dataToDraw); //Add temp in y-axis
                        });
                    }
                    else { //If there are already 15 data points in the graph.
                        chart.data.labels.shift(); //Remove first time data
                        chart.data.labels.push(time); //Insert latest time data
                        chart.data.datasets.forEach((dataset) => {
                            dataset.data.shift(); //Remove first temp data
                            dataset.data.push(dataToDraw); //Insert latest temp data
                        });
                    }
                    chart.update();
                    if (document.getElementById('btn_serialAddTimeStamp').checked) {
                        document.getElementById('serialPeek').innerHTML += getDateString() + "<br>";
                    }
                    document.getElementById('serialPeek').innerHTML += dataToDraw + "<br>";
                    document.getElementById('serialPeek').scrollTop = document.getElementById('serialPeek').scrollHeight;
                    document.getElementById('serialPeek').animate({
                        scrollTop: document.getElementById('serialPeek').scrollHeight
                    });
                    if (document.getElementById('btn_serialSaveToJSON').checked) {
                        let streamObject = {
                            time: getDateString(),
                            dataToDraw: dataToDraw.trim()
                        };
                        db.get('sensorData')
                        .push(streamObject)
                        .write();
                    }
                }
            });
        } else {
            document.getElementById('btn_serialConnect').innerHTML = MSG['serial_btn_start'];
            document.getElementById('btn_serialSend').disabled = true;
            SerialPortToMonitor.close(function (err) {
                document.getElementById('serialPeek').innerHTML += MSG['serial_info_stop'];
            });
            serialConnected = false;
        }
    };
    document.getElementById('btn_serialPeekCSV').onclick = function (event) {
        ipcRenderer.send('save-csv');
    };
    document.getElementById('btn_serialPeekJSON').onclick = function (event) {
        ipcRenderer.send('save-json');
    };
    ipcRenderer.on('saved-csv', function (event, savePath) {
        var code = document.getElementById('serialPeek').innerHTML;
        console.log(code);
        code = code.replaceAll('\n<br>', ';\n');
        // code = code.split('<br>').join(';').replaceAll('\n', '');
        // cut off first text
        code = code.slice(code.indexOf(';')+1);
        // cut off last text
        code = code.slice(0, code.indexOf('stop') - 1);
        if (savePath === null) {
            return;
        } else {
            fs.writeFile(savePath, code, function (err) {
                if (err) return console.log(err);
            });
        }
    });
    ipcRenderer.on('saved-json', function (event, savePath) {
        let rawdata = fs.readFileSync('db.json');
        if (savePath === null) {
            return;
        } else {
            fs.writeFile(savePath, rawdata, function (err) {
                if (err) return console.log(err);
            });
        }
    });
    document.getElementById('btn_serialChart').onclick = function () {
        if (!graph) {
            document.getElementById('serialPeek').style.width = '120px';
            document.getElementById('serialGraphWindow').style.display = 'block';
            graph = true;
        } else {
            document.getElementById('serialPeek').style.width = '600px';
            document.getElementById('serialGraphWindow').style.display = 'none';
            graph = false;
        }
    };
});