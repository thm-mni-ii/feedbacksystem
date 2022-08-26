FROM python:3

WORKDIR /app

COPY . .

RUN pip3 install mo_sql_parsing
RUN pip3 install pymongo
RUN pip3 install requests


CMD ["sh", "-c", "python3 Main.py $api"]
