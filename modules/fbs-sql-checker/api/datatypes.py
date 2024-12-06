from dataclasses import dataclass, field
from datetime import datetime, UTC
from typing import Optional, Self
from uuid import uuid4

from typeguard import typechecked

from api.comparator.sqlparse_comparator import Error


@dataclass
@typechecked
class Query:
    course_id: int
    test_sql: str
    task_nr: int
    is_sol: bool
    tables_right: bool
    sel_attributes_right: bool
    pro_attributes_right: bool
    strings_right: bool
    order_by_right: bool
    group_by_right: bool
    joins_right: bool
    having_right: bool
    wildcards: bool
    time: int
    closest_solution: int
    min_distance: int
    closest_id: int


@dataclass
@typechecked
class Submission:
    submission: str
    is_solution: bool = False
    passed: bool = False
    user_id: Optional[int] = None
    attempt: Optional[int] = None
    course_id: Optional[int] = None
    task_id: Optional[int] = None
    submission_id: Optional[int] = None

    @classmethod
    def new_solution(cls, query: str, course_id: Optional[int] = None, task_id: Optional[int] = None):
        return cls(query, is_solution=True, passed=True, course_id=course_id, task_id=task_id)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            submission=data["submission"],
            is_solution=data.get("isSol", False),
            passed=data.get("passed", False),
            user_id=data.get("userId", None),
            attempt=data.get("attempt", None),
            course_id=data.get("cid", None),
            task_id=data.get("tid", None),
            submission_id=data.get("sid", None),
        )


@dataclass
@typechecked
class Result:
    uuid: str = field(default_factory=lambda: str(uuid4()))
    course_id: int = 0
    task_id: int = 0
    user_id: int = 0
    submission_id: int = 0
    attempt: int = 0
    statement: str = ""
    time: str = ""
    passed: bool = False
    parsable: bool = False
    closest_solution: str = ""
    min_distance: int = 0
    closest_id: str = ""
    version: Optional[str] = None

    @classmethod
    def from_submission(cls, submission: Submission) -> Self:
        return cls(
            course_id=submission.course_id,
            task_id=submission.task_id,
            user_id=submission.user_id,
            submission_id=submission.submission_id,
            attempt=submission.attempt,
            statement=submission.submission,
            time=datetime.now(UTC).isoformat(),
        )

    @classmethod
    def from_db_dict(cls, db_dict):
        return cls(
            uuid=db_dict["_id"],
            course_id=db_dict["courseId"],
            task_id=db_dict["taskId"],
            user_id=db_dict["userId"],
            submission_id=db_dict["submissionId"],
            attempt=db_dict["attempt"],
            statement=db_dict["statement"],
            passed=db_dict["passed"],
            parsable=db_dict["parsable"],
            time=db_dict["time"],
            closest_solution=db_dict["usedSolutionId"],
            min_distance=db_dict["distance"],
            version=db_dict["version"]
        )

    def to_db_dict(self):
        return {
            "_id": self.uuid,
            "courseId": self.course_id,
            "taskId": self.task_id,
            "userId": self.user_id,
            "submissionId": self.submission_id,
            "attempt": self.attempt,
            "statement": self.statement,
            "passed": self.passed,
            "parsable": self.parsable,
            "time": self.time,
            "usedSolutionId": self.closest_solution,
            "distance": self.min_distance,
            "version": self.version,
        }


@dataclass
@typechecked
class LegacyResult(Result):
    task_nr: int = 0
    is_sol: bool = False
    tables_right: bool  = False
    sel_attributes_right: bool = False
    pro_attributes_right: bool = False
    strings_right: bool = False
    order_by_right: bool = False
    group_by_right: bool = False
    joins_right: bool = False
    having_right: bool = False
    wildcards: bool = False

    def to_db_dict(self):
        return {
            "id": str(self.closest_id),
            "courseId": self.course_id, #
            "taskNumber": self.task_id, #
            "submissionId": self.submission_id,
            "statement": self.statement,
            "queryRight": self.passed,
            "parsable": self.parsable,
            "isSolution": self.is_sol,
            "tablesRight": self.tables_right,
            "selAttributesRight": self.sel_attributes_right,
            "proAttributesRight": self.pro_attributes_right,
            "stringsRight": self.strings_right,
            "userId": self.user_id,
            "attempt": self.attempt,
            "orderByRight": self.order_by_right,
            "groupByRight": self.group_by_right,
            "joinsRight": self.joins_right,
            "havingRight": self.having_right,
            "wildcards": self.wildcards,
            "time": self.time,
            "solutionID": self.closest_solution,
            "distance": self.min_distance,
        }


@dataclass
@typechecked
class ResultV2(Result):
    version = "v2"
    errors: list[Error] = field(default_factory=lambda: [])

    def to_db_dict(self):
        return super().to_db_dict() | {
            "version": "v2",
            "errors": [error.to_db_dict() for error in self.errors],
        }

    @classmethod
    def from_db_dict(cls, dict):
        return cls(
            **super().from_db_dict(dict).__dict__,
            version=dict["version"],
            errors=[Error.from_db_dict(err) for err in dict["errors"]],
        )
