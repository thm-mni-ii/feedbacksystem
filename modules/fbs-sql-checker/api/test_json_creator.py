import unittest
from random import randint

import mongomock
from sympy import false
from typeguard import typechecked

from api.data_store import AbstractMongoStore
from api.query_processor import QueryProcessor, QueryParser, DataStore
from api.datatypes import Submission
from api.pro_attribute_checker import ProAttributeChecker
from api.sel_attribute_checker import SelAttributeChecker
from api.table_checker import TableChecker


class TestDataStorage(AbstractMongoStore):
    def __init__(self):
        self.storage = {}

    def get_collection(self, collection: str):
        if collection not in self.storage:
            self.storage[collection] = mongomock.MongoClient().db.collection

        return self.storage[collection]


@typechecked
class QueryProcessorTestBase(unittest.TestCase):
    def _create_qb(self) -> QueryProcessor:
        qparser = QueryParser()
        storage = TestDataStorage()
        qp = QueryProcessor(
            qparser,
            TableChecker(qparser),
            ProAttributeChecker(qparser),
            SelAttributeChecker(qparser),
            storage,
        )
        return qp


@typechecked
class QueryProcessorParsingTest(QueryProcessorTestBase):
    def test_full_process(self):
        qp = self._create_qb()
        qp.process(
            Submission(
                "SELECT * FROM table",
            )
        )

    def test_parse_without_solution(self):
        qb = self._create_qb()
        res = qb.process(
            Submission(
                "SELECT username, mail, password FROM user WHERE registration_date > 100;",
                is_solution=False,
                passed=False,
            )
        )
        assert res is not None, "should not be none without solution"

    def test_complex_query(self):
        qb = self._create_qb()
        res = qb.process(
            Submission(
                "SELECT DISTINCT s.student_name, c.course_name FROM student_in_course sic1 JOIN student_in_course sic2 ON sic1.student_id = sic2.student_id AND sic1.course_id = sic2.course_id AND sic1.semester_id <> sic2.semester_id JOIN students s ON sic1.student_id = s.student_id JOIN course c ON sic1.course_id = c.course_id;",
                is_solution=True,
                passed=True,
            )
        )
        assert res is not None, "should not be none for result"


@typechecked
class QueryProcessorQueryTestBast(QueryProcessorTestBase):
    def _query_test_case(
        self,
        solution_query: str,
        submission_query: str,
        should_sel_attributes_right: bool = True,
        should_pro_attributes_right: bool = True,
        should_group_by_right: bool = True,
        should_joins_right: bool = True,
        should_order_by_right: bool = True,
        should_strings_right: bool = True,
        should_tables_right: bool = True,
    ):
        qb = self._create_qb()
        course_id = randint(1, 100)
        task_id = randint(1, 1000)
        res = qb.process(
            Submission.new_solution(
                solution_query, course_id=course_id, task_id=task_id
            )
        )
        errors = []

        if res is None:
            errors.append(
                {
                    "message": "res should not be none for solution insertion",
                    "should": "not None",
                    "is": res,
                }
            )

        res = qb.process(
            Submission(submission_query, course_id=course_id, task_id=task_id)
        )

        if res is None:
            errors.append(
                {
                    "message": "res should not be none for checking",
                    "should": "not None",
                    "is": res,
                }
            )

        if should_sel_attributes_right != res.sel_attributes_right:
            errors.append(
                {
                    "message": "sel_attributes_right not as it should",
                    "should": should_sel_attributes_right,
                    "is": res.sel_attributes_right,
                }
            )

        if should_pro_attributes_right != res.pro_attributes_right:
            errors.append(
                {
                    "message": "pro_attributes_right not as it should",
                    "should": should_pro_attributes_right,
                    "is": res.pro_attributes_right,
                }
            )

        if should_group_by_right != res.group_by_right:
            errors.append(
                {
                    "message": "group_by_right not as it should",
                    "should": should_group_by_right,
                    "is": res.group_by_right,
                }
            )

        if should_joins_right != res.joins_right:
            errors.append(
                {
                    "message": "joins_right not as it should",
                    "should": should_joins_right,
                    "is": res.joins_right,
                }
            )

        if should_order_by_right != res.order_by_right:
            errors.append(
                {
                    "message": "order_by_right not as it should",
                    "should": should_order_by_right,
                    "is": res.order_by_right,
                }
            )

        if should_strings_right != res.strings_right:
            errors.append(
                {
                    "message": "strings_right not as it should",
                    "should": should_strings_right,
                    "is": res.strings_right,
                }
            )

        if should_tables_right != res.tables_right:
            errors.append(
                {
                    "message": "tables_right not as it should",
                    "should": should_tables_right,
                    "is": res.tables_right,
                }
            )

        if errors:
            raise Exception(
                "Tests failed:\n" + "\n".join(str(error) for error in errors)
            )


