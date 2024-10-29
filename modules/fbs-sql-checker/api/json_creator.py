# JSONCreator.py

from parser import parse_query
from datetime import datetime
from table_checker import extract_tables
from pro_attribute_checker import extract_pro_attributes
import sel_attribute_checker as AWC
from pymongo import MongoClient  # pylint: disable=E0401
from model import *  # pylint: disable=W0401
from mask_aliases import SQLAliasMasker
import distance.distance_calc as d


rightStatements = []
rightTables = []
rightAtts = []
rightStrings = []
rightWhereAtts = []
user_data = []
tables, selAttributes, proAttributes, strings = [], [], [], []


# Parse a single SQL-Statement and upload it to DB
def parse_single_stat_upload_db(data, client):
    # create DB-connection
    client = MongoClient(client, 27107)
    mydb = client.get_default_database()
    mycollection = mydb["Queries"]
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    (
        tables2,
        pro_atts2,
        sel_atts2,
        strings2,
        task_nr,
        is_sol,
        my_uuid,                #submission primary key
        course_id,
        order_by2,
        group_by2,
        having2,
        joins2,
        wildcards2,
    ) = ([], [], [], [], [], [], [], [], [], [], [], [], [])
    try:
        if "submission" in data:
            query = data["submission"]
            masker = SQLAliasMasker(query)
            masker.mask_aliases_()
            data["submission"] = masker.get_masked_query()
            # Extract tables, selAttributes, proAttributes and strings
            if extract_tables(data["submission"], client) != "Unknown":
                table_list = extract_tables(data["submission"], client)
                tables2.extend(table_list[0])
                if table_list[1] != ["Empty"]:
                    try:
                        table_list.pop(0)
                        for x in table_list:
                            for y in x:
                                joins2.append(y)
                    except Exception:
                        joins2.append("Unknown")
                else:
                    joins2.append("Empty")
            extracted_pro_attributes = extract_pro_attributes(
                data["submission"], client
            )
            if extracted_pro_attributes != "Unknown":
                pro_atts2.extend(extracted_pro_attributes)
            extracted_string = AWC.extract_sel_attributes(data["submission"], client)
            if extracted_string != "Unknown":
                sel_atts2.extend(extracted_string)
            extracted_order_by = AWC.extract_order_by(data["submission"], client)
            if extracted_order_by != "Unknown":
                order_by2.extend(extracted_order_by)
            extracted_group_by = AWC.extract_group_by(data["submission"], client)
            if extracted_group_by != "Unknown":
                group_by2.extend(extracted_group_by)
            extracted_having = AWC.extract_having(data["submission"], client)
            if extracted_having != "Unknown":
                having2.extend(extracted_having)
            strings2.extend(list(set(AWC.literal)))
            # If TaskID or Submission ID not in data, return
            if "tid" not in data or "sid" not in data:
                print("Task ID or Unique ID not in data")
                return
            task_nr = data["tid"]
            my_uuid = data["sid"]
            course_id = data["cid"]
            is_sol = data["isSol"]
            # Save tables, selAttributes, proAttributes and strings to DB
            if parse_query(data["submission"], client) is not False:
                insert_tables(mydb, data, my_uuid, client)
        
        # check and remove duplicates
        flag_duplicates(client, task_nr)
        
        # Check if it is a new solution and characteristics are right
        (
            tables2,
            pro_atts2,
            sel_atts2,
            strings2,
            order_by2,
            group_by2,
            joins2,
            having2,
            wildcards2,
            #new
            closest_solution2,
            min_distance2,
            closestID2,

        ) = check_solution_chars(
            data,
            task_nr,
            my_uuid,
            tables2,
            pro_atts2,
            sel_atts2,
            strings2,
            order_by2,
            group_by2,
            joins2,
            having2,
            client,
        )

        # produce a JSON
        record = return_json(
            data,
            is_sol,
            my_uuid,
            task_nr,
            course_id,
            tables2,
            pro_atts2,
            sel_atts2,
            strings2,
            order_by2,
            group_by2,
            joins2,
            having2,
            wildcards2,
            client,
            time,
            closest_solution2,
            min_distance2,
            closestID2,

        )


        # save JSON to DB
        mycollection.insert_one(record)
    except Exception as e:
        print(e)
        task_nr = data["tid"]
        my_uuid = data["sid"]
        course_id = data["cid"]
        user_data = return_json_not_parsable(data)  # pylint: disable=W0621
        insert_not_parsable(my_uuid, user_data[3], client)
        record = prod_json_not_parsable(my_uuid, course_id, task_nr, time)
        mycollection.insert_one(record)


