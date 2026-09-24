#!/bin/bash

set -e

REGISTRY="${REGISTRY:-ghcr.io}"
REGISTRY_OWNER="${REGISTRY_OWNER:-thm-mni-ii}"
# GitHub Container Registry requires lowercase owner/namespaces
IMAGE_PREFIX="${REGISTRY}/$(echo "${REGISTRY_OWNER}" | tr '[:upper:]' '[:lower:]')"

function dockerPush() {
    tag=$1
    echo "tag is: "$tag
    echo "target image prefix: "$IMAGE_PREFIX

    docker tag feedbacksystem-runner ${IMAGE_PREFIX}/fbs-runner:$tag
    docker tag feedbacksystem-core ${IMAGE_PREFIX}/fbs-core:$tag
    docker tag feedbacksystem-identity-service ${IMAGE_PREFIX}/fbs-identity-service:$tag
    docker tag feedbacksystem-web-shell ${IMAGE_PREFIX}/fbs-web-shell:$tag
    docker tag feedbacksystem-course-management-web ${IMAGE_PREFIX}/fbs-core-web:$tag
    docker tag feedbacksystem-sql-playground-web ${IMAGE_PREFIX}/fbs-sql-playground-web:$tag
    docker tag feedbacksystem-runtime-bash ${IMAGE_PREFIX}/fbs-runtime-bash:$tag
    docker tag feedbacksystem_sql-checker ${IMAGE_PREFIX}/fbs-sql-checker:$tag
    docker tag feedbacksystem-dashboard ${IMAGE_PREFIX}/fbs-eat:$tag
    docker tag feedbacksystem-collab ${IMAGE_PREFIX}/fbs-collab:$tag
    docker tag feedbacksystem-qcm-backend ${IMAGE_PREFIX}/fbs-qcm-backend:$tag
    docker tag feedbacksystem-qcm-frontend ${IMAGE_PREFIX}/fbs-qcm-frontend:$tag

    docker push ${IMAGE_PREFIX}/fbs-core:$tag
    docker push ${IMAGE_PREFIX}/fbs-identity-service:$tag
    docker push ${IMAGE_PREFIX}/fbs-web-shell:$tag
    docker push ${IMAGE_PREFIX}/fbs-core-web:$tag
    docker push ${IMAGE_PREFIX}/fbs-sql-playground-web:$tag
    docker push ${IMAGE_PREFIX}/fbs-runner:$tag
    docker push ${IMAGE_PREFIX}/fbs-runtime-bash:$tag
    docker push ${IMAGE_PREFIX}/fbs-sql-checker:$tag
    docker push ${IMAGE_PREFIX}/fbs-eat:$tag
    docker push ${IMAGE_PREFIX}/fbs-collab:$tag
    docker push ${IMAGE_PREFIX}/fbs-qcm-backend:$tag
    docker push ${IMAGE_PREFIX}/fbs-qcm-frontend:$tag
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

docker compose build

echo "START DOCKER DEPLOY"

dockerPush $tag
