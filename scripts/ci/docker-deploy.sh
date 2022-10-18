#!/bin/bash

branch=$1

function dockerPush(){
    tag=$1
    echo "tag is: "$tag
    
    docker tag feedbacksystem_runner thmmniii/fbs-runner:$tag
    docker tag feedbacksystem_core thmmniii/fbs-core:$tag
    docker tag feedbacksystem_runtime-bash thmmniii/fbs-runtime-bash:$tag
    docker tag sql-checker thmmniii/fbs-sql-checker:$tag
    
    docker push thmmniii/fbs-core:$tag
    docker push thmmniii/fbs-runner:$tag
    docker push thmmniii/fbs-runtime-bash:$tag
    docker push thmmniii/fbs-sql-checker:$tag
}

echo "START DOCKER DEPLOY"

docker-compose -f docker-compose.yml -f docker-compose.ci.yml build

echo "DOCKER IMAGES"
docker images

echo $DOCKER_PWD | docker login -u $DOCKER_LOGIN --password-stdin

if [[ "dev" == "$branch" ]]
then
    dockerPush dev-latest
elif [[ "main" == "$branch" ]]
then
    dockerPush latest
else
    dockerPush $branch
fi