# Idea of a function to flag duplicate queries from the database
def flag_duplicates(client, task_nr):
    mydb = client.get_default_database()
    mycol = mydb["Solutions"]
    # set all queries to not duplicate
    mycol.update_many({"taskNumber": task_nr}, {"$set": {"duplicate": False}})
    queries = list(mycol.find({"taskNumber": task_nr}))
    
    # list to keep track of queries to flag
    duplicates = []

    # Compare each document with every other document
    n = len(queries)
    for i in range(n):
        for j in range(i + 1, n):  # Start from i + 1 to avoid comparing with itself and re-comparing
            query1 = queries[i]
            query2 = queries[j]
            
            if d.get_distance(query1["statement"], query2["statement"]) == 0:
                duplicates.append(query2["_id"])

    # Flag duplicates based on gathered IDs
    for id in set(duplicates):
        mycol.update_one({"_id": id}, {"$set": {"duplicate": True}}, upsert=True)



# Check if it is a new solution; check if tables, attributes etc. are right
def check_solution_chars(
    data,
    task_nr,
    my_uuid,
    tables2,
    pro_atts2,
    sel_atts2,
    strings2,
    order_by2,
    group_by2,
    joins2,
    having2,
    client,
):
    new_solution = True
    (
        tables_right,
        sel_attributes_right,
        pro_attributes_right,
        strings_right,
        order_by_right,
        group_by_right,
        joins_right,
        having_right,
        wildcards,
        #new
        closest_solution,
        min_distance,
        closestID,
    ) = (False, False, False, False, False, False, False, False, False,False,False,False)
    mydb = client.get_default_database()

    mycol = mydb["Solutions"]
    mysub = mydb["Queries"]

    min_distance = float('inf')  # Set to positive infinity
    closest_solution = None
    # For every solution for given task
    for x in mycol.find({"taskNumber": task_nr}):
        # Extract Tables, Attributes etc. (cut out for better overview)
        # compare the distance between the solution and the submission only if it is not a duplicate
        if not x.get("duplicate", False):

            distance = d.get_distance(x["statement"], data["submission"])

            # check for min distance and use the corresponding solution
            if distance < min_distance:
                min_distance = distance
                closest_solution = x["id"]  # choose the id of solution if it has the lowest distance

    # save the distance of the closest solution
    #mysub.update_one({"id": str(my_uuid)}, {"$set": {"distance":min_distance, "solutionID":closest_solution}},upsert=True)

    closestID = str(my_uuid)

    if closest_solution:
        (
            tables,  # pylint: disable=W0621
            pro_attributes,
            sel_attributes,
            strings,  # pylint: disable=W0621
            order_by,
            group_by,
            having,
            joins,
        ) = (  # pylint: disable=W0621
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        )
        id = closest_solution # use closest solution as reference
        mycol = mydb["Tables"]
        for y in mycol.find({"id": id}, {"table": 1}):
            tables.append(y["table"])
        mycol = mydb["ProAttributes"]
        for y in mycol.find({"id": id}, {"proAttribute": 1}):
            pro_attributes.append(y["proAttribute"])
        mycol = mydb["SelAttributes"]
        for y in mycol.find({"id": id}, {"selAttribute": 1}):
            sel_attributes.append(y["selAttribute"])
        mycol = mydb["Strings"]
        for y in mycol.find({"id": id}, {"string": 1}):
            strings.append(y["string"])
        mycol = mydb["OrderBy"]
        for y in mycol.find({"id": id}, {"orderBy": 1, "sort": 1}):
            order_by_value = [y["orderBy"]]
            if (
                "sort" in y
            ):  # if there is no order in sort the default "asc" will be used
                order_by_value.append(y["sort"])
            else:
                order_by_value.append("asc")
            order_by.append(order_by_value)
        mycol = mydb["GroupBy"]
        for y in mycol.find({"id": id}, {"groupBy": 1}):
            group_by.append(y["groupBy"])
        mycol = mydb["Joins"]
        for y in mycol.find({"id": id}, {"type": 1, "attr1": 1, "attr2": 1}):
            join_value = [y["type"]]
            if (
                "attr1" in y and "attr2" in y
            ):  # if there is no order in sort the default "asc" will be used
                join_value.append(y["attr1"])
                join_value.append(y["attr2"])
            else:
                join_value.append("Empty")
            joins.append(join_value)
        mycol = mydb["Having"]
        for y in mycol.find({"id": id}, {"havingAttribute": 1}):
            having_value = y["havingAttribute"]
            having.append(having_value)
        if len(joins) == 0:
            joins.append("Empty")
        if data["passed"]:
            if not data["isSol"]:
                tables_right = True
                sel_attributes_right = True
                pro_attributes_right = True
                strings_right = True
                wildcards = True
                order_by_right = True
                group_by_right = True
                joins_right = True
                having_right = True

            # Compare them to tables, proAttributes etc of a given sql-query
            if (
                tables == tables2  # pylint: disable=R0916
                and set(pro_attributes) == set(pro_atts2)
                and set(sel_attributes) == set(sel_atts2)
                and set(strings) == set(strings2)
                and order_by == order_by2
                and joins == joins2
                and having == having2
            ):
                # If they alle are same, it is not a new solution
                new_solution = False
        else:
            # Check for tables, proAttributes etc. if they are right
            if tables == tables2:
                tables_right = True
            if set(pro_attributes) == set(pro_atts2):
                sel_attributes_right = True
            if set(sel_attributes) == set(sel_atts2):
                pro_attributes_right = True
            if set(strings) == set(strings2):
                strings_right = True
            if (
                any("%" in s for s in strings)
                and not any("%" in s for s in strings2)
                or not any("%" in s for s in strings)
                and any("%" in s for s in strings2)
            ):
                wildcards = False
            else:
                wildcards = True
            if order_by == order_by2:
                order_by_right = True
            if group_by == group_by2:
                group_by_right = True
            if joins == joins2:
                joins_right = True
            if having == having2:
                having_right = True
    if data["isSol"]:
        if new_solution is True:
            # Upload as a new Solution to DB
            parse_single_stat_upload_solution(data, task_nr, my_uuid, client)
        return (True, True, True, True, True, True, True, True, True, closest_solution,min_distance,closestID)
    # return if characteristics are True or False
    return (
        tables_right,
        sel_attributes_right,
        pro_attributes_right,
        strings_right,
        order_by_right,
        group_by_right,
        joins_right,
        having_right,
        wildcards,
        #new
        closest_solution,
        min_distance,
        closestID,
    )


