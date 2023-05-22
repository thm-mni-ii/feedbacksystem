import pandas as pd
from bson.json_util import dumps
from pymongo import MongoClient
from api.datapreprocessing.cleandataset import cleandata
import os

MONGODB_URL = os.getenv("MONGODB_URL")

def data(course):
    data = {
        "Attempt": [1],
        "Coursenumber": [1],
        "Correct": [False],
        "CourseName": ["placeholder_course"],
        "GroupBy": ["placeholder_groupby"],
        "Id": [1],
        "Joins": ["placeholder_joins"],
        "OrderBy": ["placeholder_orderby"],
        "Projection_Attributes": ["placeholder_projection"],
        "Selection_Attributes": ["placeholder_selection"],
        "Solution": [True],
        "Statement": ["Statement"],
        "Strings": ["placeholder_strings"],
        "Tables": ["placeholder_tables"],
        "Taskname": ["placeholder_task"],
        "Tasknumber": [1],
        "Time": ["2023-05-15 10:00:00"],
        "UniqueName": ["placeholder_name"],
        "UserId": [0]
    }
    if course != -1 and course:
        with MongoClient(MONGODB_URL) as client:
            query = {"courseId": {"$in": course}}
            db = client.get_default_database()
            cursor = db["Queries"]
            data = cursor.find(query)
            data = cleandata(pd.DataFrame(data))
            return dumps(data)

    dataframe = pd.DataFrame(data)
    return dataframe
