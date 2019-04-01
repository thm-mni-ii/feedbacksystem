#!/bin/bash

tag=$1
password=qtM9P2MvrROd
username=bees4ever

echo "START DOCKER DEPLOY"
docker-compose build

docker login --password $password --username $username

echo "DOCKER IMAGES"
docker images

docker tag secrettokenchecker bees4ever/secrettokenchecker:$tag
docker tag ws bees4ever/ws:$tag
docker tag submissioncheck_sqlchecker bees4ever/sqlchecker:$tag

docker push bees4ever/ws:$tag
docker push bees4ever/secrettokenchecker:$tag
docker push bees4ever/sqlchecker:$tag

tag=latest

docker tag secrettokenchecker bees4ever/secrettokenchecker:$tag
docker tag ws bees4ever/ws:$tag
docker tag submissioncheck_sqlchecker bees4ever/sqlchecker:$tag

docker push bees4ever/ws:$tag
docker push bees4ever/secrettokenchecker:$tag
docker push bees4ever/sqlchecker:$tag



