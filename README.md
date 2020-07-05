
# STudio4Education All In One

![logos](https://raw.githubusercontent.com/A-S-T-U-C-E/S4E_Electron/master/www/electron/media/logos.png)

Designed for **Arrowhead** Tools Project ([https://www.arrowhead.eu/arrowheadtools](https://www.arrowhead.eu/arrowheadtools)), STudio4Education is a **web-based visual programming editor for [ST microelectronics](https://www.st.com)** boards.

STudio4Education is based on [Blockly](https://developers.google.com/blockly/) framework, the  blocks graphical programming editor behind *Scratch3*.

STudio4Education provides static type language blocks and code generators for simple C programming and Arduino like.

This AIO version provides an offline client for desktop use. Thanks to **STM32Duino** project: [https://github.com/stm32duino](https://github.com/stm32duino), it adds verifying, compiling and uploading features.

## Features

* Programming with visually drag and drop code blocks
* Generate fully compatible code
* Multiple boards choice for automatic selection of pin functions
* Load different on-site examples with url parameters
* Keyboard navigation and accessibility helpers
* Theme choice
* Block render choice
* Multi language
* Keyboard navigation
* Verify, compile and upload to board
* Serial monitor for USB communication
* Libraries & board packges management
* etc

## Accessibility

You can enter _accessibility_ mode by **hitting Shift + Ctrl + k**.

Official documentation: [https://developers.google.com/blockly/guides/configure/web/keyboard-nav](https://developers.google.com/blockly/guides/configure/web/keyboard-nav)

Key mapping is customizable by activating 'open key mappings' option.

Some basic commands for moving around are below.  


### Workspace Navigation

-   **W**: Previous block/field/input at the same level.
-   **A**: Up one level (Field (or input) -> Block -> Input (or field) -> Block -> Stack -> Workspace).
-   **S**: Next block/field/input at the same level.
-   **D**: Down one level (Workspace -> Stack -> Block -> Input (or field) -> Block -> Field (or input)).
-   **T**: Will open the toolbox. Once in there you can moving around using the WASD keys. And insert a block by hitting Enter.
-   **X**: While on a connection hit X to disconnect the block after the cursor.

### Cursor 
The cursor controls how the user navigates the blocks, inputs, fields and connections on a workspace. Two different cursors:  

-   **default Cursor**: Allow the user to go to the previous, next, in or out location;
-   **basic Cursor**: Using the pre order traversal allows the user to go to the next and previous location.


## Demo

STudio4Education is a web tool, you can give it a try at [Web version](https://a-s-t-u-c-e.github.io/STudio4Education/).

## Integrated upload

Unlike the web version, this [Electron](https://www.electronjs.org/) version embeds [arduino-cli](https://github.com/arduino/arduino-cli), thanks to [STM32Duino project](https://www.stm32duino.com/).


## Run locally

*Windows user*:  you can download [latest release](https://github.com/A-S-T-U-C-E/S4E_Electron/releases/latest), double click on exe file to launch it and follow usage.

If you want to test it locally and compile by yourself, you have to get [code from github](https://github.com/A-S-T-U-C-E/S4E_Electron/archive/master.zip) and follow instructions below.

### Requirements

You'll need [Node.js](https://nodejs.org/) installed on your computer.

Install all required tools (as Administrator or sudo):

 - tools for compiling on Windows
``` bash
> npm install -g windows-build-tools
``` 
- addon build tool
``` bash
> npm install -g node-gyp
``` 
### Getting Started
``` bash
> cd S4E_Electron-master
> npm install
> npm start
```
### Build
``` bash
> npm run compile
``` 
*Cross compile for all OS is still on the TODO list...need help.*


## Usage

1. Configure S4Electron: open setup panel and select your **board**, your language, your favorite theme + renderer, etc.
2. Drag and drop blocks to make a program.
3. If needed, unzip libraries in `sketchbook\libraries folder`, or use CLI panel:
	1. click on '*update core and libraries*' button;
	2. search for the eaxct name of the library you are looking for;
	3. type name, case sensitive, in input field and click on button '*install this library*':
![enter image description here](https://raw.githubusercontent.com/A-S-T-U-C-E/S4E_Electron/master/www/electron/media/lib_install.jpg)
4. Click on '*Compile*' to verify code and prepare binary file.
5. If needed, install specific packages by taping FQBN name in '*board install to CLI*' input field and click on button '*install this board type'*.
6. If not done before, select communication port in setup panel.
7. Press the '*Upload*' button to send the binary file into a connected board.

## ChangeLog

Check changelog [here](https://github.com/A-S-T-U-C-E/S4E_Electron/blob/master/CHANGELOG.txt)

## Tools used

[Ace editor](https://ace.c9.io)

[Arduino-CLI](https://github.com/arduino/arduino-cli)

[Electron](https://www.electronjs.org/)

[Node SerialPort](https://serialport.io/)

[STM32Duino](https://github.com/stm32duino)


## Authors and Contributors

Sébastien Canet ([scanet@libreduc.cc](scanet@libreduc.cc)).

The STudio4Education project is also inspired by [Blockly@rduino](https://github.com/technologiescollege/Blockly-at-rduino), [ardublockly](https://github.com/carlosperate/ardublockly) and [Blocklino](https://github.com/fontainejp/blocklino).


## License

Copyright (C) 2020 Sébastien Canet scanet@libreduc.cc
-   Licensed under the BSD 3-Clause License.
-   You may not use this project or any file except in compliance with the License.
-   You may obtain a copy of the License at [https://opensource.org/licenses/BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause).

Code from Blockly is licensed under the Apache 2.0 license.


# Blockly [![Build Status]( https://travis-ci.org/google/blockly.svg?branch=master)](https://travis-ci.org/google/blockly)


Google's Blockly is a web-based, visual programming editor.  Users can drag blocks together to build programs.  All code is free and open source.

**The project page is https://developers.google.com/blockly/**

![](https://developers.google.com/blockly/images/sample.png)

Blockly has an active [developer forum](https://groups.google.com/forum/#!forum/blockly). Please drop by and say hello. Show us your prototypes early; collectively we have a lot of experience and can offer hints which will save you time.

Help us focus our development efforts by telling us [what you are doing with Blockly](https://developers.google.com/blockly/registration). The questionnaire only takes
a few minutes and will help us better support the Blockly community.

Want to contribute? Great! First, read [our guidelines for contributors](https://developers.google.com/blockly/guides/modify/contributing).

# Arduino core support for STM32 based boards

[![forums](https://camo.githubusercontent.com/2fe5a04c0c55c3704cf1993cab7e8197c8bf7a2d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6a6f696e2d746865253230666f72756d732d626c75652e737667)](https://www.stm32duino.com/) [![wiki](https://camo.githubusercontent.com/bbeee33e0bdbd610aa82ca8dcdd81caef9f76ea6/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f62726f7773652d74686525323077696b692d6f72616e67652e737667)](https://github.com/stm32duino/wiki/wiki) [![STM32 Core Continuous Integration](https://github.com/stm32duino/Arduino_Core_STM32/workflows/STM32%20Core%20Continuous%20Integration/badge.svg?branch=master)](https://github.com/stm32duino/Arduino_Core_STM32/workflows/STM32%20Core%20Continuous%20Integration/badge.svg?branch=master)

[![GitHub release](https://camo.githubusercontent.com/e723ea1243b0c49eb44399ff6bc0f8ece710fe48/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f72656c656173652f73746d33326475696e6f2f41726475696e6f5f436f72655f53544d33322e737667)](https://github.com/stm32duino/Arduino_Core_STM32/releases/latest) [![GitHub All Releases](https://camo.githubusercontent.com/52f5df97357861fa9416b8c7333f63d68a72e415/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f646f776e6c6f6164732f73746d33326475696e6f2f41726475696e6f5f436f72655f53544d33322f746f74616c2e7376673f6c6162656c3d646f776e6c6f61647325323073696e6365253230312e342e30)](https://camo.githubusercontent.com/52f5df97357861fa9416b8c7333f63d68a72e415/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f646f776e6c6f6164732f73746d33326475696e6f2f41726475696e6f5f436f72655f53544d33322f746f74616c2e7376673f6c6162656c3d646f776e6c6f61647325323073696e6365253230312e342e30) [![GitHub commits](https://camo.githubusercontent.com/683eb83c663d89d6fb62741b7b072b1226f8f1d7/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f636f6d6d6974732d73696e63652f73746d33326475696e6f2f41726475696e6f5f436f72655f53544d33322f312e392e302e737667)](https://github.com/stm32duino/Arduino_Core_STM32/compare/1.9.0...master)

-   [Introduction](https://github.com/stm32duino/Arduino_Core_STM32#Introduction)  
    
-   [Getting Started](https://github.com/stm32duino/Arduino_Core_STM32#getting-started)  
    
-   [Supported boards](https://github.com/stm32duino/Arduino_Core_STM32#supported-boards)  
    
-   [Troubleshooting](https://github.com/stm32duino/Arduino_Core_STM32#troubleshooting)  
    
-   [Wiki](https://github.com/stm32duino/wiki/wiki/)
