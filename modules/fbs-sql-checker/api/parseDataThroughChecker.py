import json
import random
import string
import os
import sys
from tqdm import tqdm

from JSONCreator import parseSingleStatUploadDB
#Usage:
#Execute "parseDataThroughChecker.py" with a path to a json file or a directory in the console
#IMPORTANT: The filename has to end on the TaskID an have no other digits immediatly ahead of that
#The first entry in JSON-File needs to contain the Solution of the task and the course id (cid). It looks like:
'''
{
        "submission": "Select * from Example",
        "passed": true,
		"isSol": true,
        "resultText": "ok",
        "userId": 1,
        "attempt": 1,
		"taskId": 22,
		"cid": 2
    }
    
The submissions needs the following schema
{
        "submission": "select * from Example",
        "passed": true,
        "resultText": "Ok",
        "userId": 2,
        "attempt": 7
    }
'''
#Checks whether the given path is a file or directory and parses all files to "start"

client = "mongodb://admin:password@localhost:27017/"
cid = "Course ID not Found"

def parseDataThroughChecker(path):
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

#Goes through all submissions in a file and gives them to "parseSingleStatUploadDB"
def start(path):
    f = open(path, encoding='utf8')
    data = json.load(f)
    index = -6
    listOfNumbers = []
    while True:
        if path[index].isdigit():
            listOfNumbers.append(path[index])
            index = index - 1
        else:
            break
    TaskID = ""
    i = len(listOfNumbers)
    while i >= 1:
        i = i - 1
        TaskID = TaskID + listOfNumbers[i]

    for i in tqdm(data, file=sys.stdout):
        for attribute in i:
            if attribute == "submission":
                query = i["submission"].replace('\n', ' ')
                query = query.replace('\t', ' ')
                query = " ".join(query.split()) #Removed all whitespaces
                for x in range(1):
                    testId = (
                        ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(8)))
                if "isSol" in i and i["isSol"]:
                    if "taskId" in i and i ["taskId"]:
                        taskId = i["taskId"]
                        cid = i["cid"]
                    datas = {
                        "passed": True,
                        "userId": 1,
                        "attempt": 1,
                        "submission": query,
                        "tid": taskId,
                        "sid": testId,
                        "isSol": True,
                        "resultText": "OK",
                        "cid": cid
                    }
                else:
                    print(taskId)
                    print(cid)
                    datas = {
                        "passed": i["passed"],
                        "userId": i["userId"],
                        "attempt": i["attempt"],
                        "submission": query,
                        "tid": taskId,
                        "sid": testId,
                        "isSol": False,
                        "resultText": "OK",
                        "cid": cid
                    }
                parseSingleStatUploadDB(datas, client)


if __name__ == '__main__':
    pathtoData = sys.argv[1:][0]
    parseDataThroughChecker(pathtoData)
