"""
downloads that from the given mongodb
"""

import os
import pandas as pd
from pymongo import MongoClient
from api.datapreprocessing.cleandataset import cleandata

MONGODB_URL = os.getenv("MONGODB_URL")


# pylint disable-next=invalid-name
def get_data(course):
    """
    downloads data that has the same courses as given
    :param course: courses that are supposed to be downloaded
    :return: the data in JSON Format or the placeholder data in a pandas dataframe
    """
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
        "UserId": [0],
    }
    if course != -1 and course:
        with MongoClient(MONGODB_URL) as client:
            query = {"courseId": {"$in": course}}
            database = client.get_default_database()
            cursor = database["Queries"]
            data = cursor.find(query)
            data = cleandata(pd.DataFrame(data))
            return data.to_json(orient="columns", default_handler=str)

    dataframe = pd.DataFrame(data)
    return dataframe
