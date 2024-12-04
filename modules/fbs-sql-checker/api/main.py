# main.py

"""System module."""
import sys  # pylint: disable=W0611
import requests  # pylint: disable=W0611

from api.data_store import MongoDataStore
from api.parser import QueryParser
from api.pro_attribute_checker import ProAttributeChecker
from api.query_processor import QueryProcessor, Submission
from api.sel_attribute_checker import SelAttributeChecker
from api.table_checker import TableChecker

# The following Code is for productive purposes

if len(sys.argv) < 3:
    print("Zu wenige Argumente übergeben.")
    print(
        "Geben Sie als Argument die API an, von der die "
        "zu analysierende JSON aufgerufen werden soll."
    )
else:
    qparser = QueryParser()
    storage = MongoDataStore.connect(sys.argv[2])
    qp = QueryProcessor(
        qparser,
        TableChecker(qparser),
        ProAttributeChecker(qparser),
        SelAttributeChecker(qparser),
        storage,
    )
    answer = requests.get(sys.argv[1], verify=False, timeout=60)
    qp.process(Submission.from_dict(answer.json()))
