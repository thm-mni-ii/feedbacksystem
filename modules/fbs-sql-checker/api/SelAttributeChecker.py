#SelAttributeChecker.py

import ProAttributeChecker as AC
from Parser import *

selectCommands = ["sum", "count", "round", "distinct", "sec_to_time", "avg", "max", "min", "time_to_sec", "like",
                  "between", "div", "year", "mul"]
equals = ["eq", "neq", "gte", "gt", "lt", "lte"]

literal = []

# Returns SelectionAttributes as a list if there is a where
def selectWhere(json_file):
    listTables = []
    if ("where" in json_file):
        isWhere = True
        for val1 in json_file["where"]:
            if (isinstance(json_file["where"][val1], str)):
                if ("." in json_file["where"][val1]):
                    listTables.append(json_file["where"][val1].split(".")[1].lower())
                else:
                    listTables.append(json_file["where"][val1].lower())
            if (isinstance(json_file["where"][val1], dict)):
                for val2 in json_file["where"][val1]:
                    if (isinstance(val2, str)):
                        if ((AC.singleSelectDict(val2) != [])):
                            listTables.extend(AC.singleSelectDict(val2))
                        elif ("." in val2):
                            listTables.append(val2.split(".")[1].lower())
                        else:
                            listTables.append(val2.lower())
            for i in range(len(json_file["where"][val1])):
                if (isinstance(json_file["where"][val1][i], dict)):
                    for val3 in json_file["where"][val1][i]:
                        if (val3 in selectCommands):
                            for val4 in json_file["where"][val1][i][val3]:
                                if (isinstance(val4, str)):
                                    if ("." in val4):
                                        listTables.append(val4.split(".")[1].lower())
                                    else:
                                        listTables.append(val4.lower())
            if (isinstance(json_file["where"][val1], list) and (len(json_file["where"][val1]) > 1)):
                if (isinstance(json_file["where"][val1][1], dict)):
                    if (AC.singleSelectDict(json_file["where"][val1][1]) != []):
                        listTables.extend(AC.singleSelectDict(json_file["where"][val1][1]))
                    if ("literal" in json_file["where"][val1][1]):
                        literal.append(json_file["where"][val1][1]["literal"])
                for elem in json_file["where"][val1]:
                    if (isinstance(elem, str)):
                        if ("." in elem):
                            listTables.append(elem.split(".")[1].lower())
                        else:
                            listTables.append(elem.lower())
            for i in range(len(json_file["where"][val1])):
                if (not isinstance(json_file["where"][val1][i], int)):
                    for elem in json_file["where"][val1][i]:
                        if (elem in equals):
                            if (isinstance(json_file["where"][val1][i][elem], list)):
                                for j in range(len(json_file["where"][val1][i][elem])):
                                    if (isinstance(json_file["where"][val1][i][elem][j], str)):
                                        if ("." in json_file["where"][val1][i][elem][j]):
                                            listTables.append(
                                                json_file["where"][val1][i][elem][j].split(".")[1])
                                        else:
                                            listTables.append(json_file["where"][val1][i][elem][j])
                                    if (isinstance(json_file["where"][val1][i][elem][j], dict)):
                                        for elem1 in json_file["where"][val1][i][elem][j]:
                                            if (elem1 in selectCommands):
                                                if (isinstance(json_file["where"][val1][i][elem][j][elem1], str)):
                                                    if ("." in json_file["where"][val1][i][elem][j][elem1]):
                                                        listTables.append(
                                                            json_file["where"][val1][i][elem][j][elem1].split(".")[
                                                                1])
                                                    else:
                                                        listTables.append(
                                                            json_file["where"][val1][i][elem][j][elem1])
                                            if (elem1 == "literal"):
                                                literal.append(json_file["where"][val1][i][elem][j][elem1])
                                        listTables.extend(AC.singleSelectDict(json_file["where"][val1][i][elem][j]))
                        if (elem == "where"):
                            listTables.extend(selectWhere(json_file["where"][val1][i]))
    return set(listTables)


# returns SelectionAttributes for a statement and uses herefor different arts of sql-statements
def extractSelAttributes(json_file, client):
    whereAttributes = []
    json_file = parse_query(json_file, client)
    try:
        if ((selectWhere(json_file) is not None) and (selectWhere(json_file) != [])):
            whereAttributes.extend([selectWhere(json_file)])
    except Exception as e:
        # print(e)
        whereAttributes = [["Unknown"]]
    if len(whereAttributes) > 0:
        return list(whereAttributes[0])
    else:
        return list(whereAttributes)


def extractOrderBy(json_file, client):
    json_file = parse_query(json_file, client)
    groupBy = []
    groupByList = list(iterate(json_file, 'orderby'))
    for s in groupByList:
        if isinstance(s, list):
            for dicts in s:
                value = []
                value.append(dicts["value"])
                try:
                    value.append(dicts['sort'])
                except Exception as e:
                    value.append('asc')
                groupBy.append(value)

        if isinstance(s,dict):
            value = []
            value.append(s['value'])
            try:
                value.append(s['sort'])
            except Exception as e:
                value.append('asc')
            groupBy.append(value)
    if len(groupBy) == 0:
        groupBy = "Unknown"
    return groupBy


def extractGroupBy(json_file, client):
    json_file = parse_query(json_file, client)
    groupBy = []
    groupByList = list(iterate(json_file, 'groupby'))
    for s in groupByList:
        groupBy.append(s['value'])
    if len(groupBy) == 0:
        groupBy = "Unknown"
    return groupBy

def iterate(data, param):
    if isinstance(data, list):
        for item in data:
            yield from iterate(item, param)
    elif isinstance(data, dict):
        for key, item in data.items():
            if key == param:
                yield item
            else:
                yield from iterate(item, param)

