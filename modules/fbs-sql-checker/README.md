To start SQL checker make sure that You installed Docker and python3.
First build a docker container with an SQL-Checker.
sudo docker build -t sql-checker
After the build ended succesfully start the container with following. Take care to replace "API" through an API where the JSON that should be analysed is saved.
sudo docker run -e api="API" sql-checker

For example, if Your API is at http://127.0.0.1:5000/answer,
type
sudo docker run -e api="http://127.0.0.1:5000/answer" sql-checker

to start the application.