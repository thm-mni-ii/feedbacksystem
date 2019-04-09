# Submission Check [![Build Status](https://travis-ci.org/thm-mni-ii/feedbacksystem.svg?branch=master)](https://travis-ci.org/thm-mni-ii/feedbacksystem) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

As a student you have to submit a lot of tasks
for your lectures. And usually the only reply you
get is that you passed or not. This is a situation
we want to change.
Feedbacksystem is a system to automatically check
your submissions and give an immediate result.
With the result we want to provide suggestions
to the students about their mistakes.
But also collect the most common mistakes and
present them to the lecturer such that they
can address them in the lectures.


## Run in Production
We provide the application and all dependencies via docker containers
that are already defined in the `docker-compose.yml` file.
There are several configuration needed, which are already done inside the ``docker-config`` folder. You may want to change them.

Build the applications by executing

```bash
./gradlew dist
```

Then run the app on a docker system in background by executing

```bash
docker-compose up -d
```


If the application is running you can login as Admin using:

*username: `admin`* and 
*password: ``AWObcEyYi6SZaYKU9daTgKt``*.

After login yourself with this credentials you can create a new admin and delete the default one.



## Production


```yaml
 
 version: '2'         # We still wants to keep compatible with an older docker-compose version (which Rancher 1.6 uses)
 
 services:
   zoo1:
     image: 'bitnami/zookeeper:latest'
     hostname: zoo1   # We currently use only one zookeeper
     environment:
     # This is an somehow unsecure setting, because no password and user is needed, but we use this in a virtual network.
     - ALLOW_ANONYMOUS_LOGIN=yes   
     volumes:
     - ./docker-config/zoo1:/bitnami/zookeeper  # Zookeeper working dir is mounted to keep all data after restart
                        
   kafka1:
     image: 'bitnami/kafka:latest'
     hostname: kafka1     # hostname how one can connect to kafka
     environment:
     # These are also settings, which allow to communicate plan text with kafka. This is no problem either, because we use this in a virtual network.
     - KAFKA_ZOOKEEPER_CONNECT=zoo1:2181
     - ALLOW_PLAINTEXT_LISTENER=yes
     - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://:9092
     - KAFKA_LISTENERS=PLAINTEXT://:9092
     - KAFKA_ADVERTISED_HOST_NAME=kafka1    
     - KAFKA_ADVERTISED_PORT=9092
     depends_on:
     - zoo1   # needs a running zookeeper
     volumes:
     - ./docker-config/kafka1:/bitnami/kafka  # Kafka working dir is mounted to keep all data after restart
 
   mysql1:
     image: mysql:8.0
     command: --default-authentication-plugin=mysql_native_password
     restart: always
     environment:
       MYSQL_ROOT_PASSWORD: twRuvi2ejllDdA4nnQLa08O # Database Password
       MYSQL_DATABASE: submissionchecker            # Database User
     volumes:
     - ./docker-config/mysql1:/var/lib/mysql        # Keep DB after reload
   bash1:
     image: bash:4.4
   mysql2:
     image: mysql:8.0
     command: --default-authentication-plugin=mysql_native_password
     restart: always
     environment:
       MYSQL_ROOT_PASSWORD: SqfyBWhiFGr7FK60cVR2rel # Database Password
     volumes:
     - ./docker-config/mysql2:/var/lib/mysql        # Keep DB after reload
   ws:
     image: bees4ever/ws:v0.0.11
     depends_on:
     - mysql1
     - kafka1
     - zoo1
     ports:
     - "443:8080"
     volumes:
     - ./ws/upload-dir:/upload-dir                  # Mount the webservice intern upload dir of all tasks and submissions
     - ./ws/zip-dir:/zip-dir                        # Mount the temporary folder for generating zip files
     # Specify a application property file for the webservice. It contains all settings concerning CAS, LDAP, Kafka connection, etc 
     - ./docker-config/ws/application.properties:/usr/local/appconfig/application.properties
     # Mount the markdown files, which are visible on the website
     - ./docker-config/ws/markdown/:/usr/local/appconfig/markdown/
   secrettokenchecker:
     image: bees4ever/secrettokenchecker:v0.0.11
     depends_on:
     - mysql1
     - kafka1
     - zoo1
     - ws
     environment:
      # NOTE: This environment variable needs an valid path
      # Please specify the full root path of the secret token upload dir 
       HOST_UPLOAD_DIR: /path/to/secrettoken/upload-dir  
     volumes:
     # We need to access the host docker system from inside a docker image
     # Therefore we need to mount this two folder of the host system inside this docker image 
     - /var/run/:/var/run/   
     - /var/run/docker.sock:/var/run/docker.sock
     # Once again we need to configure the upload dir of the secrettoken   
     - ./secrettoken-checker/upload-dir:/upload-dir
     # Specify the secrettoken applications configuration    
     - ./docker-config/secrettoken/application.conf:/usr/local/appconfig/application.config
   sqlchecker:
     image: bees4ever/sqlchecker:v0.0.11
     depends_on:
     - mysql2
     - kafka1
     - zoo1
     - ws
     volumes:
     - ./sql-checker/upload-dir:/upload-dir  # specify the SQL Checker's upload dir 
     # Specify the sql applications configuration
     - ./docker-config/sqlchecker/application.conf:/usr/local/appconfig/application.config 
```



## Testsystems and Testfiles

Once the Feedbacksystem is up and running it is interesting to set up own test where students can submit solutions for.

The following section will show some examples.

#### Testscript for **Secrettoken-Checker** 

````sh
#!/bin/bash

casname=$1  # Provides the CAS ID of submiting user
submission_file=$2     # Provides the submitted file path (even if it was a text, it will be converted to a file) 

# You can use $casname to generate a user specific token

# Everything written to the stdout will be caught and returned to the student.
# The Secrettoken-Checker interprets exitcodes. Exitcode 0 means all tests passed, everything except 0 means test failed. 
# If one provides an aditional testfile it's path can be accessed using the variable TESTFILE_PATH, otherwise the variable is empty
# Following lines show a sample logic:


content=$(cat $submission_file)

if [ -n "$TESTFILE_PATH" ] # check if the variabe is set to access the path of the testfile
	then
	echo "Variable set"
	cat $TESTFILE_PATH     # use the content of the testfile
else
	echo "Variable NOT set" # do something else
fi

if [ "$content" == "some-token-which-should-be-solved" ] 
then
echo "Hi "$casname", your submission is correct!"
exit 0  # Here the script indicates a passed
else
echo "Hi "$casname", your submission is incorrect!"
exit 1  # Here the script indicates a failed
fi 
````


## Supervised By

* Frank Kammer