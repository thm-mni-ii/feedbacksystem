#Main.py

import sys
import requests
from JSONCreator import parseSingleStatUploadDB
from JSONCreator import TestParseSingleStatUploadDB
import json
import string
import random


if (len(sys.argv) < 2):
        print("Zu wenige Argumente übergeben.")
        print("Geben Sie als Argument die API an, von der die zu analysierende JSON aufgerufen werden soll.")
else:
        urlAnswer = sys.argv[1]
        answer = requests.get(urlAnswer, verify=False)
        print(answer.json())
        parseSingleStatUploadDB(answer.json())
'''

for x in range(1):
  testId = (''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for _ in range(8)))
testString = "{id:'%s'}" % (testId)
print(testString)
testdic = {
        "submission": "SELECT customerName, customercity, customermail, ordertotal,salestotal FROM onlinecustomers as s inner join mitarbeiter as m on m=s WHERE salesId IS NULL order by name desc",
        "passed": False, #True wenn SQL Runner erfolgreich ist
        "resultText": "OK",
        "userId": 122,
        "attempt": 1,
        "tid": 3.39,
        "sid": testId,
        "isSol": False, #True wenn Musterlösung von Dozent
}

parseSingleStatUploadDB(testdic)
#TestParseSingleStatUploadDB(testdic)
'''