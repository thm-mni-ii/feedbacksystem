#!/bin/bash

folderName=$1
filesCount=$(ls $folderName | wc -l)
requiredMigrationNumbers=($(seq -f %02g 0 $filesCount))
currentFilesCount=0

for filePath in "$folderName"/*
do
    error=false
    fileName=${filePath##*/}
    migrationNumber=${requiredMigrationNumbers[$currentFilesCount]}
    migrationNumberNoLeadingZero=$(expr $migrationNumber + 0)
    migrationInsertQuery="INSERT INTO migration (number) VALUES ($migrationNumberNoLeadingZero);"
    
    # Validate File name
    if [[ $fileName != "$migrationNumber"* ]]; then
        echo "::error file=$filePath::Invalid file name '$fileName'. The file name must start with '$migrationNumber'."
        error=true
    fi
    
    # Validate insert number
    if ! grep -iq "$migrationInsertQuery" $filePath; then
        echo "::error file=$filePath::Missing or invalid migration number is added to the database in the migration file '$fileName'. The SQL Statement '$migrationInsertQuery' must be executed."
        error=true
    fi
    
    # Exit on Error
    if [ "$error" = true ]; then
        exit 1
    fi
    
    
    ((++currentFilesCount))
done
