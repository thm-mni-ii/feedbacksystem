#!/bin/bash

mkdir -p /usr/src/results/
echo '[
        {
          "header": "Mocha Test",
          "result": [
            {
              "test": "it should GET the empty user list",
              "result": true
            },
            {
              "test": "it should GET all existing users",
              "result": true
            },
            {
              "test": "it should GET the requested user",
              "result": true
            },
            {
              "test": "it should fail to GET a non-existing user",
              "result": true
            },
            {
              "test": "it should POST a new user",
              "result": true
            },
            {
              "test": "it should PUT a user",
              "result": true
            },
            {
              "test": "it should fail to PUT a non-existing user",
              "result": true
            },
            {
              "test": "it should DELETE a user",
              "result": true
            },
            {
              "test": "it should fail to DELETE a non-existing user",
              "result": true
            }
          ]
        }
      ]' > /usr/src/results/test.results.json
npm i # install dependencies
tsc
npm run test