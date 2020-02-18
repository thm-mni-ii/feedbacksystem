# Submission Check [![Build Status](https://travis-ci.org/thm-mni-ii/feedbacksystem.svg?branch=master)](https://travis-ci.org/thm-mni-ii/feedbacksystem) [![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

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

## Supervised By

* Frank Kammer
