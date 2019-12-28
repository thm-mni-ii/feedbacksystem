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

## Testsystems and Testfiles

Once the Feedbacksystem is up and running it is interesting to set up own test where students can submit solutions for.

The following section will show some examples.

#### Testscript for **Secrettoken-Checker** 

````sh
#!/bin/bash

casname=$1             # Provides the CAS ID of submiting user
submission_file=$2     # Provides the submitted file path (even if it was a text, it will be converted to a file)
need_info=$3           # some exercises generates specific task for users. If this flagg contains "info"
                       # the script can provide an user specific question 
                       
# You can use $casname to generate a user specific token

# Everything written to the stdout will be caught and returned to the student.
# The Secrettoken-Checker interprets exitcodes. Exitcode 0 means all tests passed, everything except 0 means test failed. 
# If one provides an aditional testfile it's path can be accessed using the variable TESTFILE_PATH, otherwise the variable is empty
# Following lines show a sample logic:


content=$(cat $submission_file)

if [ "$need_info" == "info" ]
then
echo "This is a user specific exercise for "$casname
fi


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


## Plagiarism Script
````bash 
#!/bin/bash

php_array='['

for fil in $(ls $USERS_SUBMISSION_DIR)
do
    # split the $fil name and extract the submission number  
    IFS='_'
    read -ra ADDR <<< "$fil"
    php_array=$php_array$(echo -n ${ADDR[1]})","
done

php_array=$php_array"]"

#echo $php_array
php -r "\$a="$php_array";foreach("\$a" as &\$elem){\$elem = [\$elem => true];};echo json_encode("\$a");"


exit 0


````

## Supervised By

* Frank Kammer
