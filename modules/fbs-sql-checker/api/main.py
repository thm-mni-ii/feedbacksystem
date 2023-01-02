# main.py

"""System module."""
import random  # pylint: disable=W0611
import string  # pylint: disable=W0611
import sys  # pylint: disable=W0611
import requests  # pylint: disable=W0611
from json_creator import parse_single_stat_upload_db

# The following Code is for productive purposes

# client = sys.argv[2]
# if len(sys.argv) < 3:
#     print("Zu wenige Argumente übergeben.")
#     print(
#         "Geben Sie als Argument die API an, von der die "
#         "zu analysierende JSON aufgerufen werden soll."
#     )
# else:
#     URL_ANSWER = sys.argv[1]
#     answer = requests.get(URL_ANSWER, verify=False, timeout=25)
#     print(answer.json())
#     parse_single_stat_upload_db(answer.json(), client)

# The following Code is for debugging purposes
CLIENT = (
    # Define MongoDB for debugging purposes
    "mongodb://admin:password@localhost:27017/"
)
for x in range(1):
    TEST_ID = "".join(
        random.SystemRandom().choice(string.ascii_letters + string.digits)
        for _ in range(8)
    )  # Generate random ID for the MongoDB
ID_JSON = "{id:'%s'}" % (  # pylint: disable=c0209 # pylint: disable=bad-option-value
    TEST_ID
)
print(ID_JSON)
TESTDIC = {
    "submission": "SELECT Name, AVG( Quantity ) FROM Products GROUP BY Name ",
    "passed": False,  # True if submission produced the right return in SQL-Runner
    "resultText": "OK",
    "userId": 1,
    "attempt": 2,
    "tid": 25,
    "sid": TEST_ID,
    "cid": 5,
    "isSol": False,  # True solution is from docent
}
parse_single_stat_upload_db(TESTDIC, CLIENT)
