#Main.py

import sys
import requests
from JSONCreator import parseSingleStatUploadDB
import json
import string
import random

#The following Code is for productive purposes

client = sys.argv[2]
if (len(sys.argv) < 3):
        print("Zu wenige Argumente übergeben.")
        print("Geben Sie als Argument die API an, von der die zu analysierende JSON aufgerufen werden soll.")
else:
        urlAnswer = sys.argv[1]
        answer = requests.get(urlAnswer, verify=False)
        print(answer.json())
        parseSingleStatUploadDB(answer.json(), client)
'''

#The following Code is for debugging purposes

client = "mongodb://admin:password@localhost:27017/" #Define MongoDB for debugging purposes
for x in range(1):
  testId = (''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(8))) #Generate random ID for the MongoDB
idJson = "{id:'%s'}" % (testId)
print(idJson)
testdic = {
        "submission": "SELECT COUNT(*) FROM Table1 INNER JOIN Table3 ON Table1.DifferentKey = Table3.DifferentKey INNER JOIN Table2 ON Table3.Key = Table3.Key AND Table2.Key2 = Table3.Key2 group by abc order by ord1, ord2 asc, ord3 desc",
        "passed": False, #True if submission produced the right return in SQL-Runner
        "resultText": "OK",
        "userId": 1,
        "attempt": 1,
        "tid": 1,
        "sid": testId,
        "isSol": True, #True solution is from docent
}

parseSingleStatUploadDB(testdic, client) '''
