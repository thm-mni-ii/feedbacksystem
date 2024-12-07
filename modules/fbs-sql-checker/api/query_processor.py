# JSONCreator.py
from abc import ABCMeta, abstractmethod
from logging import Logger
from uuid import uuid4
from typing import Optional
from venv import logger

import sqlparse
from typeguard import typechecked

from api.comparator.comparator import Comparator
from api.data_store import DataStore
from api.parser import QueryParser
from api.pro_attribute_checker import ProAttributeChecker
from api.sel_attribute_checker import SelAttributeChecker
from api.solution_fetcher import SolutionFetcher
from api.table_checker import TableChecker
from datetime import datetime
import model
from api.datatypes import Submission, Result, ResultV2
from mask_aliases import SQLAliasMasker
import distance.distance_calc as d

"""
rightStatements = []
rightTables = []
rightAtts = []
rightStrings = []
rightWhereAtts = []
user_data = []
tables, selAttributes, proAttributes, strings = [], [], [], []
"""


@typechecked
class QueryProcessor(metaclass=ABCMeta):
    @abstractmethod
    def process(self, submission) -> Result:
        pass


@typechecked
class QueryProcessorV2(QueryProcessor):
    def __init__(self, comparator: Comparator, solution_fetcher: SolutionFetcher, log: Optional[Logger] = None):
        self._comparator = comparator
        self._solution_fetcher = solution_fetcher
        if logger is not None:
            self._logger = Logger(self.__class__.__name__)
        else:
            self._logger = logger

    def process(self, submission: Submission) -> Result:
        result = ResultV2.from_submission(submission)
        if not (submission.is_solution or submission.passed):
            solution, distance = self._solution_fetcher.fetch_solution(submission.task_id, submission)
            try:
                result.errors = self._comparator.compare(solution.statement, submission.submission)
                result.passed = len(result.errors) == 0
                result.closest_solution = solution.uuid
                result.min_distance = distance
                result.parsable = True
            except Exception as e:
                logger.exception(e)
        else:
            try:
                sqlparse.parse(submission.submission)
                result.parsable = True
            except Exception as e:
                pass
            result.passed = result.parsable

        return result