# Parse a solution and upload it to DB
def parse_single_stat_upload_solution(data, task_nr, my_uuid, client):
    mydb = client.get_default_database()
    mycollection = mydb["Solutions"]
    record = prod_solution_json(data, my_uuid, task_nr)
    mycollection.insert_one(record)


# return JSON to be pasted to DB
def return_json(  # pylint: disable=R1710
    elem,
    is_sol,
    my_uuid,
    task_nr,
    course_id,
    tables_right,
    pro_attributes_right,
    sel_attributes_right,
    strings_right,
    order_by_right,
    group_by_right,
    joins_right,
    having_right,
    wildcards,
    client,
    time,
    closest_solution,
    min_distance,
    closestID,

):
    # Extract informations from a sql-query-json
    if "passed" in elem:
        user_data.append(elem["passed"])
    if "userId" in elem:
        user_data.append(elem["userId"])
    if "attempt" in elem:
        user_data.append(elem["attempt"])
    if "submission" in elem:
        if parse_query(elem["submission"], client) is not False:
            # produce a json to be pasted to DB
            record = prod_json(
                my_uuid,
                course_id,
                elem["submission"],
                task_nr,
                is_sol,
                tables_right,
                sel_attributes_right,
                pro_attributes_right,
                strings_right,
                order_by_right,
                group_by_right,
                joins_right,
                having_right,
                wildcards,
                time,
                closest_solution,
                min_distance,
                closestID,

            )
            return record
        # produce a json if the sql-query is not parsable
        record = prod_json_not_parsable(my_uuid, course_id, task_nr, time)
        return record


