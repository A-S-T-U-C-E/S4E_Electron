#!/bin/bash

npm run cross-env ../node_modules/nodemon/bin/nodemon.js --config nodemon.json --exec npm run NODE_ENV=development node ../bin/dev