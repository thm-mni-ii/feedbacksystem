import json
import random
import string
import os
import sys

from JSONCreator import parseSingleStatUploadDB
#The file has to end on the TaskID an have no other digits immediatly ahead of that
def parseDataThroughChecker(path):
    if os.path.isfile(path):
        start(path)
    elif os.path.isdir(path):
        for filename in os.listdir(path):
            if filename.endswith(".json"):
                start(path + "\\" + filename)
    else:
        print("No such file or directory")

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

    for i in data:
        for attribute in i:
            if attribute == "submission":
                for x in range(1):
                    testId = (
                        ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(8)))
                if "isSol" in i and i["isSol"]:
                    datas = {
                        "passed": True,
                        "userId": 1,
                        "attempt": 1,
                        "submission": i["submission"],
                        "tid": TaskID,
                        "sid": testId,
                        "isSol": True,
                        "resultText": "OK"
                    }
                else:
                    datas = {
                        "passed": i["passed"],
                        "userId": i["userId"],
                        "attempt": i["attempt"],
                        "submission": i["submission"],
                        "tid": TaskID,
                        "sid": testId,
                        "isSol": False,
                        "resultText": "OK"
                    }
                parseSingleStatUploadDB(datas, "mongodb://localhost:27017/")


if __name__ == '__main__':
    pathtoData = sys.argv[1:][0]
    parseDataThroughChecker(pathtoData)



#DEV branch nehmen
#Lösung vorher eingeben
