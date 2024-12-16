import json
import random
import string
import os
import sys
from tqdm import tqdm

from query_processor import parse_single_stat_upload_db

# Usage:
# Execute "parse_data_through_checker.py" with a path to a json file or a directory in the console
# The first entry in JSON-File needs to contain the Solution of the task and the course id (cid). It looks like:
# {
#         "submission": "Select * from Example",
#         "passed": true,
# 		"isSol": true,
#         "resultText": "ok",
#         "userId": 1,
#         "attempt": 1,
# 		"taskId": 22,
# 		"cid": 2
#     }
# The submissions needs the following schema
# {
#         "submission": "select * from Example",
#         "passed": true,
#         "resultText": "Ok",
#         "userId": 2,
#         "attempt": 7
#     }
# Checks whether the given path is a file or directory and parses all files to "start"

CLIENT = "mongodb://admin:password@localhost:27017/"
CID = "Course ID not Found"


def parse_data_through_checker(path):
    if os.path.isfile(path):
        start(path)
    elif os.path.isdir(path):
        for filename in os.listdir(path):
            if filename.endswith(".json"):
                if path.endswith("\\"):
                    start(path + filename)
                else:
                    start(path + "\\" + filename)
    else:
        print("No such file or directory")


# Goes through all submissions in a file and gives them to "parseSingleStatUploadDB"
def start(path):
    with open(path, encoding="utf8") as f:
        data = json.load(f)
    for i in tqdm(data, file=sys.stdout):
        for attribute in i:
            if attribute == "submission":
                query = i["submission"].replace("\n", " ")
                query = query.replace("\t", " ")
                query = " ".join(query.split())  # Removed all whitespaces
                for x in range(1):  # pylint: disable=W0612
                    test_id = "".join(
                        random.SystemRandom().choice(
                            string.ascii_letters + string.digits
                        )
                        for _ in range(8)
                    )
                if "isSol" in i and i["isSol"]:
                    if "taskId" in i and i["taskId"]:
                        task_id = i["taskId"]
                        cid = i["cid"]
                    datas = {
                        "passed": True,
                        "userId": 1,
                        "attempt": 1,
                        "submission": query,
                        "tid": task_id,
                        "sid": test_id,
                        "isSol": True,
                        "resultText": "OK",
                        "cid": cid,
                    }
                else:
                    datas = {
                        "passed": i["passed"],
                        "userId": i["userId"],
                        "attempt": i["attempt"],
                        "submission": query,
                        "tid": task_id,
                        "sid": test_id,
                        "isSol": False,
                        "resultText": "OK",
                        "cid": cid,
                    }
                parse_single_stat_upload_db(datas, CLIENT)


if __name__ == "__main__":
    PATHTODATA = sys.argv[1:][0]
    parse_data_through_checker(PATHTODATA)
