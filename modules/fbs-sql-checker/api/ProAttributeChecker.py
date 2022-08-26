#ProAttributeChecker.py

import Formatting as f
from SelAttributeChecker import *
from Parser import *

selectCommands = ["sum", "count", "round", "distinct", "sec_to_time", "avg", "max", "min", "time_to_sec", "like",
                  "between", "div", "year", "mul"]


# Return ProjectionAttributes as a List
def listOfSelect(json_file):
    selects = []
    if (not (f.isString(json_file)) and (f.isSelect(json_file))):
        if (isinstance(json_file['select'], list)):
            for val in range(len(json_file['select'])):
                if ("value" in json_file['select'][val]):
                    for val1 in json_file['select'][val]["value"]:
                        if val1 in selectCommands:
                            if (isinstance(json_file['select'][val]['value'][val1], str)):
                                if ("." in json_file['select'][val]['value'][val1]):
                                    selects.append(json_file['select'][val]['value'][val1].split(".")[1].lower())
                                else:
                                    selects.append(json_file['select'][val]['value'][val1].lower())
                            if (isinstance(json_file['select'][val]['value'][val1], list)):
                                for i in range(len(json_file['select'][val]['value'][val1])):
                                    if (isinstance(json_file['select'][val]['value'][val1][i], dict)):
                                        for elem1 in json_file['select'][val]['value'][val1][i]:
                                            if (elem1 in selectCommands):
                                                if (
                                                        isinstance(json_file['select'][val]['value'][val1][i][elem1],
                                                                   list)):
                                                    for elem2 in range(
                                                            len(json_file['select'][val]['value'][val1][i][elem1])):
                                                        if (isinstance(
                                                                json_file['select'][val]['value'][val1][i][elem1][
                                                                    elem2], str)):
                                                            if ("." in
                                                                    json_file['select'][val]['value'][val1][i][elem1][
                                                                        elem2]):
                                                                selects.append(
                                                                    json_file['select'][val]['value'][val1][i][elem1][
                                                                        elem2].split(".")[1].lower())
                                                            else:
                                                                selects.append(
                                                                    json_file['select'][val]['value'][val1][i][elem1][
                                                                        elem2])
                                                        elif (isinstance(
                                                                json_file['select'][val]['value'][val1][i][elem1][
                                                                    elem2], list)):
                                                            for elem3 in \
                                                                    json_file['select'][val]['value'][val1][i][elem1][
                                                                        elem2]:
                                                                if (elem3 in selectCommands):
                                                                    if ("." in
                                                                            json_file['select'][val]['value'][val1][i][
                                                                                elem1][elem2][elem3]):
                                                                        selects.append(
                                                                            json_file['select'][val]['value'][val1][i][
                                                                                elem1][elem2][elem3].split(".")[
                                                                                1].lower())
                                                                    else:
                                                                        selects.append(
                                                                            json_file['select'][val]['value'][val1][i][
                                                                                elem1][elem2][elem3].lower())
                                                else:
                                                    if ("." in json_file['select'][val]['value'][val1][i][elem1]):
                                                        selects.append(
                                                            json_file['select'][val]['value'][val1][i][elem1].split(
                                                                ".")[1].lower())
                                                    else:
                                                        selects.append(
                                                            json_file['select'][val]['value'][val1][i][elem1].lower())
                    if ("." in json_file['select'][val]['value']):
                        selects.append(json_file['select'][val]['value'].split(".")[1].lower())
                    else:
                        if (not isinstance(json_file['select'][val]['value'], dict)):
                            selects.append(json_file['select'][val]['value'].lower())
    return set(selects)


# Returns a single ProjectionAttribute
def singleSelect(json_file):
    selects = []
    if (not (f.isString(json_file)) and (f.isSelect(json_file))):
        if (isinstance(json_file['select'], str)):
            if ("." in json_file['select']):
                selects.apend(json_file['select'].split(".")[1].lower())
            else:
                selects.append(json_file['select'].lower())
        for val in json_file["from"]:
            if (val == "value"):
                if (selectUnion(json_file["from"]["value"]) != []):
                    selects.extend(selectUnion(json_file["from"]["value"]))
                if (listOfSelect(json_file["from"]["value"]) != []):
                    selects.extend(listOfSelect(json_file["from"]["value"]))
                if (selectWhere(json_file["from"]["value"]) != []):
                    selects.append(selectWhere(json_file["from"]["value"]))
    [x.lower() for x in selects]
    return set(selects)


