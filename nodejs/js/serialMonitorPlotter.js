/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview Set of functions for dd-on used in Electron version,
 * add a 'serial monitor' to interact with boards.
 * @author scanet@libreduc.cc (Sébastien CANET)
 */

var serialMonitor = {};

serialMonitor.LANGUAGE_NAME = {
    'ar': 'العربية',
    'ca': 'Català - Valencià',
    'de': 'Deutsch',
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'ja': '日本語'
};

serialMonitor.LANGUAGE_RTL = ['ar', 'fa', 'he'];

serialMonitor.getLang = function () {
    var val = location.search.match(new RegExp('[?&]lang=([^&]+)'));
    var lang = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : '';
    if (serialMonitor.LANGUAGE_NAME[lang] === undefined) {
        lang = 'en';
    }
    return lang;
};

serialMonitor.isRtl = function () {
    return serialMonitor.LANGUAGE_RTL.indexOf(serialMonitor.LANG) !== -1;
};

serialMonitor.LANG = serialMonitor.getLang();

serialMonitor.initLanguageSerialMonitor = function () {
    document.getElementsByName('inputTextSerial')[0].placeholder = MSG['inputTextSerial'];
    document.getElementById('btn_serialSend').title = MSG['btn_serialSend_span'];
    document.getElementById('btn_serialSend').innerText = MSG['btn_serialSend_span'];
    document.getElementById('btn_serialConnect').title = MSG['btn_serialConnect_span'];
    document.getElementById('btn_serialConnect_span').innerText = MSG['btn_serialConnect_span'];
    document.getElementById('btn_serialPeekClear').title = MSG['btn_serialPeekClear_span'];
    document.getElementById('btn_serialPeekClear_span').innerText = MSG['btn_serialPeekClear_span'];
    document.getElementById('btn_serialPeekCSV').title = MSG['btn_serialPeekCSV_span'];
    document.getElementById('btn_serialPeekCSV_span').innerText = MSG['btn_serialPeekCSV_span'];
    document.getElementById('btn_serialChart').title = MSG['btn_serialChart_span'];
    document.getElementById('btn_serialChart_span').innerText = MSG['btn_serialChart_span'];
    document.getElementById('btn_serialChartPause').title = MSG['btn_serialChartPause_span'];
    document.getElementById('btn_serialChartPause_span').innerText = MSG['btn_serialChartPause_span'];
};

// Load language strings.
document.write('<script src="../www/msg/UI_' + serialMonitor.LANG + '.js"></script>\n');
window.addEventListener('load', serialMonitor.initLanguageSerialMonitor);