# JSONCreator.py

from TableChecker import *
from ProAttributeChecker import *
import SelAttributeChecker as AWC
from Parser import *
from pymongo import MongoClient

rightStatements = []
rightTables = []
rightAtts = []
rightStrings = []
rightWhereAtts = []
global userData
userData = []
tables, selAttributes, proAttributes, strings = [], [], [], []


# Parse a single SQL-Statement and upload it to DB
def parseSingleStatUploadDB(data, client):
    # create DB-connection
    client = MongoClient(client, 27107)
    mydb = client["sql-checker"]
    mycollection = mydb["Queries"]
    (
        tables2,
        proAtts2,
        selAtts2,
        strings2,
        taskNr,
        my_uuid,
        orderBy2,
        groupBy2,
        joins2,
    ) = ([], [], [], [], [], [], [], [], [])
    if "submission" in data:
        # Extract tables, selAttributes, proAttributes and strings
        if extractTables(data["submission"], client) != "Unknown":
            tableList = extractTables(data["submission"], client)
            tables2.extend(tableList[0])
            if tableList[1] != ["Empty"]:
                try:
                    tableList.pop(0)
                    for x in tableList:
                        for y in x:
                            joins2.append(y)
                except Exception as e:
                    joins2.append("Unknown")
            else:
                joins2.append("Empty")
        if extractProAttributes(data["submission"], client) != "Unknown":
            proAtts2.extend(extractProAttributes(data["submission"], client))
        if AWC.extractSelAttributes(data["submission"], client) != "Unknown":
            selAtts2.extend(AWC.extractSelAttributes(data["submission"], client))
        if extractOrderBy(data["submission"], client) != "Unknown":
            orderBy2.extend(extractOrderBy(data["submission"], client))
        if extractGroupBy(data["submission"], client) != "Unknown":
            groupBy2.extend(extractGroupBy(data["submission"], client))
        strings2.extend(list(set(AWC.literal)))
        # If TaskID or Submission ID not in data, return
        if "tid" not in data or "sid" not in data:
            print("Task ID or Unique ID not in data")
            return
        taskNr = data["tid"]
        my_uuid = data["sid"]
        # Save tables, selAttributes, proAttributes and strings to DB
        if parse_query(data["submission"], client) is not False:
            insertTables(mydb, data, my_uuid, client)
    # Check if it is a new solution and charachteristics are right
    (
        tables2,
        proAtts2,
        selAtts2,
        strings2,
        orderBy2,
        groupBy2,
        joins2,
    ) = checkSolutionChars(
        data,
        taskNr,
        my_uuid,
        tables2,
        proAtts2,
        selAtts2,
        strings2,
        orderBy2,
        groupBy2,
        joins2,
        client,
    )
    # produce a JSON
    record = returnJson(
        data,
        my_uuid,
        taskNr,
        tables2,
        proAtts2,
        selAtts2,
        strings2,
        orderBy2,
        groupBy2,
        joins2,
        client,
    )
    # save JSON to DB
    mycollection.insert_one(record)


