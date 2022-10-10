#!/bin/bash

function dockerPush() {
    tag=$1
    echo "tag is: "$tag
    
    docker tag feedbacksystem_runner thmmniii/fbs-runner:$tag
    docker tag feedbacksystem_core thmmniii/fbs-core:$tag
    docker tag feedbacksystem_runtime-bash thmmniii/fbs-runtime-bash:$tag
    
    docker push thmmniii/fbs-core:$tag
    docker push thmmniii/fbs-runner:$tag
    docker push thmmniii/fbs-runtime-bash:$tag
}

function generateDockerTag() {
    if [[ "dev" == "$branch" ]]
    then
        echo "dev-latest"
    elif [[ "main" == "$branch" ]]
    then
        echo "latest"
    else
        echo $branch
    fi
}

branch=$1
tag=$(generateDockerTag)
deployToDockerHub=$2

echo "START DOCKER BUILD"

docker-compose build

result=$?
if [ $result -ne 0  ]; then
    echo "DOCKER BUILD FAILLED"
    exit 1
fi

if [[ ! -n "${deployToDockerHub}" ]]; then
    exit 0
fi

echo "START DOCKER DEPLOY"

dockerPush $tag