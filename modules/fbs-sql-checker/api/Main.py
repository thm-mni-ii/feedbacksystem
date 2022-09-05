# Main.py

"""System module."""
import random
import string
import sys
import requests
from JSONCreator import parseSingleStatUploadDB

# The following Code is for productive purposes

client = sys.argv[2]
if len(sys.argv) < 3:
    print("Zu wenige Argumente übergeben.")
    print(
        "Geben Sie als Argument die API an, von der die "
        "zu analysierende JSON aufgerufen werden soll."
    )
else:
    urlAnswer = sys.argv[1]
    answer = requests.get(urlAnswer, verify=False, timeout=25)
    print(answer.json())
    parseSingleStatUploadDB(answer.json(), client)
"""
# The following Code is for debugging purposes
client = (
    # Define MongoDB for debugging purposes
    "mongodb://admin:password@localhost:27017/"
)
for x in range(1):
    testId = "".join(
        random.SystemRandom().choice(string.ascii_letters + string.digits)
        for _ in range(8)
    )  # Generate random ID for the MongoDB
idJson = "{id:'%s'}" % (testId)
print(idJson)
testdic = {
    "submission": "SELECT Name, Vorname "
                  "from Kunde "
                  "GROUP BY Name",
    "passed": True,  # True if submission produced the right return in SQL-Runner
    "resultText": "OK",
    "userId": 1,
    "attempt": 1,
    "tid": 2,
    "sid": testId,
    "isSol": True,  # True solution is from docent
}

parseSingleStatUploadDB(testdic, client)
"""
