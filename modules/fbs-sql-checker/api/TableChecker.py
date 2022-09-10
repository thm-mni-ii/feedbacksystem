#TableChecker.py

from Parser import *
import SelAttributeChecker as SAC

def extractTables(json_file, client):
    json_file = parse_query(json_file, client)
    tables = []
    tablesList = (list(SAC.iterate(json_file, 'from')))
    for s in tablesList:
        try:
            tables.append(s)
        except Exception as e:
            for y in s:
                tables.append(y)
    if len(tables) == 0:
        tables = "Unknown"
    return tables
