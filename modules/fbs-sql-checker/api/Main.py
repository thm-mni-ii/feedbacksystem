#Main.py

import sys
import requests
from JSONCreator import parseSingleStatUploadDB
import json
import string
import random

'''
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
        "submission": "SELECT customerName, customercity, customermail, ordertotal,salestotal FROM onlinecustomers as s inner join mitarbeiter as m on m=s WHERE salesId IS NULL having COUNT(CustomerID1) > 1 and COUNT(CustomerID2) > 2 or COUNT(CustomerID3) > 3 and COUNT(CustomerID4) > 4 or COUNT(CustomerID5) > 5 or COUNT(CustomerID6) > 6 order by name desc",
        "passed": True, #True if submission produced the right return in SQL-Runner
        "resultText": "OK",
        "userId": 1,
        "attempt": 1,
        "tid": 1,
        "sid": testId,
        "isSol": True, #True solution is from docent
}

parseSingleStatUploadDB(testdic, client)
#TestParseSingleStatUploadDB(testdic)

