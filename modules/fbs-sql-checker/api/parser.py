# parser.py

import json
import mo_sql_parsing
from pymongo import MongoClient


# Parse the query
def parse_query(data, client):
    try:
        parsed_query = mo_sql_parsing.parse(data)
    except Exception as e:
        print("Not able to parse the statement " + str(data))
        print(e)
        client = MongoClient(client, 27017)
        mydb = client["SQLChecker"]
        mycollection = mydb["NotParsable"]
        record = data
        mycollection.insert_one(record)
        return False
    json_output = json.dumps(parsed_query, indent=4)
    pyt_obj = json.loads(json_output)
    return pyt_obj