# Check if it is a new solution; check if tables, attributes etc. are right
def checkSolutionChars(
    data,
    taskNr,
    my_uuid,
    tables2,
    proAtts2,
    selAtts2,
    strings2,
    orderBy2,
    groupBy2,
    joins2,
    client,
):
    newSolution = True
    (
        tablesRight,
        selAttributesRight,
        proAttributesRight,
        stringsRight,
        orderByRight,
        groupByRight,
        joinsRight,
    ) = (False, False, False, False, False, False, False)
    mydb = client["sql-checker"]
    mycol = mydb["Solutions"]
    # For every solution for given task
    for x in mycol.find({"taskNumber": taskNr}):
        # Extract Tables, Attributes etc. (cut out for better overview)
        id = x["id"]
        tables, proAttributes, selAttributes, strings, orderBy, groupBy, joins = (
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        )
        mycol = mydb["Tables"]
        for y in mycol.find({"id": id}, {"table": 1}):
            tables.append(y["table"])
        mycol = mydb["ProAttributes"]
        for y in mycol.find({"id": id}, {"proAttribute": 1}):
            proAttributes.append(y["proAttribute"])
        mycol = mydb["SelAttributes"]
        for y in mycol.find({"id": id}, {"selAttribute": 1}):
            selAttributes.append(y["selAttribute"])
        mycol = mydb["Strings"]
        for y in mycol.find({"id": id}, {"string": 1}):
            strings.append(y["string"])
        mycol = mydb["OrderBy"]
        for y in mycol.find({"id": id}, {"orderBy": 1, "sort": 1}):
            orderByValue = []
            orderByValue.append(y["orderBy"])
            if (
                "sort" in y
            ):  # if there is no order in sort the default "asc" will be used
                orderByValue.append(y["sort"])
            else:
                orderByValue.append("asc")
            orderBy.append(orderByValue)
        mycol = mydb["GroupBy"]
        for y in mycol.find({"id": id}, {"groupBy": 1}):
            groupBy.append(y["groupBy"])
        mycol = mydb["Joins"]
        for y in mycol.find({"id": id}, {"type": 1, "attr1": 1, "attr2": 1}):
            joinValue = []
            joinValue.append(y["type"])
            if (
                "attr1" and "attr2" in y
            ):  # if there is no order in sort the default "asc" will be used
                joinValue.append(y["attr1"])
                joinValue.append(y["attr2"])
            else:
                joinValue.append("Empty")
            joins.append(joinValue)
        if len(joins) == 0:
            joins.append("Empty")
        if data["passed"]:
            # Compare them to tabels, proAttributes etc of a given sql-query
            if (
                tables == tables2
                and set(proAttributes) == set(proAtts2)
                and set(selAttributes) == set(selAtts2)
                and set(strings) == set(strings2)
                and orderBy == orderBy2
                and joins == joins2
            ):
                # If they alle are same, it is not a new solution
                newSolution = False
        else:
            # Check for tables, proAttributes etc. if they are right
            if tables == tables2:
                tablesRight = True
            if set(proAttributes) == set(proAtts2):
                selAttributesRight = True
            if set(selAttributes) == set(selAtts2):
                proAttributesRight = True
            if set(strings) == set(strings2):
                stringsRight = True
            if orderBy == orderBy2:
                orderByRight = True
            if groupBy == groupBy2:
                groupByRight = True
            if joins == joins2:
                joinsRight = True
    if data["passed"]:
        if newSolution == True:
            # Upload as a new Solution to DB
            parseSingleStatUploadSolution(data, taskNr, my_uuid, client)
        return (True, True, True, True, True, True, True)
    # return if characteristics are True or False
    return (
        tablesRight,
        selAttributesRight,
        proAttributesRight,
        stringsRight,
        orderByRight,
        groupByRight,
        joinsRight,
    )


# Check if it is a new solution; check if tables, attributes etc. are right


def prodSolutionJson(elem, my_uuid, taskNr):
    value = {"id": str(my_uuid), "taskNumber": taskNr, "statement": elem["submission"]}
    return value


# Parse a solution and upload it to DB
def parseSingleStatUploadSolution(data, taskNr, my_uuid, client):
    mydb = client["sql-checker"]
    mycollection = mydb["Solutions"]
    record = prodSolutionJson(data, my_uuid, taskNr)
    mycollection.insert_one(record)


