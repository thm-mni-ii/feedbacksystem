# Feedbacksystem [![Build Status](https://travis-ci.org/thm-mni-ii/feedbacksystem.svg?branch=master)](https://travis-ci.org/thm-mni-ii/feedbacksystem) [![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

As a student you have to submit a lot of tasks
for your lectures. Usually the only reply you
get is that you passed or failed. This is a situation
we want to change.
Feedbacksystem is an application to automatically check
your submissions and give an immediate result.
With the result we want to provide suggestions
to the students about their mistakes, 
collect the most common mistakes and
present them to the lecturers such that they
can address them in the lectures.

## Getting it Running for Production

TODO: 

## Getting it Running for Development
First you have to install some dependencies.

* Java JDK 14+ (e.g., OpenJDK 14)
* Gradle 6.4.1+ (a gradlew wrapper is included in the project)
* Node 13.8.0+ 
* NPM 6.13.7+
* Docker 19.03.8+
* Scala 2.12.8 (your IDE might install it automatically if using an scala plugin)

After getting your dependencies installed download and import this repository in your favourite IDE (e.g., InteliJ IDEA Ultimate). The Feedbacksystem is a distributed system. Use a terminal and build the whole system by executing `./gradlew dist` once.
After a successfull build run `docker-compose up -d` to run every part of the system and check it by executing `docker-compose ps`. You should see something like the following.

```bash
               Name                              Command                State                          Ports                      
----------------------------------------------------------------------------------------------------------------------------------
feedbacksystem_bashenv_1              docker-entrypoint.sh /bin/ ...   Exit 127                                                   
feedbacksystem_kafka1_1               /app-entrypoint.sh /run.sh       Up         0.0.0.0:29092->29092/tcp, 0.0.0.0:9092->9092/tcp
feedbacksystem_mysql1_1               docker-entrypoint.sh --def ...   Up         0.0.0.0:3308->3306/tcp, 33060/tcp               
feedbacksystem_mysql2_1               docker-entrypoint.sh --def ...   Up         0.0.0.0:3309->3306/tcp, 33060/tcp               
feedbacksystem_nodeenv_1              docker-entrypoint.sh node        Exit 0                                                     
feedbacksystem_secrettokenchecker_1   ./secrettoken-checker            Up         2375/tcp, 2376/tcp                              
feedbacksystem_sqlchecker_1           ./sql-checker                    Up                                                         
feedbacksystem_ws_1                   ./wsd                            Up         0.0.0.0:443->8080/tcp                           
feedbacksystem_zoo1_1                 /app-entrypoint.sh /run.sh       Up         0.0.0.0:2181->2181/tcp, 2888/tcp, 3888/tcp  
```

Note that *bashenv* and *nodeenv* exited with some status code and are not running. This behaiviour is intended (do not try to *fix* it.) These parts of the system are started on demand if neccessary.

At this point the system is up and running. To modify one part of the system, e.g., *ws*, we recommend to lookup its container id (with `docker ps`), kill it (with `docker kill the-id`) and start *ws* locally with your IDE to be able to use the IDE debugger and restart the system fast.
