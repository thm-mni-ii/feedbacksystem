#!/bin/bash

set -e

npm --prefix scripts/ci/validate-api-docs install
npm --prefix scripts/ci/validate-api-docs run lint