#!/bin/bash

### plagiat_check_folders


dirpath=../abg/WebP2-2-Abgabe


# create compare pathes

for dir in $(ls $dirpath)
do

    olddirs=""
    for cdir in $(ls $dirpath)
    do
    if [ $cdir != $dir ]
    then

        olddirs+=" "$dirpath"/"$cdir"/"
    fi
    done
    #echo "./sim_text -R -e  -n -p -S  -T -s " $dirpath"/"$dir" / "$olddirs 
    echo $dir
    #$(echo "./sim_text -R -e  -n -p -S  -T -s " $dirpath"/"$dir" / "$olddirs )
    $(echo "./sim_text -R -e -s -S -T -r100 -p" $dirpath"/"$dir/*" / "$olddirs) # very important the -p and -r100
    
    
done