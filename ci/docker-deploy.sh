#!/bin/bash

tag=$1
branch=$2

function dockerPush(){
    tag=$1
    echo "tag is: "$tag

    docker tag feedbacksystem_master-runner thmmniii/master-runner:$tag
    docker tag feedbacksystem_http thmmniii/http:$tag
    docker tag feedbacksystem_bashenv thmmniii/bashenv:$tag

    docker push thmmniii/http:$tag
    docker push thmmniii/master-runner:$tag
    docker push thmmniii/bashenv:$tag
}

echo "START DOCKER DEPLOY"
docker-compose build

docker login --password $DOCKER_PWD  --username $DOCKER_LOGIN

echo "DOCKER IMAGES"
docker images

if [[ -z "$tag" || "dev" == "$branch" ]]
    then
      dockerPush dev-latest
    else
      dockerPush $tag
    fi