# return JSON to be pasted to DB
def returnJson(
    elem,
    my_uuid,
    taskNr,
    tablesRight,
    proAttributesRight,
    selAttributesRight,
    stringsRight,
    orderByRight,
    groupByRight,
    joinsRight,
    client,
):
    # Extract informations from a sql-query-json
    if "passed" in elem:
        userData.append(elem["passed"])
    if "userId" in elem:
        userData.append(elem["userId"])
    if "attempt" in elem:
        userData.append(elem["attempt"])
    if "submission" in elem:
        if parse_query(elem["submission"], client) is not False:
            # produce a json to be pasted to DB
            record = prodJson(
                my_uuid,
                elem["submission"],
                taskNr,
                False,
                tablesRight,
                proAttributesRight,
                selAttributesRight,
                stringsRight,
                orderByRight,
                groupByRight,
                joinsRight,
            )
        else:
            # produce a json if the sql-query is not parsable
            record = prodJsonNotParsable(my_uuid, elem["submission"], taskNr)
    return record


# Returns a json file which extracts characteristics
# and tells which of them are wrong
def prodJson(
    id,
    testSql,
    taskNr,
    isSol,
    tablesRight,
    selAttributesRight,
    proAttributesRight,
    stringsRight,
    orderByRight,
    groupByRight,
    joinsRight,
):
    # save data if it is a manual solution
    if isSol == True:
        userData.extend([True])
        userData.extend([0])
        userData.extend([0])
    value = {
        "id": str(id),
        "taskNumber": taskNr,
        "statement": testSql,
        "queryRight": userData[0],
        "parsable": True,
        "isSolution": isSol,
        "tablesRight": tablesRight,
        "selAttributesRight": selAttributesRight,
        "proAttributesRight": proAttributesRight,
        "stringsRight": stringsRight,
        "userId": userData[1],
        "attempt": userData[2],
        "orderByRight": orderByRight,
        "groupByRight": groupByRight,
        "joinsRight": joinsRight,
    }
    userData.clear()
    AWC.literal = []
    return value


# Returns a json file which extracts Tables and Attributes
def prodJsonNotParsable(id, testSql, taskNr, orderByRight):
    # Create dictionary
    value = {
        "id": str(id),
        "taskNumber": taskNr,
        "statement": testSql,
        "queryRight": userData[0],
        "parsable": False,
        "tablesRight": None,
        "selAttributesRight": None,
        "proAttributesRight": None,
        "stringsRight": None,
        "userId": userData[1],
        "attempt": userData[2],
        "orderbyRight": orderByRight,
    }
    return value