class QueryProcessorV1(QueryProcessor):
    def __init__(self, parser: QueryParser, table_checker: TableChecker, pro_attribute_checker: ProAttributeChecker, sel_attribute_checker: SelAttributeChecker, data_store: DataStore):
        self._parser = parser
        self._table_checker = table_checker
        self._pro_attribute_checker = pro_attribute_checker
        self._sel_attribute_checker = sel_attribute_checker
        self._data_store = data_store

    def _parse_query(self, query: str, is_solution: bool, passed: bool) -> Result:
        time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        (
            tables2,
            pro_atts2,
            sel_atts2,
            strings2,
            task_nr,
            is_sol,
            uuid,  # submission primary key
            course_id,
            order_by2,
            group_by2,
            having2,
            joins2,
            wildcards2,
            literals
        ) = ([], [], [], [], [], [], [], [], [], [], [], [], [], [])
        try:
            masker = SQLAliasMasker(query)
            masker.mask_aliases_()
            masked_query = masker.get_masked_query()
            # Extract tables, selAttributes, proAttributes and strings
            table_list = self._table_checker.extract_tables(masked_query)
            if table_list != "Unknown":
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
            extracted_pro_attributes = self._pro_attribute_checker.extract_pro_attributes(
                masked_query,
                literals
            )
            if extracted_pro_attributes != "Unknown":
                pro_atts2.extend(extracted_pro_attributes)
            extracted_string = self._sel_attribute_checker.extract_sel_attributes(masked_query, literals)
            if extracted_string != "Unknown":
                sel_atts2.extend(extracted_string)
            extracted_order_by = self._sel_attribute_checker.extract_order_by(masked_query)
            if extracted_order_by != "Unknown":
                order_by2.extend(extracted_order_by)
            extracted_group_by = self._sel_attribute_checker.extract_group_by(masked_query)
            if extracted_group_by != "Unknown":
                group_by2.extend(extracted_group_by)
            extracted_having = self._sel_attribute_checker.extract_having(masked_query)
            if extracted_having != "Unknown":
                having2.extend(extracted_having)
            #strings2.extend(list(set(AWC.literal)))
            # If TaskID or Submission ID not in data, return
            """
            if "tid" not in data or "sid" not in data:
                print("Task ID or Unique ID not in data")
                return
            task_nr = data["tid"]
            uuid = data["sid"]
            course_id = data["cid"]
            is_sol = data["isSol"]
            """
            # Save tables, selAttributes, proAttributes and strings to DB
            uuid = str(uuid4())
            if self._parser.parse_query(masked_query) is not False:
                self._insert_tables(query, uuid)

            # check and remove duplicates
            #flag_duplicates(client, task_nr)

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
                # new
                closest_solution2,
                min_distance2,
                closest_id_2,
            ) = self._check_solution_chars(
                query,
                is_solution,
                passed,
                task_nr,
                uuid,
                tables2,
                pro_atts2,
                sel_atts2,
                strings2,
                order_by2,
                group_by2,
                joins2,
                having2,
            )

            # produce a JSON
            record = self._return_json(
                query,
                is_sol,
                passed,
                uuid,
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
                time,
                closest_solution2,
                min_distance2,
                closest_id_2,
            )

            # save JSON to DB
            return record
        except Exception as e:
            print(e)
            record = Result(uuid, course_id=course_id, task_nr=task_nr, time=time)
            return record

    def _check_solution_chars(
            self,
            query: str,
            is_sol: bool,
            passed: bool,
            task_nr,
            uuid,
            tables2,
            pro_atts2,
            sel_atts2,
            strings2,
            order_by2,
            group_by2,
            joins2,
            having2,
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
            # new
            closest_solution,
            min_distance,
            closest_id,
        ) = (
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
        )

        min_distance = float("inf")  # Set to positive infinity
        closest_solution = None
        # For every solution for given task
        for x in self._data_store.query("Solutions", {"taskNumber": task_nr}):
            # Extract Tables, Attributes etc. (cut out for better overview)
            # compare the distance between the solution and the submission only if it is not a duplicate
            if not x.get("duplicate", False):

                distance = d.get_distance(x["statement"], query)

                # insert distance to the solution
                # mycol.update_one({"_id": x["_id"]}, {"$set": {"distance": distance}}, upsert=True)

                # check for min distance and use the corresponding solution
                if distance < min_distance:
                    min_distance = distance
                    closest_solution = x[
                        "id"
                    ]  # choose the id of solution if it has the lowest distance

        self._data_store.upsert("Solutions", {"_id": closest_solution}, {"$set": {"distance": min_distance}})

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
            for y in self._data_store.query("Tables", {"id": closest_solution}, {"table": 1}):
                tables.append(y["table"])
            for y in self._data_store.query("ProAttributes", {"id": closest_solution}, {"proAttribute": 1}):
                pro_attributes.append(y["proAttribute"])
            for y in self._data_store.query("SelAttributes", {"id": closest_solution}, {"selAttribute": 1}):
                sel_attributes.append(y["selAttribute"])
            for y in self._data_store.query("Strings", {"id": closest_solution}, {"string": 1}):
                strings.append(y["string"])
            for y in self._data_store.query("OrderBy", {"id": closest_solution}, {"orderBy": 1, "sort": 1}):
                order_by_value = [y["orderBy"]]
                if (
                        "sort" in y
                ):  # if there is no order in sort the default "asc" will be used
                    order_by_value.append(y["sort"])
                else:
                    order_by_value.append("asc")
                order_by.append(order_by_value)
            for y in self._data_store.query("GroupBy", {"id": closest_solution}, {"groupBy": 1}):
                group_by.append(y["groupBy"])
            for y in self._data_store.query("Joins",
                    {"id": closest_solution}, {"type": 1, "attr1": 1, "attr2": 1}
            ):
                join_value = [y["type"]]
                if (
                        "attr1" in y and "attr2" in y
                ):  # if there is no order in sort the default "asc" will be used
                    join_value.append(y["attr1"])
                    join_value.append(y["attr2"])
                else:
                    join_value.append("Empty")
                joins.append(join_value)
            for y in self._data_store.query("Having", {"id": closest_solution}, {"havingAttribute": 1}):
                having_value = y["havingAttribute"]
                having.append(having_value)
            if len(joins) == 0:
                joins.append("Empty")
            if passed:
                if is_sol:
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
        if is_sol:
            if new_solution is True:
                # Upload as a new Solution to DB
                self._parse_single_stat_upload_solution(query, task_nr, uuid)
            return (
                True,
                True,
                True,
                True,
                True,
                True,
                True,
                True,
                True,
                closest_solution,
                min_distance,
                closest_id,
            )
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
            # new
            closest_solution,
            min_distance,
            closest_id,
        )

    def _insert_tables(self, query: str, uuid: str):
        literals = []
        table_list = self._table_checker.extract_tables(query)
        joins = []
        tables = table_list[0]
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
            record = model.json_table(uuid, tables[0])
            self._data_store.store("Tables", record)
            if joins[0] != "Empty":
                try:
                    self._data_store.store("Joins", record)
                except Exception:
                    print("Error while reading joins.")
        elif len(tables) > 1 and not isinstance(self._table_checker.extract_tables(query), str):
            for val in tables:
                record = model.json_table(uuid, val)
                self._data_store.store("Tables", record)
            if joins[0] != "Empty":
                try:
                    for y in joins:
                        record = model.json_join_attribute(uuid, y)
                        self._data_store.store("Joins", record)
                except Exception:
                    print("Error while reading joins.")

        pro_attributes = self._pro_attribute_checker.extract_pro_attributes(query, literals)
        if len(pro_attributes) == 1:
            record = model.json_pro_attribute(uuid, pro_attributes[0])
            self._data_store.store("ProAttributes", record)
        elif len(pro_attributes) > 1 and not isinstance(pro_attributes, str):
            for val in pro_attributes:
                record = model.json_pro_attribute(uuid, val)
                self._data_store.store("ProAttributes", record)

        sel_attributes = self._sel_attribute_checker.extract_sel_attributes(query, literals)
        if len(sel_attributes) == 1:
            record = model.json_sel_attribute(uuid, sel_attributes[0])
            self._data_store.store("SelAttributes", record)
        elif len(sel_attributes) > 1 and not isinstance(sel_attributes, str):
            for val in sel_attributes:
                record = model.json_sel_attribute(uuid, val)
                self._data_store.store("SelAttributes", record)

        strings = list(set(literals))
        if len(strings) == 1:
            record = model.json_string(uuid, strings[0])
            self._data_store.store("Strings", record)
        elif len(strings) > 1 and not isinstance(strings, str):
            for val in strings:
                record = model.json_string(uuid, val)
                self._data_store.store("Strings", record)

        order_by = self._sel_attribute_checker.extract_order_by(query)
        if len(order_by) == 1:
            record = model.json_order_by_attribute(uuid, order_by[0])
            self._data_store.store("OrderBy", record)
        elif len(order_by) > 1 and not isinstance(order_by, str):
            for val in order_by:
                record = model.json_order_by_attribute(uuid, val)
                self._data_store.store("OrderBy", record)

        group_by = self._sel_attribute_checker.extract_group_by(query)
        if len(group_by) == 1:
            record = model.json_group_by_attribute(uuid, group_by[0])
            self._data_store.store("GroupBy", record)
        elif len(group_by) > 1 and not isinstance(group_by, str):
            for val in group_by:
                record = model.json_group_by_attribute(uuid, val)
                self._data_store.store("GroupBy", record)

        having = self._sel_attribute_checker.extract_having(query)
        if len(having) == 1:
            record = model.json_having_attribute(uuid, having[0])
            self._data_store.store("Having", record)
        elif len(having) > 1 and not isinstance(having, str):
            for val in having:
                record = model.json_having_attribute(uuid, val)
                self._data_store.store("Having", record)

        #self._sel_attribute_checker.literal = []
        #user_data.clear()

    # return JSON to be pasted to DB
    def _return_json(
            self,
            query,
            is_sol,
            passed,
            uuid,
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
            time,
            closest_solution,
            min_distance,
            closest_id,
    ):

        #user_data.append(passed)
        if self._parser.parse_query(query) is not False:
            # produce a json to be pasted to DB
            record = Result(
                uuid,
                course_id,
                query,
                passed,
                True,
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
                closest_id,
            )
            return record
        # produce a json if the sql-query is not parsable
        record = Result(uuid, course_id=course_id, task_nr=task_nr, time=time)
        return record

    def process(self, submission: Submission) -> Result:
        print("input", submission)
        result = self._parse_query(submission.submission, submission.is_solution, submission.passed)
        if result is None:
            raise ValueError('query parsing resulted in none')
        result.course_id = submission.course_id
        result.task_nr = submission.task_id
        print("output", result)
        self._store_query(result.to_db_dict(course_id=submission.course_id, task_id=submission.task_id, user_id=submission.user_id, submission_id=submission.submission_id, attempt=submission.attempt))
        return result

    def _store_query(self, query):
        self._data_store.store("Queries", query)

    def _parse_single_stat_upload_solution(self, data, task_nr, uuid):
        record = model.prod_solution_json(data, uuid, task_nr)
        self._data_store.store("Solutions", record)


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
    query_length = len(queries)
    for i in range(query_length):
        for j in range(
            i + 1, query_length
        ):  # Start from i + 1 to avoid comparing with itself and re-comparing
            query1 = queries[i]
            query2 = queries[j]

            if d.get_distance(query1["statement"], query2["statement"]) == 0:
                duplicates.append(query2["_id"])

    # Flag duplicates based on gathered IDs
    for duplicate_id in set(duplicates):
        mycol.update_one(
            {"_id": duplicate_id}, {"$set": {"duplicate": True}}, upsert=True
        )


