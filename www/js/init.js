/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview JS function for intialisation, forked from https://github.com/google/blockly/commit/4e2f8e6e02b0473a86330eb7414794e6bfea430e.
 * @author scanet@libreduc.cc (Sébastien CANET)
 */

/**
 * Load blocks saved in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function (defaultXml) {
    try {
        var loadOnce = window.sessionStorage.loadOnceBlocks;
    } catch (e) {
        // Firefox sometimes throws a SecurityError when accessing sessionStorage.
        // Restarting Firefox fixes this, so it looks like a bug.
        var loadOnce = null;
    }
    if (loadOnce) {
        // Language switching stores the blocks during the reload.
        delete window.sessionStorage.loadOnceBlocks;
        var xml = Blockly.Xml.textToDom(loadOnce);
        Blockly.Xml.domToWorkspace(xml, Code.workspace);
    } else if (defaultXml) {
        // Load the editor with default starting blocks.
        var xml = Blockly.Xml.textToDom(defaultXml);
        Blockly.Xml.domToWorkspace(xml, Code.workspace);
    }
};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function () {
    var codePeakPre = document.getElementById('content_code');
    var generatedCode = Blockly.Arduino.workspaceToCode(Code.workspace);
    editor.setValue(generatedCode, 1);
};

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function () {
    // board menu as  URL choice
    Code.setBoard();
    Code.initLanguage();
    setOnOffLine();
    collapsibleContentInit();
    var rtl = Code.isRtl();
    //define resizable workspace
    var container = document.getElementById('content_area');
    var blocklyDiv = document.getElementById('content_blocks');
    var onresize = function (e) {
        var element = container;
        var x = 0;
        var y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);
        blocklyDiv.style.left = x + 'px';
        blocklyDiv.style.top = y + 'px';
        blocklyDiv.style.width = container.offsetWidth + 'px';
        blocklyDiv.style.height = container.offsetHeight + 'px';
        Blockly.svgResize(Code.workspace);
    };
    window.addEventListener('resize', onresize, false);

    for (var messageKey in MSG) {
        if (messageKey.indexOf('cat') === 0) {
            Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
        }
    }

    var match = location.search.match(/renderer=([^&]+)/);
    var renderer = match ? match[1] : 'geras';
    document.forms.options.elements.renderer.value = renderer;
    Code.workspace = Blockly.inject('content_blocks', {
        comments: true,
        collapse: true,
        disable: true,
        grid: {
            spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true
        },
        maxBlocks: Infinity,
        maxInstances: {
            'test_basic_limit_instances': 3
        },
        maxTrashcanContents: 256,
        media: './@blockly/media/',
        sounds: true,
        oneBasedIndex: true,
        readOnly: false,
        rtl: rtl,
        move: {
            scrollbars: true,
            drag: true,
            wheel: false
        },
        toolbox: BLOCKLY_TOOLBOX_XML['toolboxS4E'],
        renderer: renderer,
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 4,
            minScale: 0.25,
            scaleSpeed: 1.1
        }
    });

    //button callback register with functions
    Code.workspace.registerButtonCallback('createVarBtnInt', createVarBtnIntCallBack);
    Code.workspace.registerButtonCallback('createVarBtnFloat', createVarBtnFloatCallBack);
    Code.workspace.registerButtonCallback('createVarBtnString', createVarBtnStringCallBack);
    Code.workspace.registerButtonCallback('createVarBtnBoolean', createVarBtnBooleanCallBack);
    //add blocks in toolbox
    Code.workspace.registerToolboxCategoryCallback('VARIABLE_TYPED_NUM', numVariablesCallBack);
    Code.workspace.registerToolboxCategoryCallback('VARIABLE_TYPED_TEXT', textVariablesCallBack);
    Code.workspace.registerToolboxCategoryCallback('VARIABLE_TYPED_BOOLEAN', booleanVariablesCallBack);

    Code.workspace.configureContextMenu = configureContextualMenu;

    // load blocks stored in session or passed by url
    var urlFile = Code.getStringParamFromUrl('url', '');
    var loadOnce = null;
    try {
        loadOnce = window.localStorage.loadOnceBlocks;
    } catch (e) {
        // Firefox sometimes throws a SecurityError when accessing
        // localStorage.
        // Restarting Firefox fixes this, so it looks like a bug.
    }
    if (urlFile) {
        if (loadOnce !== null) {
            if (!confirm(MSG['xmlLoad'])) {
                Code.loadBlocks();
            }
        }
        // $.get( urlFile, function( data ) {
        // Code.loadBlocks(data );
        // }, 'text');
    } else {
        Code.loadBlocks();
    }

    // Code.loadBlocks('');
    // Hook a save function onto unload.
    window.addEventListener('unload', auto_save_and_restore_blocks, false);
    if ('BlocklyStorage' in window) {
        BlocklyStorage.backupOnUnload(Code.workspace);
    }
    onresize();
    Blockly.svgResize(Code.workspace);

    //change theme color
    match = location.search.match(/theme=([^&]+)/);
    var theme = match ? match[1] : 'classic';
    document.forms.options.elements.theme.value = theme;
    changeTheme(theme);

    //keyboard nav attribution
    var actions = [
        Blockly.navigation.ACTION_PREVIOUS,
        Blockly.navigation.ACTION_OUT,
        Blockly.navigation.ACTION_NEXT,
        Blockly.navigation.ACTION_IN,
        Blockly.navigation.ACTION_INSERT,
        Blockly.navigation.ACTION_MARK,
        Blockly.navigation.ACTION_DISCONNECT,
        Blockly.navigation.ACTION_TOOLBOX,
        Blockly.navigation.ACTION_EXIT,
        Blockly.navigation.ACTION_MOVE_WS_CURSOR_UP,
        Blockly.navigation.ACTION_MOVE_WS_CURSOR_LEFT,
        Blockly.navigation.ACTION_MOVE_WS_CURSOR_DOWN,
        Blockly.navigation.ACTION_MOVE_WS_CURSOR_RIGHT
    ];
    createKeyMappingList(actions);

    // function used for dragging and moving splitted windows
    // needs onresize function defined ahead
    function dragElement(element, direction, first, second) {
        var mouse_down_info;
        element.onmousedown = onMouseDown;
        function onMouseDown(e) {
            mouse_down_info = {
                e,
                offsetLeft: element.offsetLeft,
                offsetTop: element.offsetTop,
                firstWidth: first.offsetWidth,
                secondWidth: second.offsetWidth,
                firstHeight: first.offsetHeight,
                secondHeight: second.offsetHeight
            };
            document.onmousemove = onMouseMove;
            document.onmouseup = () => {
                //console.log("mouse up");
                document.onmousemove = document.onmouseup = null;
            };
        }
        function onMouseMove(e) {
            var delta = {
                x: e.clientX - mouse_down_info.e.x,
                y: e.clientY - mouse_down_info.e.y
            };
            if (direction === "H") // Horizontal
            {
                // prevent negative-sized elements
                delta.x = Math.min(Math.max(delta.x, -mouse_down_info.firstWidth), mouse_down_info.secondWidth);
                element.style.left = mouse_down_info.offsetLeft + delta.x + "px";
                first.style.width = (mouse_down_info.firstWidth + delta.x) + "px";
                second.style.width = (mouse_down_info.secondWidth - delta.x) + "px";
                //hide button if div si too thin
                if (document.getElementById("content_code").offsetWidth < 50)
                    document.getElementById("copyCodeButton").style.visibility = 'hidden';
                else
                    document.getElementById("copyCodeButton").style.visibility = 'visible';
            }
            if (direction === "V") // Vertical
            {
                // prevent negative-sized elements
                delta.y = Math.min(Math.max(delta.y, -mouse_down_info.firstHeight), mouse_down_info.secondHeight);
                element.style.top = mouse_down_info.offsetTop + delta.y + "px";
                first.style.height = (mouse_down_info.firstHeight + delta.y) + "px";
                second.style.height = (mouse_down_info.secondHeight - delta.y) + "px";
            }
            onresize();
            Blockly.svgResize(Code.workspace);
        }
    }
    dragElement(document.getElementById("barre_h"), "V", document.getElementById("wrapper_up"), document.getElementById("content_serial"));
    dragElement(document.getElementById("separator"), "H", document.getElementById("content_area"), document.getElementById("content_code"));

    Code.renderContent();
    Code.workspace.addChangeListener(Code.renderContent);
    renderingConstantInit();
};

/**
 * Initialize the page language.
 */
