#!/bin/bash
cd $FEEDBACKSYSTEM_DIR
docker-compose pull
docker-compose up -d --remove-orphans
