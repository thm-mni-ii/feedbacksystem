# main.py

"""System module."""
import json
import sys  # pylint: disable=W0611

import requests  # pylint: disable=W0611

from api.comparator.sqlparse_comparator import SqlparseComparator
from api.data_store import MongoDataStore
from api.distance.distance_calc import GetDistanceCalculator
from api.query_processor import QueryProcessorV2
from api.datatypes import Submission
from api.solution_fetcher import NearestSolutionFetcher, FirstSolutionFetcher

# The following Code is for productive purposes

if len(sys.argv) < 3:
    print("Zu wenige Argumente übergeben.")
    print(
        "Geben Sie als Argument die API an, von der die "
        "zu analysierende JSON aufgerufen werden soll."
    )
else:
    answer = requests.get(sys.argv[1], verify=False, timeout=60)
    submission = Submission.from_dict(answer.json())
    storage = MongoDataStore.connect(sys.argv[2])
    qp = QueryProcessorV2(
        SqlparseComparator(),
        NearestSolutionFetcher(storage, GetDistanceCalculator()),
    )
    result = qp.process(submission)

    print("storing", result.to_db_dict())
    storage.store("Queries", result.to_db_dict())
