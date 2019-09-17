#!/bin/bash

mkdir -p /usr/src/results/
npm i # install dependencies
tsc

## tweak mochas reporter
cp /usr/src/script/json.js /usr/src/app/node_modules/mocha/lib/reporters
npm run test