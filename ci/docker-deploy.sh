#!/bin/bash

tag=$1
branch=$2

function dockerPush(){
    branch=$2
    if [ "$branch" = "master" ]
        then
            tag=$1
        else
            tag="dev-"$1
        fi

     echo "tag is: "$tag


    docker tag feedbacksystem_secrettokenchecker thmmniii/secrettokenchecker:$tag
    docker tag feedbacksystem_ws thmmniii/ws:$tag
    docker tag feedbacksystem_sqlchecker thmmniii/sqlchecker:$tag
    docker tag feedbacksystem_bashenv thmmniii/bashenv:$tag

    docker push thmmniii/ws:$tag
    docker push thmmniii/secrettokenchecker:$tag
    docker push thmmniii/sqlchecker:$tag
    docker push thmmniii/bash:$tag
}


echo "START DOCKER DEPLOY"
docker-compose build

docker login --password $DOCKER_PWD  --username $DOCKER_LOGIN

echo "DOCKER IMAGES"
docker images

dockerPush $tag $branch
dockerPush latest $branch



