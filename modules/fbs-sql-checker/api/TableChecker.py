#TableChecker.py

import Formatting as f
from Parser import *

# Return a single From and a where-clause
def isSingleFromWhere(json_file):
    listTables = []
    if (not (f.isString(json_file)) and (f.isFrom(json_file))):
        if (isinstance(json_file['from'], str)):
            if (json_file['from'].count(json_file['from']) == 1):
                listTables.append(json_file['from'].lower())
        if (isinstance(json_file['from'], dict)):
            if ("value" in json_file["from"]):
                if (isinstance(json_file["from"]["value"], str)):
                    listTables.append(json_file['from']['value'].lower())
    for val in json_file:
        if (val == "where"):
            if (isinstance(json_file[val], list)):
                for val1 in json_file[val]:
                    if (val1 == "in"):
                        for i in range(len(json_file[val][val1])):
                            listTables.extend(isSingleFromWhere(json_file[val][val1][i]))
            elif (isinstance(json_file[val], dict)):
                for val1 in json_file["where"]:
                    for val2 in json_file["where"][val1]:
                        if (val2 == "exists"):
                            if (isinstance(json_file["where"][val1][val2], dict)):
                                if ((isSingleFromWhere(json_file["where"][val1][val2]) != []) and (
                                        isSingleFromWhere(json_file["where"][val1][val2]) not in listTables)):
                                    listTables.extend(isSingleFromWhere(json_file["where"][val1][val2]))
                    if (isinstance(json_file["where"][val1], list)):
                        if (len(json_file["where"][val1]) > 1):
                            if (isinstance(json_file["where"][val1][1], dict)):
                                if ((isSingleFromWhere(val2) != []) and (isSingleFromWhere(val2) != None)):
                                    for elem in isSingleFromWhere(val2):
                                        if (elem not in listTables):
                                            listTables.append(elem)
                                elif ((isJoin(val2) != []) and (isJoin(val2) not in listTables) and (
                                        isJoin(val2) != None)):
                                    listTables.append(isJoin(val2))
    if ((isJoin(json_file) != []) and (isJoin(json_file) not in listTables) and (isJoin(json_file) != None)):
        for elem in isJoin(json_file):
            if (elem not in listTables):
                listTables.append(elem)
    return (listTables)


# Return Tables as a List if there is a join --> works for a python List too
def isJoin(json_file):
    listTables = []
    listJoins = []
    returnList = []
    isJoinVar = False
    joinType = ""
    if not (f.isString(json_file)) and (f.isFrom(json_file)):
        for val in json_file['from']:
            if (isinstance(val, str)) and ((val != "value") and (val != "name")) and (len(val) > 1):
                listTables.append(val.lower())
            if isinstance(val, dict):
                for element in val:
                    if element == "value":
                        listTables.append(val[element].lower())
                    if isinstance(val[element], str) and ((element != "name") and (element != "using")):
                        listTables.append(val[element].lower())
                    if isJoinVar==True:
                        for val1 in val[element]:
                            insert = []
                            insert.append(joinType)
                            for val in val[element][val1]:
                                insert.append(val)
                            listJoins.append(insert)
                        isJoinVar = False
                    if element == "inner join" or element == "left join" or element == "join":
                        isJoinVar = True
                        joinType = element
                        for val1 in val[element]:
                            if (val1 == "value"):
                                listTables.append(val[element][val1].lower())
            if val == "value":
                if isinstance(json_file['from']['value'], dict):
                    if ((isSingleFromWhere(json_file['from']['value']) not in listTables) and (
                            isSingleFromWhere(json_file['from']['value']) != None) and (
                            isSingleFromWhere(json_file['from']['value']) != [])):
                        listTables.extend(isSingleFromWhere(json_file['from']['value']))
                for elem in json_file['from']["value"]:
                    if ((isUnion(json_file['from']["value"]) != None) and (
                            isUnion(json_file["from"]["value"]) != []) and (
                            isUnion(json_file["from"]["value"]) not in listTables)):
                        listTables.extend(isUnion(json_file['from']["value"]))
                    if ((isJoin(json_file['from']["value"]) != None) and (
                            isJoin(json_file["from"]["value"]) != []) and (
                            isJoin(json_file["from"]["value"]) not in listTables)):
                        listTables.extend(isJoin(json_file['from']["value"]))
        returnList.append(sorted(list(set(listTables))))
        returnList.append(listJoins)
        return returnList


# Returns tables as a List if it is a union
def isUnion(json_file):
    listTables = []
    if not (f.isString(json_file)):
        for val in json_file:
            if val == "union":
                for i in range(len(json_file[val])):
                    if ((isSingleFromWhere(json_file[val][i])) is not None):
                        listTables.extend(isSingleFromWhere(json_file[val][i]))
                    else:
                        listTables.append(isJoin(json_file[val][i]))
                return sorted(set(listTables))
            else:
                return None


# return tables for a statement and uses therefor different arts of sql-statements
def extractTables(json_file):
    tables = []
    json_file = parse_query(json_file)
    try:
        if isSingleFromWhere(json_file) is not None and isSingleFromWhere(json_file) is not []:
            tables = isSingleFromWhere(json_file)
        elif isJoin(json_file) is not None and isJoin(json_file) is not []:
            tables = isJoin(json_file)
        else:
            tables = isUnion(json_file)
    except Exception as e:
        tables = ["Unknown"]
    if type(tables[0]) == str:
        tables[0] = [tables[0]]
    if len(tables[1]) == 0:
        tables[1].append("Empty")
    return tables
