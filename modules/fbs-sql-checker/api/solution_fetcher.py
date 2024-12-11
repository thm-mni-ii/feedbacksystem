import math
from abc import ABCMeta, abstractmethod
from typing import Tuple, Optional

from api.data_store import DataStore
from api.distance.distance_calc import DistanceCalculator
from api.datatypes import Submission, Result


class SolutionFetcher(metaclass=ABCMeta):
    @abstractmethod
    def fetch_solution(
        self, task_id: int, submission: Submission
    ) -> Tuple[Optional[Result], float]:
        pass


class FirstSolutionFetcher(SolutionFetcher):
    def __init__(self, datastore: DataStore):
        self._datastore = datastore

    def fetch_solution(
        self, task_id: int, submission: Submission
    ) -> Tuple[Optional[Result], float]:
        solution = self._datastore.query("Queries", {"taskId": task_id, "isSolution": True})
        if len(solution) == 0:
            return None, 0.0
        return (
            Result.from_db_dict(solution[0]),
            1.0,
        )


class NearestSolutionFetcher(SolutionFetcher):
    def __init__(self, datastore: DataStore, distance_calculator: DistanceCalculator):
        self._datastore = datastore
        self._distance_calculator = distance_calculator

    def fetch_solution(
        self, task_id: int, submission: Submission
    ) -> Tuple[Result, float]:
        solutions = self._datastore.query(
            "Queries", {"taskId": task_id, "isSolution": True}
        )
        solutions = [Result.from_db_dict(solution) for solution in solutions]
        min_distance = math.inf
        min_solution = None
        for solution in solutions:
            distance = self._distance_calculator.calculate_distance(
                solution.statement, submission.submission
            )
            if distance < min_distance:
                min_distance = distance
                min_solution = solution

        return min_solution, min_distance
