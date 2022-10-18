It is an online tutoring system for module "Datenbankensysteme" at Technische Hochschule Mittelhessen. SQL-Checker is connected to the Feedbacksystem of THM and is helping tutors and professors to correct students' answers. After a student sends an answer at Feedbacksystem, it will be sent to the SQL-Checker. If the answer was wrong, the SQL-Checker helps to find the mistake.

To start SQL checker make sure that You installed Docker and python3.

First build a docker container with an SQL-Checker.

<code>sudo docker build -t sql-checker</code>

After the build ended succesfully start the container with following. Take care to replace "API" through an API where the JSON that should be analysed is saved.

<code>sudo docker run -e api="API" -e mongodb="localhost" sql-checker
</code>

For example, if Your API is at http://127.0.0.1:5000/answer,

type

<code>sudo docker run -e api="http://127.0.0.1:5000/answer" -e mongodb="localhost" sql-checker
</code>

to start the application.

Development:

Run "poetry install" to install all dependencies.

Modify comments in main.py to use the development code.

Setup a local mongodb and define it in "client"