# Returns a json file which extracts Tables and Attributes
def prod_json_not_parsable(_id, cid, task_nr, time):
    # Create dictionary
    value = {
        "id": str(_id),
        "cid": cid,
        "taskNumber": task_nr,
        "statement": user_data[3],
        "queryRight": user_data[0],
        "parsable": False,
        "tablesRight": None,
        "selAttributesRight": None,
        "proAttributesRight": None,
        "stringsRight": None,
        "userId": user_data[1],
        "attempt": user_data[2],
        "orderbyRight": None,
        "havingRight": None,
        "wildcards": None,
        "time": time,
    }
    return value


# Insert data of Tables, proAttributes, selAttributes and Strings to Database
def insert_tables(mydb, elem, my_uuid, client):
    table_list = extract_tables(elem["submission"], client)
    joins = []
    tables.extend(table_list[0])
    if table_list[1] != ["Empty"]:
        try:
            table_list.pop(0)
            for x in table_list:
                for y in x:
                    joins.append(y)
        except Exception:
            joins.append("Unknown")
    else:
        joins.append("Empty")
    if len(tables) == 1:
        mycollection = mydb["Tables"]
        record = json_table(my_uuid, tables[0])
        mycollection.insert_one(record)
        if joins[0] != "Empty":
            try:
                mycollection = mydb["Joins"]
                record = json_join_attribute(my_uuid, joins)
                mycollection.insert_one(record)
            except Exception:
                print("Error while reading joins.")
    elif len(tables) > 1 and not isinstance(
        extract_tables(elem["submission"], client), str
    ):
        mycollection = mydb["Tables"]
        for val in tables:
            record = json_table(my_uuid, val)
            mycollection.insert_one(record)
        if joins[0] != "Empty":
            try:
                mycollection = mydb["Joins"]
                for y in joins:
                    record = json_join_attribute(my_uuid, y)
                    mycollection.insert_one(record)
            except Exception:
                print("Error while reading joins.")
    pro_attributes = extract_pro_attributes(elem["submission"], client)
    if len(pro_attributes) == 1:
        mycollection = mydb["ProAttributes"]
        record = json_pro_attribute(my_uuid, pro_attributes[0])
        mycollection.insert_one(record)
    elif len(pro_attributes) > 1 and not isinstance(pro_attributes, str):
        mycollection = mydb["ProAttributes"]
        for val in pro_attributes:
            record = json_pro_attribute(my_uuid, val)
            mycollection.insert_one(record)
    sel_attributes = AWC.extract_sel_attributes(elem["submission"], client)
    if len(sel_attributes) == 1:
        mycollection = mydb["SelAttributes"]
        record = json_sel_attribute(my_uuid, sel_attributes[0])
        mycollection.insert_one(record)
    elif len(sel_attributes) > 1 and not isinstance(sel_attributes, str):
        mycollection = mydb["SelAttributes"]
        for val in sel_attributes:
            record = json_sel_attribute(my_uuid, val)
            mycollection.insert_one(record)
    if len(list(set(AWC.literal))) == 1:
        mycollection = mydb["Strings"]
        record = json_string(my_uuid, list(set(AWC.literal))[0])
        mycollection.insert_one(record)
    elif len(list(set(AWC.literal))) > 1 and not isinstance(
        list(set(AWC.literal)), str
    ):
        mycollection = mydb["Strings"]
        for val in list(set(AWC.literal)):
            record = json_string(my_uuid, val)
            mycollection.insert_one(record)
    order_by = AWC.extract_order_by(elem["submission"], client)
    if len(order_by) == 1:
        mycollection = mydb["OrderBy"]
        record = json_order_by_attribute(my_uuid, order_by[0])
        mycollection.insert_one(record)
    elif len(order_by) > 1 and not isinstance(order_by, str):
        mycollection = mydb["OrderBy"]
        for val in order_by:
            record = json_order_by_attribute(my_uuid, val)
            mycollection.insert_one(record)
    group_by = AWC.extract_group_by(elem["submission"], client)
    if len(group_by) == 1:
        mycollection = mydb["GroupBy"]
        record = json_group_by_attribute(my_uuid, group_by[0])
        mycollection.insert_one(record)
    elif len(group_by) > 1 and not isinstance(group_by, str):
        mycollection = mydb["GroupBy"]
        for val in AWC.extract_group_by(elem["submission"], client):
            record = json_group_by_attribute(my_uuid, val)
            mycollection.insert_one(record)
    if len(AWC.extract_having(elem["submission"], client)) == 1:
        mycollection = mydb["Having"]
        record = json_having_attribute(
            my_uuid, AWC.extract_having(elem["submission"], client)[0]
        )
        mycollection.insert_one(record)
    elif len(AWC.extract_having(elem["submission"], client)) > 1 and not isinstance(
        AWC.extract_having(elem["submission"], client), str
    ):
        mycollection = mydb["Having"]
        for val in AWC.extract_having(elem["submission"], client):
            record = json_having_attribute(my_uuid, val)
            mycollection.insert_one(record)
    AWC.literal = []
    user_data.clear()


