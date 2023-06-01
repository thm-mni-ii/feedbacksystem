"""
prepares the data to be displayed
"""

# pylint: disable=singleton-comparison


def cleandata(data_frame):
    """
    prepares the data to be displayed
    :param data_frame: data that is to be cleaned
    :return: cleaned data
    """
    column_mapping = {
        "groupByRight": "GroupBy",
        "joinsRight": "Joins",
        "orderByRight": "OrderBy",
        "proAttributesRight": "Projection_Attributes",
        "selAttributesRight": "Selection_Attributes",
        "stringsRight": "Strings",
        "tablesRight": "Tables",
        "queryRight": "Correct",
        "courseId": "Coursenumber",
        "taskNumber": "Tasknumber",
        "attempt": "Attempt",
        "id": "Id",
        "isSolution": "Solution",
        "parsable": "Parsable",
        "statement": "Statement",
        "userId": "UserId",
        "time": "Time",
    }
    data_frame = data_frame.rename(columns=column_mapping)
    data_frame.loc[
        lambda data_frame: data_frame["Solution"] == True,
        [
            "GroupBy",
            "Joins",
            "OrderBy",
            "Projection_Attributes",
            "Selection_Attributes",
            "Strings",
            "Tables",
            "Correct",
        ],
    ] = True

    data_frame.loc[
        lambda data_frame: data_frame["Correct"] == True,
        [
            "GroupBy",
            "Joins",
            "OrderBy",
            "Projection_Attributes",
            "Selection_Attributes",
            "Strings",
            "Tables",
            "Correct",
        ],
    ] = True

    data_frame = data_frame.replace(True, "correct")
    data_frame = data_frame.replace(False, "incorrect")

    data_frame["CourseName"] = data_frame["Coursenumber"].astype(str)
    data_frame["Taskname"] = data_frame["Tasknumber"].astype(str)

    user_ids_to_remove = [854, 1173, 862]
    data_frame = data_frame[~data_frame["UserId"].isin(user_ids_to_remove)]

    if "Parsable" in data_frame.columns:
        data_frame.drop(columns=["Parsable"], inplace=True)

    data_frame = data_frame.assign(
        UniqueName=data_frame["CourseName"] + "." + data_frame["Taskname"]
    )

    return data_frame


# pylint: enable=singleton-comparison
