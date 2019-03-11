# Submission Check [![Build Status](https://travis-ci.org/thm-mni-ii/submissioncheck.svg?branch=master)](https://travis-ci.org/thm-mni-ii/submissioncheck) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

After login ourself with this credentials you can create a new admin and delete the default one.



## Useful hints setting up a development environment for Feedbacksystem 

#### Start Secrettoken Checker

```bash
./gradlew secrettoken-checker:run
```

#### Build Code to deploy in Docker

```bash
cd web-gui && ng build
cd .. && ./gradlew dist
docker-compose up --build --force-recreate
docker login
bash docker-push.sh
```

#### Angular local development with SSL

``ng serve --ssl --ssl-key ../docker-config/certs/localhost.key  --ssl-cert ../docker-config/certs/localhost.crt``

#### Run kafka and mysql local

Edit your ``/etc/hosts`` file and add following lines:

````bash
127.0.0.1 kafka1
127.0.0.1 mysql1
127.0.0.1 mysql2 
127.0.0.1 ws
````


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
# The Secrettoken-Checker interprets exitcodes. Exitcode 0 means all tests passed, everything except 0 means test failed 
# Following lines show a sample logic

content=$(cat $submission_file)

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