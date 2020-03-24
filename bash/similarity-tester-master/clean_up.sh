#!/bin/bash

dirpath=../abg/WebP2-2-Abgabe

find $dirpath -name *node_modules* -type d -exec rm -rf {} \;
find $dirpath -name .git -type d -exec rm -rf {} \;
find $dirpath -name .gitignore -type f -exec rm -rf {} \;
find $dirpath -name package.json -type f -exec rm -rf {} \;
find $dirpath -name package-lock.json -type f -exec rm -rf {} \;

find $dirpath -name usermanager.sql -type f -exec rm -rf {} \;
find $dirpath -name index.html -type f -exec rm -rf {} \;
find $dirpath -name README.md  -type f -exec rm -rf {} \;
find $dirpath -name User.ts -type f -exec rm -rf {} \;
find $dirpath -name tslint.json -type f -exec rm -rf {} \;
find $dirpath -name tsconfig.json -type f -exec rm -rf {} \;
find $dirpath -name test.ts -type f -exec rm -rf {} \;
find $dirpath -name readme.md -type f -exec rm -rf {} \;

find $dirpath -name AB1 -type d -exec rm -rf {} \;
find $dirpath -name AB2 -type d -exec rm -rf {} \;
find $dirpath -name AB3 -type d -exec rm -rf {} \;
find $dirpath -name AB7 -type d -exec rm -rf {} \;
find $dirpath -name apidoc -type d -exec rm -rf {} \;
find $dirpath -name Doc -type d -exec rm -rf {} \;

find $dirpath -name .idea -type d -exec rm -rf {} \;

