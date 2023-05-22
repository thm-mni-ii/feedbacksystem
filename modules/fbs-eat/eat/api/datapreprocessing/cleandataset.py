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


    df = df.replace(True, "correct")
    df = df.replace(False, "incorrect")

    #logger.error(str(df["Coursenumber"]))
    df["CourseName"] = df['Coursenumber'].astype(str)
    df["Taskname"] = df['Tasknumber'].astype(str)

    if "Parsable" in df.columns:
        df.drop(columns=["Parsable"], inplace=True)

    df = df.assign(UniqueName=df["CourseName"] + "." + df["Taskname"])

    return df