# Parse a solution and upload it to DB


"""

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

# Returns a json file which extracts characteristics
# and tells which of them are wrong
def prod_json(
    _id,
    course_id,
    test_sql,
    passed,
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
    closest_id,
):
    # save data if it is a manual solution
    #if is_sol is True:
    #    user_data.extend([True])
    #    user_data.extend([0])
    #    user_data.extend([0])
    value = {
        "id": str(closest_id),
        "courseId": course_id,
        "taskNumber": task_nr,
        "statement": test_sql,
        "queryRight": passed,
        "parsable": True,
        "isSolution": is_sol,
        "tablesRight": tables_right,
        "selAttributesRight": sel_attributes_right,
        "proAttributesRight": pro_attributes_right,
        "stringsRight": strings_right,
        "userId": None,
        "attempt": 0,
        "orderByRight": order_by_right,
        "groupByRight": group_by_right,
        "joinsRight": joins_right,
        "havingRight": having_right,
        "wildcards": wildcards,
        "time": time,
        "solutionID": closest_solution,
        "distance": min_distance,
    }
    user_data.clear()
    return value

def insert_not_parsable(uuid, submission, client):
    mydb = client.get_default_database()
    mycollection = mydb["NotParsable"]
    record = model.json_not_parsable(uuid, submission)
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
"""
