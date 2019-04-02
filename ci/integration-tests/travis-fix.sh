#!/bin/bash

# run as sudo would be nice

echo -e "\033[1;32m DEBUG Start \033[0m"
netstat -a -n -op | grep 3306
killall mysqld
service mysql stop
netstat -a -n -op | grep 3306
echo -e "\033[1;32m DEBUG End \033[0m"

# If we run our py test we need some sample tables and users
mv ./docker-config/ws/test.sql ./docker-config/ws/init.sql

exit 0