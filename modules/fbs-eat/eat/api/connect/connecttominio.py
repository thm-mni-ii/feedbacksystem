import pandas as pd
from bson.json_util import dumps
from pymongo import MongoClient
from api.datapreprocessing.cleandataset import cleandata



def data(course):
    data = {
        "Attempt": [1],
        "Coursenumber": [1],
        "GroupBy": ["placeholder_groupby"],
        "Id": [1],
        "Solution": [True],
        "Joins": ["placeholder_joins"],
        "OrderBy": ["placeholder_orderby"],
        "Projection_Attributes": ["placeholder_projection"],
        "Correct": [False],
        "Selection_Attributes": ["placeholder_selection"],
        "Statement": ["Statement"],
        "Strings": ["placeholder_strings"],
        "Tables": ["placeholder_tables"],
        "Tasknumber": [1],
        "UserId": [0],
        "CourseName": ["placeholder_course"],
        "Taskname": ["placeholder_task"],
        "UniqueName": ["placeholder_name"],
        "Time": ["2023-05-15 10:00:00"],
    }
    if course != -1 and course:
        CLIENT_tmp = (
            "mongodb://mongodb:27017/sql-checker"
        )
        client = MongoClient(CLIENT_tmp)
        query = {"courseId": {"$in": course}}
        db = client.get_default_database()
        cursor = db["Queries"]
        data = cursor.find(query)
        data = cleandata(pd.DataFrame(data))
        return dumps(data)

    dataframe = pd.DataFrame(data)
    return dataframe
