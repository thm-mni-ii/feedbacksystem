import pandas as pd

def cleandata(df):
    column_mapping = {
        'groupByRight': 'GroupBy',
        'joinsRight': 'Joins',
        'orderByRight': 'OrderBy',
        'proAttributesRight': 'Projection_Attributes',
        'selAttributesRight': 'Selection_Attributes',
        'stringsRight': 'Strings',
        'tablesRight': 'Tables',
        'queryRight': 'Correct',
        'courseId': 'Coursenumber',
        'taskNumber': 'Tasknumber',
        'attempt': 'Attempt',
        'id': 'Id',
        'isSolution': 'Solution',
        'parsable': 'Parsable',
        'statement': 'Statement',
        'userId': 'UserId',
        'time': 'Time'
    }
    df = df.rename(columns=column_mapping)
    df.loc[
            lambda df: df["Solution"] == True,
        [
            "GroupBy",
            "Joins",
            "OrderBy",
            "Projection_Attributes",
            "Selection_Attributes",
            "Strings",
            "Tables",
            "Correct"
        ],
    ] = True

    df.loc[
        lambda df: df["Correct"] == True,
        [
            "GroupBy",
            "Joins",
            "OrderBy",
            "Projection_Attributes",
            "Selection_Attributes",
            "Strings",
            "Tables",
            "Correct"
        ],
    ] = True


    df = df.replace(True, "correct")
    df = df.replace(False, "incorrect")

    df["CourseName"] = df['Coursenumber'].astype(str)
    df["Taskname"] = df['Tasknumber'].astype(str)

    user_ids_to_remove = [854, 1173, 862]
    df = df[~df['UserId'].isin(user_ids_to_remove)]

    if "Parsable" in df.columns:
        df.drop(columns=["Parsable"], inplace=True)

    df = df.assign(UniqueName=df["CourseName"] + "." + df["Taskname"])

    return df