# Insert data of Tables, proAttributes, selAttributes and Strings to Database
def insertTables(mydb, elem, my_uuid, client):
    tableList = extractTables(elem["submission"], client)
    joins = []
    tables.extend(tableList[0])
    if tableList[1] != ["Empty"]:
        try:
            tableList.pop(0)
            for x in tableList:
                for y in x:
                    joins.append(y)
        except Exception as e:
            joins.append("Unknown")
    else:
        joins.append("Empty")
    if len(tables) == 1:
        mycollection = mydb["Tables"]
        record = jsonTable(my_uuid, tables[0])
        mycollection.insert_one(record)
        if joins[0] != "Empty":
            try:
                mycollection = mydb["Joins"]
                record = jsonJoinAttribute(my_uuid, joins)
                mycollection.insert_one(record)
            except Exception as e:
                print("Error while reading joins.")
    elif len(tables) > 1 and not isinstance(
        extractTables(elem["submission"], client), str
    ):
        mycollection = mydb["Tables"]
        for val in tables:
            record = jsonTable(my_uuid, val)
            mycollection.insert_one(record)
        if joins[0] != "Empty":
            try:
                mycollection = mydb["Joins"]
                for y in joins:
                    record = jsonJoinAttribute(my_uuid, y)
                    mycollection.insert_one(record)
            except Exception as e:
                print("Error while reading joins.")
    if len(extractProAttributes(elem['submission'], client)) == 1:
        mycollection = mydb['ProAttributes']
        record = jsonProAttribute(my_uuid, extractProAttributes(elem['submission'], client)[0])
        mycollection.insert_one(record)
    elif len(extractProAttributes(elem["submission"], client)) > 1 and not isinstance(
        extractProAttributes(elem["submission"], client), str
    ):
        mycollection = mydb["ProAttributes"]
        for val in extractProAttributes(elem["submission"], client):
            record = jsonProAttribute(my_uuid, val)
            mycollection.insert_one(record)
    if len(AWC.extractSelAttributes(elem["submission"], client)) == 1:
        mycollection = mydb["SelAttributes"]
        record = jsonSelAttribute(
            my_uuid, AWC.extractSelAttributes(elem["submission"], client)[0]
        )
        mycollection.insert_one(record)
    elif len(
        AWC.extractSelAttributes(elem["submission"], client)
    ) > 1 and not isinstance(AWC.extractSelAttributes(elem["submission"], client), str):
        mycollection = mydb["SelAttributes"]
        for val in AWC.extractSelAttributes(elem["submission"], client):
            record = jsonSelAttribute(my_uuid, val)
            mycollection.insert_one(record)
    if len(list(set(AWC.literal))) == 1:
        mycollection = mydb["Strings"]
        record = jsonString(my_uuid, list(set(AWC.literal))[0])
        mycollection.insert_one(record)
    elif len(list(set(AWC.literal))) > 1 and not isinstance(
        list(set(AWC.literal)), str
    ):
        mycollection = mydb["Strings"]
        for val in list(set(AWC.literal)):
            record = jsonString(my_uuid, val)
            mycollection.insert_one(record)
    if len(AWC.extractOrderBy(elem["submission"], client)) == 1:
        mycollection = mydb["OrderBy"]
        record = jsonOrderByAttribute(
            my_uuid, AWC.extractOrderBy(elem["submission"], client)[0]
        )
        mycollection.insert_one(record)
    elif len(AWC.extractOrderBy(elem["submission"], client)) > 1 and not isinstance(
        AWC.extractOrderBy(elem["submission"], client), str
    ):
        mycollection = mydb["OrderBy"]
        for val in AWC.extractOrderBy(elem["submission"], client):
            record = jsonOrderByAttribute(my_uuid, val)
            mycollection.insert_one(record)
    if len(AWC.extractGroupBy(elem["submission"], client)) == 1:
        mycollection = mydb["GroupBy"]
        record = jsonGroupByAttribute(
            my_uuid, AWC.extractGroupBy(elem["submission"], client)[0]
        )
        mycollection.insert_one(record)
    elif len(AWC.extractGroupBy(elem["submission"], client)) > 1 and not isinstance(
        AWC.extractGroupBy(elem["submission"], client), str
    ):
        mycollection = mydb["GroupBy"]
        for val in AWC.extractGroupBy(elem["submission"]):
            record = jsonGroupByAttribute(my_uuid, val)
            mycollection.insert_one(record)
    AWC.literal = []
    userData.clear()


# Create a json to insert to DB "Tables"
def jsonTable(id, table):
    # Create dictionary
    value = {"id": str(id), "table": table}
    return value


# Create a json to insert to DB "ProAttributes"
def jsonProAttribute(id, proAttribute):
    # Create dictionary
    value = {"id": str(id), "proAttribute": proAttribute}
    return value


# Create a json to insert to DB "SelAttributes"
def jsonSelAttribute(id, selAttribute):
    # Create dictionary
    value = {"id": str(id), "selAttribute": selAttribute}
    return value


# Create a json to insert to DB "Strings"
def jsonString(id, string):
    # Create dictionary
    value = {"id": str(id), "string": string}
    return value


def jsonOrderByAttribute(id, orderByAttribute):
    value = {"id": str(id), "orderBy": orderByAttribute[0], "sort": orderByAttribute[1]}
    return value


def jsonGroupByAttribute(id, groupByAttribute):
    value = {"id": str(id), "groupBy": groupByAttribute}
    return value


def jsonJoinAttribute(id, joinAttribute):
    value = {
        "id": str(id),
        "type": joinAttribute[0],
        "attr1": joinAttribute[1],
        "attr2": joinAttribute[2],
    }
    return value
