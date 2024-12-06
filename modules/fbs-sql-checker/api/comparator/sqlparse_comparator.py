from dataclasses import dataclass

import sqlparse
from typeguard import typechecked

from api.comparator.comparator import Comparator


@dataclass
@typechecked
class Error:
    expected: str
    got: str
    trace: list[str]

    @classmethod
    def from_db_dict(cls, db_dict):
        return cls(
            expected=db_dict["expected"],
            got=db_dict["got"],
            trace=db_dict["trace"],
        )

    def to_db_dict(self):
        return {"expected": self.expected, "got": self.got, "trace": self.trace}


@typechecked
class SqlparseComparator(Comparator):
    def compare(self, solution: str, submission: str) -> list[Error]:
        solution_parsed = sqlparse.parse(solution)
        dfs = SqlParserDfs()
        dfs.visit(solution_parsed)
        cv = SqlParserCoVisitor(dfs.dfs)
        submission_parsed = sqlparse.parse(submission)
        cv.visit(submission_parsed)
        return cv.errors


class SqlParseVisitor:
    def __init__(self):
        super().__init__()
        self.parent_stack: list[sqlparse.tokens.Token] = []
        self._visitors = {
            sqlparse.sql.Statement: self.visit_statement,
            sqlparse.sql.Where: self.visit_where,
            sqlparse.sql.IdentifierList: self.visit_identifiers,
            sqlparse.sql.Identifier: self.visit_identifier,
            sqlparse.sql.Comparison: self.visit_comparison,
            sqlparse.sql.Function: self.visit_function,
            sqlparse.sql.Parenthesis: self.visit_parenthesis,
        }

    def recursive_visit(self, token: sqlparse.sql.TokenList):
        self.parent_stack.append(token)
        self.visit(token.tokens)
        self.parent_stack.pop()

    def visit_statement(self, token: sqlparse.sql.Statement):
        self.recursive_visit(token)

    def visit_where(self, token: sqlparse.sql.Where):
        self.recursive_visit(token)

    def visit_identifier(self, token: sqlparse.sql.Where):
        self.recursive_visit(token)

    def visit_identifiers(self, token: sqlparse.sql.Where):
        self.recursive_visit(token)

    def visit_comparison(self, token: sqlparse.sql.Where):
        self.recursive_visit(token)

    def visit_function(self, token: sqlparse.sql.Function):
        self.recursive_visit(token)

    def visit_parenthesis(self, token: sqlparse.sql.Parenthesis):
        self.recursive_visit(token)

    def visit_literal(self, token: sqlparse.tokens.Token):
        pass

    def visit(self, tokens: list[sqlparse.sql.Token]):
        for token in tokens:
            if token.ttype is not None:
                self.visit_literal(token)
            elif token.__class__ in self._visitors:
                self._visitors[token.__class__](token)
            else:
                raise ValueError('unhandled token', token)

    def trace_to_str_list(self) -> list[str]:
        return [entry.__class__.__name__ if entry.ttype is None else entry.value for entry in self.parent_stack]


class SqlParserDfs(SqlParseVisitor):
    def __init__(self):
        super().__init__()
        self.dfs = []

    def recursive_visit(self, token: sqlparse.sql.TokenList):
        self.dfs.append(token)
        super().recursive_visit(token)

    def visit_literal(self, token: sqlparse.tokens.Token):
        self.dfs.append(token)
        super().visit_literal(token)


class SqlParserCoVisitor(SqlParseVisitor):
    def __init__(self, solution):
        super().__init__()
        self._solution = solution
        self._i = 0
        self.errors = []

    def _get_should(self):
        self._i += 1
        return self._solution[self._i - 1]

    def recursive_visit(self, token: sqlparse.sql.Statement):
        should = self._get_should()
        if token.__class__ != should.__class__:
            self.errors.append(Error(should.__class__.__name__, token.__class__.__name__, self.trace_to_str_list()))
        else:
            super().recursive_visit(token)

    def visit_literal(self, token: sqlparse.tokens.Token):
        should = self._get_should()
        if token.value != should.value:
            self.errors.append(Error(should.value, token.value, self.trace_to_str_list()))
        super().visit_literal(token)
