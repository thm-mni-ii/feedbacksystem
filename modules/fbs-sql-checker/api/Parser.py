#Parser.py

import json
import mo_sql_parsing
from pymongo import MongoClient


#Parse the query
def parse_query(data, client):
    try:
        parsedQuery = mo_sql_parsing.parse(data)
    except Exception as e:
        print("Not able to parse the statement " + str(data))
        print(e)
        mydb = client['sql-checker']
        mycollection = mydb['NotParsable']
        record = data
        mycollection.insert_one(record)
        return False
    jsonOutput = json.dumps(parsedQuery, indent=4)
    pyt_obj = json.loads(jsonOutput)
    return pyt_obj
