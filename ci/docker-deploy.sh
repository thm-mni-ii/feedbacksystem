#!/bin/bash

branch=$1

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

echo "DOCKER IMAGES"
docker images

echo $DOCKER_PWD | docker login -u $DOCKER_LOGIN --password-stdin

if [[ "dev" == "$branch" ]]
then
    dockerPush dev-latest
elif [[ "master" == "$branch" ]]
then
    dockerPush latest
else
    dockerPush $branch
fi