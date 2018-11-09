#!/bin/bash

# Here we take the name of the user and a token which should be the md5 hash of the name
# then we compare the the generated md5 hash with the token and exit 0 if identical and 1 if not
# with appropriate messages

name=$1

token=$(echo -n $2 | tr '[:upper:]' '[:lower:]') 

md5name=$(echo -n ${name} | md5sum | awk '{print $1}')

if [ "$token" == "$md5name" ] 
then
echo correct: token and md5 hash are identical
exit 0
else
echo fault: token and md5 hash are not identical
echo $token
echo $md5name
exit 1
fi
