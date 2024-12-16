from abc import ABCMeta, abstractmethod

from typeguard import typechecked


@typechecked
class Comparator(metaclass=ABCMeta):
    @abstractmethod
    def compare(self, solution: str, submission: str):
        pass
