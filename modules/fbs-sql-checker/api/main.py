# main.py

"""System module."""
import random  # pylint: disable=W0611
import string  # pylint: disable=W0611
import sys  # pylint: disable=W0611
import requests  # pylint: disable=W0611
from json_creator import parseSingleStatUploadDB

# The following Code is for productive purposes

client = sys.argv[2]
if len(sys.argv) < 3:
    print("Zu wenige Argumente übergeben.")
    print(
        "Geben Sie als Argument die API an, von der die "
        "zu analysierende JSON aufgerufen werden soll."
    )
else:
    URL_ANSWER = sys.argv[1]
    answer = requests.get(URL_ANSWER, verify=False, timeout=25)
    print(answer.json())
    parseSingleStatUploadDB(answer.json(), client)

# # The following Code is for debugging purposes
# CLIENT = (
#     # Define MongoDB for debugging purposes
#     "mongodb://admin:password@localhost:27017/"
# )
# for x in range(1):
#     TEST_ID = "".join(
#         random.SystemRandom().choice(string.asciiletters + string.digits)
#         for  in range(8)
#     )  # Generate random ID for the MongoDB
# ID_JSON = "{id:'%s'}" % (TEST_ID)
# print(ID_JSON)
# TESTDIC = {
#     "submission": "SELECT rezept.titel, benutzer.benutzername "
#                   "FROM rezept OUTER JOIN benutzer ON rezept.id_benutzer=benutzer.id_benutzer "
#                   "WHERE (SELECT SUM(schritt_zutat.menge) AS Milch "
#                   "FROM schritt_zutat OUTER JOIN zutat ON schritt_zutat.zutat = zutat.id_zutat "
#                   "WHERE zutat.bezeichnung = 'Milch' AND schritt_zutat.id_rezept = rezept.id_rezept "
#                   "GROUP BY zutat.id_zutat, schritt_zutat.id_rezept) > 200 "
#                   "ORDER BY rezept.id_rezept;",
#     "passed": False,  # True if submission produced the right return in SQL-Runner
#     "resultText": "OK",
#     "userId": 1,
#     "attempt": 1,
#     "tid": 8,
#     "sid": TEST_ID,
#     "cid": 5,
#     "isSol": False,  # True solution is from docent
# }
# parse_single_stat_upload_db(TESTDIC, CLIENT)