# Returns a json file which extracts characteristics
# and tells which of them are wrong
def prod_json(
    _id,
    course_id,
    test_sql,
    task_nr,
    is_sol,
    tables_right,
    sel_attributes_right,
    pro_attributes_right,
    strings_right,
    order_by_right,
    group_by_right,
    joins_right,
    having_right,
    wildcards,
    time,
    closest_solution,
    min_distance,
    closestID,

):
    # save data if it is a manual solution
    if is_sol is True:
        user_data.extend([True])
        user_data.extend([0])
        user_data.extend([0])
    value = {
        "id": str(closestID),
        "courseId": course_id,
        "taskNumber": task_nr,
        "statement": test_sql,
        "queryRight": user_data[0],
        "parsable": True,
        "isSolution": is_sol,
        "tablesRight": tables_right,
        "selAttributesRight": sel_attributes_right,
        "proAttributesRight": pro_attributes_right,
        "stringsRight": strings_right,
        "userId": user_data[1],
        "attempt": user_data[2],
        "orderByRight": order_by_right,
        "groupByRight": group_by_right,
        "joinsRight": joins_right,
        "havingRight": having_right,
        "wildcards": wildcards,
        "time": time,
        "solutionID":closest_solution,
        "distance":min_distance,


    }
    user_data.clear()
    AWC.literal = []
    return value


def insert_not_parsable(my_uuid, submission, client):
    mydb = client.get_default_database()
    mycollection = mydb["NotParsable"]
    record = json_not_parsable(my_uuid, submission)
    mycollection.insert_one(record)


def return_json_not_parsable(elem):
    # Extract informations from a sql-query-json
    if "passed" in elem:
        user_data.append(elem["passed"])
    if "userId" in elem:
        user_data.append(elem["userId"])
    if "attempt" in elem:
        user_data.append(elem["attempt"])
    if "submission" in elem:
        user_data.append(elem["submission"])
    return user_data
