#
#
#
# First you need to replace the Header with the string in the following line
# Attempt,Coursenumber,GroupBy,Id,Solution,Joins,OrderBy,Parsable,Projection_Attributes,Correct,Selection_Attributes,Statement,Strings,Tables,Tasknumber,UserId
# Now you can use this script to clean up your csv file. A new file will be generated so your original file won't be changed

import pandas as pd

df = pd.read_csv("../data/Dataset.csv")

# If its correct, all the parameters will be set to true
df.loc[
    df["Correct"] == True,
    [
        "GroupBy",
        "Joins",
        "OrderBy",
        "Projection_Attributes",
        "Selection_Attributes",
        "Strings",
        "Tables",
    ],
] = True

# replace true and false with correct and incorrect to make it looks better

df = df.replace(True, "correct")
df = df.replace(False, "incorrect")

df.loc[df["Tasknumber"] > 350, "Coursenumber"] = 162

df["CourseName"] = df["Coursenumber"].apply(
    lambda x: "DBSWS20" if x == 157 else ("DBSSS21" if x == 162 else None)
)

df["Taskname"] = df["Tasknumber"].apply(lambda x: f"task-{x - 339}")

if "Parsable" in df.columns:
    df.drop(columns=["Parsable"], inplace=True)

df = df.assign(UniqueName=df["CourseName"] + "." + df["Taskname"])

df.to_csv("cleaned_data_with_names.csv", index=False)

print(df.head())
