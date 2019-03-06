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


## Testsystems and Testfiles

Once the Feedbacksystem is up and running it is interesting to set up own test where students can submit solutions for.

The following section will show some examples.

#### Testscript for **Secrettoken-Checker** 

````sh
#!/bin/bash

submission=$1  # Provides the CAS ID of submiting user
casname=$2     # Provides the submitted text (even if it was a file, it will be currently converted to a string) 

# You can use $casname to generate a user specific token

# Everything written to the stdout will be caught and returned to the student.
# The Secrettoken-Checker interprets exitcodes. Exitcode 0 means all tests passed, everything except 0 means test failed 
# Following lines show a sample logic


if [ "submission" == "some-token-which-should-be-solved" ] 
then
echo correct: token and md5 hash are identical
exit 0  # Here the script indicates a passed
else
echo fault: token and md5 hash are not identical
exit 1  # Here the script indicates a failed
fi 

````




## Supervised By

* Frank Kammer