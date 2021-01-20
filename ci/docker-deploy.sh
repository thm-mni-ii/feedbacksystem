#!/bin/bash

branch=$1
tag=$2

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

echo $DOCKER_PWD | docker login -u $DOCKER_LOGIN --password-stdin

docker-compose build

echo "DOCKER IMAGES"
docker images

if [[ -z "$tag" || "dev" == "$branch" ]]
    then
      dockerPush dev-latest
    else
      dockerPush $tag
    fi
