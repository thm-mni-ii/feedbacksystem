# This file declares the formats of JSON Files which are produced by the SQL Checker

#Check if it is a new solution; check if tables, attributes etc. are right
def prodSolutionJson(elem, my_uuid, taskNr):
    value = {
        "id": str(my_uuid),
        "taskNumber": taskNr,
        "statement": elem['submission']
    }
    return value

#Create a json to insert to DB "Tables"
def jsonTable(id, table):
    # Create dictionary
    value = {
        "id": str(id),
        "table": table
    }
    return value

#Create a json to insert to DB "ProAttributes"
def jsonProAttribute(id, proAttribute):
    # Create dictionary
    value = {
        "id": str(id),
        "proAttribute": proAttribute
    }
    return value


#Create a json to insert to DB "SelAttributes"
def jsonSelAttribute(id, selAttribute):
    # Create dictionary
    value = {
        "id": str(id),
        "selAttribute": selAttribute
    }
    return value


#Create a json to insert to DB "Strings"
def jsonString(id, string):
    # Create dictionary
    value = {
        "id": str(id),
        "string": string
    }
    return value

def jsonOrderByAttribute(id, orderByAttribute):
    value = {
        "id": str(id),
        "orderBy": orderByAttribute[0],
        "sort": orderByAttribute[1]
    }
    return value


def jsonGroupByAttribute(id, groupByAttribute):
    value = {
        "id": str(id),
        "groupBy": groupByAttribute
    }
    return value

def jsonJoinAttribute(id, joinAttribute):
    value = {
        "id": str(id),
        "type": joinAttribute[0],
        "attr1": joinAttribute[1],
        "attr2": joinAttribute[2]
    }
    return value

def jsonNotParsable(id, submission):
    value = {
        "id": str(id),
        "submission": submission,
    }
    return value