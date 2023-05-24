# main.py

"""System module."""
import sys  # pylint: disable=W0611
import requests  # pylint: disable=W0611
from json_creator import parse_single_stat_upload_db

# The following Code is for productive purposes

CLIENT = sys.argv[2]
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
    parse_single_stat_upload_db(answer.json(), CLIENT)
