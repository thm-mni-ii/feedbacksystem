import json
import random
import string

from JSONCreator import parseSingleStatUploadDB

def parseDataThroughChecker():
    path = r"C:\Users\Jann\Desktop\Answers_wise2122.json"
    print(path)
    f = open(path, encoding='utf8')
    data = json.load(f)

    for i in data:
        for attribute in i:
            if attribute == "submission":
                for x in range(1):
                    testId = (
                        ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(8)))
                datas = {
                    "passed": i["passed"],
                    "userId": i["userId"],
                    "attempt": i["attempt"],
                    "submission": i["submission"],
                    "tid": 339,
                    "sid": testId,
                    "isSol": False,
                    "resultText": "OK"
                }
                parseSingleStatUploadDB(datas, "mongodb://localhost:27017/")
                print("fertig")

if __name__ == '__main__':
    parseDataThroughChecker()



#DEV branch nehmen
#Lösung vorher eingeben
