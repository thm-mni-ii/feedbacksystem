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

echo "START DOCKER BUILD"

docker-compose build

echo "START DOCKER DEPLOY"

dockerPush $tag