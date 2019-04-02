#!/bin/bash

tag=$1

echo "START DOCKER DEPLOY"
docker-compose build

docker login --password $DOCKER_PWD  --username $DOCKER_LOGIN

echo "DOCKER IMAGES"
docker images

docker tag secrettokenchecker thmmniii/secrettokenchecker:$tag
docker tag ws thmmniii/ws:$tag
docker tag feedbacksystem_sqlchecker thmmniii/sqlchecker:$tag

docker push thmmniii/ws:$tag
docker push thmmniii/secrettokenchecker:$tag
docker push thmmniii/sqlchecker:$tag

tag=latest

docker tag secrettokenchecker thmmniii/secrettokenchecker:$tag
docker tag ws thmmniii/ws:$tag
docker tag feedbacksystem_sqlchecker thmmniii/sqlchecker:$tag

docker push thmmniii/ws:$tag
docker push thmmniii/secrettokenchecker:$tag
docker push thmmniii/sqlchecker:$tag