Code.initLanguage = function () {
    // Set the HTML's language and direction.
    var rtl = Code.isRtl();
    document.dir = rtl ? 'rtl' : 'ltr';
    document.head.parentElement.setAttribute('lang', Code.LANG);

    // Sort languages alphabetically.
    var languages = [];
    for (var lang in Code.LANGUAGE_NAME) {
        languages.push([Code.LANGUAGE_NAME[lang], lang]);
    }
    var comp = function (a, b) {
        // Sort based on first argument ('English', 'Русский', '简体字', etc).
        if (a[0] > b[0])
            return 1;
        if (a[0] < b[0])
            return -1;
        return 0;
    };
    languages.sort(comp);
    // Populate the language selection menu.
    var languageMenu = document.getElementById('languageMenu');
    languageMenu.options.length = 0;
    for (var i = 0; i < languages.length; i++) {
        var tuple = languages[i];
        var lang = tuple[tuple.length - 1];
        var option = new Option(tuple[0], lang);
        if (lang === Code.LANG) {
            option.selected = true;
        }
        languageMenu.options.add(option);
    }
    languageMenu.addEventListener('change', Code.changeLanguage, true);

    // Inject language strings.
    document.title = MSG['title'];
    document.getElementById('appName').textContent = MSG['appName'];
    //change Blockly title buttons by this one
    document.getElementById('languageSpan').textContent = MSG['languageSpan'];
    document.getElementById('interfaceColorSpan').textContent = MSG['interfaceColorSpan'];
    document.getElementById('codeEditorColorSpan').textContent = MSG['codeEditorColorSpan'];
    document.getElementById('themeSpan').textContent = MSG['themeSpan'];
    document.getElementById('renderSpan').textContent = MSG['renderSpan'];
    document.getElementById('boardButton').title = MSG['boardButtonSpan'];
    document.getElementById('boardMenuSpan').textContent = MSG['boardSpan'];
    document.getElementById('boardMenu').title = MSG['boardSpan'];
    document.getElementById('serialButton').title = MSG['serialButtonSpan'];
    document.getElementById('serialMenuSpan').textContent = MSG['serialSpan'];
    document.getElementById('serialMenu').title = MSG['serialSpan'];
    document.getElementById('fullScreenButton').title = MSG['fullScreenButton_span'];
    document.getElementById('undoButton').title = MSG['undoButton_span'];
    document.getElementById('redoButton').title = MSG['redoButton_span'];
    document.getElementById('verifyButton').title = MSG['verifyButton_span'];
    document.getElementById('uploadButton').title = MSG['uploadButton_span'];
    document.getElementById('serialConnectButton').title = MSG['serialConnectButton_span'];
    document.getElementById('saveCodeButton').title = MSG['saveCodeButton_span'];
    document.getElementById('newButton').title = MSG['newButton_span'];
    document.getElementById('saveXMLButton').title = MSG['saveXMLButton_span'];
    document.getElementById('loadXMLfakeButton').title = MSG['loadXMLfakeButton_span'];
    document.getElementById('resetButton').title = MSG['resetButton_span'];
    document.getElementById('lateral-panel-setup-label').title = MSG['setup_sideButton_span'];
    document.getElementById('helpButton').title = MSG['helpButton_span'];
    document.getElementById('copyCodeButton').title = MSG['copyCodeButton_span'];
    document.getElementById('keyMappingModalSpan').textContent = MSG['keyMappingModalSpan'];
    document.getElementById('detailedCompilation_span').textContent = MSG['detailedCompilation_span'];
    // CLI panel
    document.getElementById('lateral-panel-CLI-label').title = MSG['config_sideButton_span'];
    document.getElementById('CLI_title_span').textContent = MSG['CLI_title_span'];
    document.getElementById('CLI_githubLinkButton').title = MSG['CLI_githubLinkButton_span'];
    document.getElementById('coreUpdateButton').title = MSG['coreUpdateButton_span'];
    document.getElementById('cleanCLIcacheButton').title = MSG['cleanCLIcacheButton_span'];
    document.getElementById('listBoardsButton').title = MSG['listBoardsButton_span'];
    document.getElementById('installBoardsButton').title = MSG['installBoardsButton_span'];
    document.getElementById('searchlLibButton').title = MSG['searchlLibButton_span'];
    document.getElementById('installLibButton').title = MSG['installLibButton_span'];
    document.getElementById('installBoard_title_span').textContent = MSG['installBoard_title_span'];
    document.getElementById('searchlLib_title_span').textContent = MSG['searchlLib_title_span'];
    document.getElementById('installLib_title_span').textContent = MSG['installLib_title_span'];
    //setup panel
    document.getElementById('accessibilitySpan').textContent = MSG['accessibilitySpan'];
    document.getElementById('defaultCursorSpan').textContent = MSG['defaultCursorSpan'];
    document.getElementById('basicCursorSpan').textContent = MSG['basicCursorSpan'];
    document.getElementById('lineCursorSpan').textContent = MSG['lineCursorSpan'];
    document.getElementById('keyMappingSpan').textContent = MSG['keyMappingSpan'];
    document.getElementById('themeClassicSpan').textContent = MSG['themeClassicSpan'];
    document.getElementById('themeModernSpan').textContent = MSG['themeModernSpan'];
    document.getElementById('themeDeuteranopiaSpan').textContent = MSG['themeDeuteranopiaSpan'];
    document.getElementById('themeTritanopiaSpan').textContent = MSG['themeTritanopiaSpan'];
    document.getElementById('themeZelosSpan').textContent = MSG['themeZelosSpan'];
    document.getElementById('themeHighContrastSpan').textContent = MSG['themeHighContrastSpan'];
    document.getElementById('themeDarkSpan').textContent = MSG['themeDarkSpan'];
    document.getElementById('themeBwSpan').textContent = MSG['themeBwSpan'];
    document.getElementById('fontSizeSpan').textContent = MSG['fontSizeSpan'];
    document.getElementById('optionFontSizeBlocks').textContent = MSG['optionFontSizeBlocks'];
    document.getElementById('optionFontSizePage').textContent = MSG['optionFontSizePage'];
    document.getElementById('optionFontSpacingPage').textContent = MSG['optionFontSpacingPage'];
    document.getElementById('keyMappingExplanationSpan').innerHTML = MSG['keyMappingExplanationSpan'];
    //keyboard nav
    Blockly.navigation.ACTION_PREVIOUS.name = MSG['actionName0'];
    Blockly.navigation.ACTION_OUT.name = MSG['actionName1'];
    Blockly.navigation.ACTION_NEXT.name = MSG['actionName2'];
    Blockly.navigation.ACTION_IN.name = MSG['actionName3'];
    Blockly.navigation.ACTION_INSERT.name = MSG['actionName4'];
    Blockly.navigation.ACTION_MARK.name = MSG['actionName5'];
    Blockly.navigation.ACTION_DISCONNECT.name = MSG['actionName6'];
    Blockly.navigation.ACTION_TOOLBOX.name = MSG['actionName7'];
    Blockly.navigation.ACTION_EXIT.name = MSG['actionName8'];
    Blockly.navigation.ACTION_MOVE_WS_CURSOR_UP.name = MSG['actionName9'];
    Blockly.navigation.ACTION_MOVE_WS_CURSOR_LEFT.name = MSG['actionName10'];
    Blockly.navigation.ACTION_MOVE_WS_CURSOR_DOWN.name = MSG['actionName11'];
    Blockly.navigation.ACTION_MOVE_WS_CURSOR_RIGHT.name = MSG['actionName12'];

};

/**
 * Discard all blocks from the workspace.
 */
Code.discard = function () {
    var count = Code.workspace.getAllBlocks(false).length;
    if (count < 2 ||
            window.confirm(Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1', count))) {
        Code.workspace.clear();
        if (window.location.hash) {
            window.location.hash = '';
        }
    }
};

// Load the Code demo's language strings.
document.write('<script src="./@blockly/demos/code/msg/' + Code.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="./@blockly/msg/js/' + Code.LANG + '.js"></script>\n');

// Load BlocklyDuino's language strings.
document.write('<script src="./msg/UI_' + Code.LANG + '.js"></script>\n');
document.write('<script src="./S4E/msg/blocks_' + Code.LANG + '.js"></script>\n');
document.write('<script src="./S4E/msg/categories_' + Code.LANG + '.js"></script>\n');

window.addEventListener('load', Code.init);