#ProAttributeChecker.py

import SelAttributeChecker as SAC
from Parser import *


def extractProAttributes(json_file, client):
    json_file = parse_query(json_file, client)
    proAtts = []
    proAttsList = (list(SAC.iterate(json_file, 'select')))
    for s in proAttsList:
        try:
            proAtts.append(s['value'])
        except Exception as e:
            for y in s:
                proAtts.append(y['value'])
    if len(proAtts) == 0:
        proAtts = "Unknown"
    return proAtts