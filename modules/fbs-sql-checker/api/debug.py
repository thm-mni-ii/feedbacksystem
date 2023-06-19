import random  # pylint: disable=W0611
import string  # pylint: disable=W0611
from json_creator import parse_single_stat_upload_db


CLIENT = (
    # Define MongoDB for debugging purposes
    "mongodb://localhost:27017/sql-checker?authSource=admin"
)
for x in range(1):
    TEST_ID = "".join(
        random.SystemRandom().choice(string.ascii_letters + string.digits)
        for _ in range(8)
    )  # Generate random ID for the MongoDB
ID_JSON = f"{id:'%s'}" % (  # pylint: disable=c0209 # pylint: disable=bad-option-value
    TEST_ID
)
print(ID_JSON)
TESTDIC = {
    "submission": "SELECT name FROM benutzer r",
    "passed": False,  # True if submission produced the right return in SQL-Runner
    "resultText": "OK",
    "userId": 1,
    "attempt": 2,
    "tid": 23,
    "sid": TEST_ID,
    "cid": 5,
    "isSol": False,  # True solution is from docent
}
parse_single_stat_upload_db(TESTDIC, CLIENT)