# Returns a single ProjectionAttribute if it's a dictionary
def singleSelectDict(json_file):
    selects = []
    if (not (f.isString(json_file)) and (f.isSelect(json_file))):
        if (isinstance(json_file['select'], dict)):
            if ("value" in json_file['select']):
                if (isinstance(json_file['select']['value'], str)):
                    if ("." in json_file['select']["value"]):
                        selects.append(json_file['select']["value"].split(".")[1].lower())
                    else:
                        selects.append(json_file['select']["value"].lower())
                elif (isinstance(json_file['select']['value'], dict)):
                    for val in json_file['select']['value']:
                        if (val in selectCommands):
                            if (isinstance(json_file['select']['value'][val], dict)):
                                if ("value" in json_file['select']['value'][val]):
                                    if ("." in json_file['select']['value'][val]["value"]):
                                        selects.append(json_file['select']['value'][val]["value"].split(".")[1].lower())
                                    else:
                                        selects.append(json_file['select']['value'][val]["value"])
                                for elem in json_file['select']['value'][val]:
                                    if ((elem in selectCommands) and (
                                            isinstance(json_file['select']['value'][val][elem], dict))):
                                        for elem1 in json_file['select']['value'][val][elem]:
                                            if (elem1 in selectCommands and isinstance(
                                                    json_file['select']['value'][val][elem][elem1], str)):
                                                if ("." in json_file['select']['value'][val][elem][elem1]):
                                                    selects.append(
                                                        json_file['select']['value'][val][elem][elem1].split(".")[
                                                            1].lower())
                                                else:
                                                    selects.append(
                                                        json_file['select']['value'][val][elem][elem1].lower())
                            if (isinstance(json_file['select']['value'][val], str)):
                                if ("." in json_file['select']["value"][val]):
                                    selects.append(json_file['select']["value"][val].split(".")[1].lower())
                                else:
                                    selects.append(json_file['select']["value"][val].lower())
                            if (isinstance(json_file['select']['value'][val], list)):
                                for i in range(len(json_file['select']['value'][val])):
                                    if ('value' in json_file['select']['value'][val][i]):
                                        if (isinstance(json_file['select']['value'][val][i]['value'], str)):
                                            if ("." in json_file['select']["value"][val][i]['value']):
                                                selects.append(
                                                    json_file['select']["value"][val][i]['value'].split(".")[1].lower())
                                            else:
                                                selects.append(json_file['select']["value"][val][i]['value'].lower())
    [x.lower() for x in selects]
    return set(selects)


# Returns ProjectionAttributes as a List if it is a union
def selectUnion(json_file):
    listTables = []
    if (not (f.isString(json_file))):
        for val in json_file:
            if (val == "union"):
                for val1 in range(len(json_file["union"])):
                    if ((listOfSelect(json_file["union"][val1]) != [])):
                        for elem in listOfSelect(json_file[val][val1]):
                            if (not isinstance(elem, dict)):
                                listTables.append(elem.lower())
                    if (((selectWhere(json_file["union"][val1]) != []))):
                        if (len(selectWhere(json_file["union"][val1])) == 1):
                            listTables.append(selectWhere(json_file["union"][val1])[0].lower())
                        else:
                            for elem in selectWhere(json_file["union"][val1]):
                                listTables.append(elem.lower())
    return set(listTables)


# returns ProjectionAttributes for a statement and uses herefor different arts of sql-statements
def extractProAttributes(json_file):
    attributes = []
    json_file = parse_query(json_file)
    try:
        if ((singleSelectDict(json_file) is not None) and (singleSelectDict(json_file) != [])):
            attributes.extend(singleSelectDict(json_file))
        if ((singleSelect(json_file) is not None) and (singleSelect(json_file) != [])):
            attributes.extend(singleSelect(json_file))
        if ((selectUnion(json_file) is not None) and (selectUnion(json_file) != [])):
            attributes.extend(selectUnion(json_file))
        if ((listOfSelect(json_file) is not None) and (listOfSelect(json_file) != [])):
            attributes.extend(listOfSelect(json_file))
    except Exception as e:
        attributes = ["Unknown"]
    return list(attributes)
