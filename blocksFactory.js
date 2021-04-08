/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview Block factory control.
 * @author scanet@libreduc.cc (Sébastien CANET)
 */
 
var remote = require('electron').remote;
var {ipcRenderer} = require("electron");
var fs = require('fs');

window.addEventListener('load', function load(event) {
});