@typechecked
class QueryProcessorMinimalQueryTest(QueryProcessorQueryTestBast):
    def test_correct(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100;",
            "SELECT username, mail, password FROM user WHERE registration_date > 100;",
        )

    def test_wrong_select(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100;",
            "SELECT username, mail, registration_date FROM user WHERE registration_date > 100;",
            should_pro_attributes_right=False,
        )

    def test_wrong_where(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100;",
            "SELECT username, mail, password FROM user WHERE registration_data > 100;",
            should_sel_attributes_right=False,
        )

    def test_wrong_join(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user JOIN submissions ON user.id = submission.user_id WHERE registration_date > 100;",
            "SELECT username, mail, password FROM user JOIN submissions ON user.id = submission.id WHERE registration_date > 100;",
            should_joins_right=False,
        )

    def test_wrong_group_by(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100 GROUP BY mail;",
            "SELECT username, mail, password FROM user WHERE registration_date > 100 GROUP BY username;",
            should_group_by_right=False,
        )

    def test_wrong_order_by(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100 ORDER BY registration_date;",
            "SELECT username, mail, password FROM user WHERE registration_date > 100 ORDER BY username;",
            should_order_by_right=False,
        )

    def test_wrong_string(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE username = 'tester';",
            "SELECT username, mail, password FROM user WHERE username = 'test';",
            should_strings_right=False,
        )

    def test_wrong_tables(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100;",
            "SELECT username, mail, password FROM users WHERE registration_date > 100;",
            should_tables_right=False,
        )


@typechecked
class QueryProcessorComplexSelTest(QueryProcessorQueryTestBast):
    def test_count(self):
        self._query_test_case(
            "SELECT registration_date, COUNT(username) FROM user WHERE registration_date > 100 GROUP BY registration_date;",
            "SELECT registration_data, COUNT(username) FROM user WHERE registration_date > 100 GROUP BY registration_date;",
            should_pro_attributes_right=False,
        )

    def test_distinct_count(self):
        self._query_test_case(
            "SELECT registration_date, COUNT(DESTINCT username) FROM user WHERE registration_date > 100 GROUP BY registration_date;",
            "SELECT registration_data, COUNT(DESTINCT username) FROM user WHERE registration_date > 100 GROUP BY registration_date;",
            should_pro_attributes_right=False,
        )


@typechecked
class QueryProcessorComplexWhereTest(QueryProcessorQueryTestBast):
    def test_wrong_name_with_bool_op(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100 AND mail LIKE '%gmail.com';",
            "SELECT username, mail, password FROM user WHERE registration_data > 100 AND mail LIKE '%gmail.com';",
            should_sel_attributes_right=False,
        )

    def test_inverse_operator(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100;",
            "SELECT username, mail, password FROM user WHERE registration_date < 100;",
            should_sel_attributes_right=False,
        )

    def test_wrong_bool_op_operator(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100 AND mail LIKE '%gmail.com';",
            "SELECT username, mail, password FROM user WHERE registration_date > 100 OR mail LIKE '%gmail.com';",
            should_sel_attributes_right=False,
        )

    def test_type_confusion(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date > 100;",
            "SELECT username, mail, password FROM user WHERE registration_date > '100';",
            should_sel_attributes_right=False,
        )

    def test_subquery(self):
        self._query_test_case(
            "SELECT username, mail, password FROM user WHERE registration_date IN (SELECT DISTINCT registration_data FORM abuse);",
            "SELECT username, mail, password FROM user WHERE registration_date NOT IN (SELECT DISTINCT registration_data FORM abuse);",
            should_sel_attributes_right=False,
        )


@typechecked
class QueryProcessorDistanceTest(QueryProcessorTestBase):
    def test_nearest_distance_is_used(self):
        pass


if __name__ == "__main__":
    unittest.main()
