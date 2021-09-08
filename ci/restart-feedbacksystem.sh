#!/bin/bash
cd $FEEDBACKSYSTEM_DIR
docker-compose pull bashenv master-runner http
docker-compose up -d --remove-orphans bashenv master-runner http
