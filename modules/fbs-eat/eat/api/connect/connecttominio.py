import pandas as pd
from bson.json_util import dumps
from pymongo import MongoClient


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
        if isinstance(course, str):
            course = course.replace("/", "")
        # print(course)
        # course = int(course)
        # query = {"Coursenumber": {"$eq": course}}
        # CLIENT_tmp = (
        #     "mongodb://myUserAdmin:abc123@localhost:27017/timestamps?authSource=admin"
        # )
        # client = MongoClient(CLIENT_tmp)
        # db = client["timestamps"]
        # cursor = db["data"]
        # print(cursor)
        # print(pd.DataFrame(cursor.find(query)))
        # dataframe = pd.DataFrame(cursor.find())
        return dumps(data)
    try:
        raise ValueError()
        #dataframe
    except:
        dataframe = pd.DataFrame(data)
    return dataframe
