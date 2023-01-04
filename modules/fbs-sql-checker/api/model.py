# This file declares the formats of JSON Files which are produced by the SQL Checker

# Check if it is a new solution; check if tables, attributes etc. are right
def prod_solution_json(elem, my_uuid, task_nr):
    value = {"id": str(my_uuid), "taskNumber": task_nr, "statement": elem["submission"]}
    return value


# Create a json to insert to DB "Tables"
def json_table(_id, table):
    # Create dictionary
    value = {"id": str(_id), "table": table}
    return value


# Create a json to insert to DB "ProAttributes"
def json_pro_attribute(_id, pro_attribute):
    # Create dictionary
    value = {"id": str(_id), "proAttribute": pro_attribute}
    return value


# Create a json to insert to DB "SelAttributes"
def json_sel_attribute(_id, sel_attribute):
    # Create dictionary
    value = {"id": str(_id), "selAttribute": sel_attribute}
    return value


# Create a json to insert to DB "Strings"
def json_string(_id, string):
    # Create dictionary
    value = {"id": str(_id), "string": string}
    return value


def json_order_by_attribute(_id, order_by_attribute):
    value = {
        "id": str(_id),
        "orderBy": order_by_attribute[0],
        "sort": order_by_attribute[1],
    }
    return value


def json_group_by_attribute(_id, group_by_attribute):
    value = {"id": str(_id), "groupBy": group_by_attribute}
    return value


def json_join_attribute(_id, join_attribute):
    value = {
        "id": str(_id),
        "type": join_attribute[0],
        "attr1": join_attribute[1],
        "attr2": join_attribute[2],
    }
    return value


def json_not_parsable(_id, submission):
    value = {
        "id": str(_id),
        "submission": submission,
    }
    return value


def json_having_attribute(_id, having_attribute):
    value = {"id": str(_id), "havingAttribute": having_attribute}
    return value
