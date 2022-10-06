#!/bin/bash

folderName=$1
filesCount=$(ls $folderName | wc -l)
requiredMigrationNumbers=($(seq -f %02g 0 $filesCount))
currentFilesCount=0

for filePath in "$folderName"/*
do
    fileName=${filePath##*/}
    migrationNumber=${requiredMigrationNumbers[$currentFilesCount]}
    
    # Validate File name
    if [[ $fileName != "$migrationNumber"* ]]; then
        echo "::error file=$filePath::The File Name should start with $migrationNumber"
        exit 1
    fi
    
    # TODO: Validate insert number
    
    
    ((++currentFilesCount))
done
