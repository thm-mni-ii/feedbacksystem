import re
import constants as c
import sympy as s


def check_equation(ref: list[str], query: list[str]):
    moves = 0
    for r, q in zip(ref, query):
        if re.match(c.EQ_COMP_REGEX, r) and re.match(c.EQ_COMP_REGEX, q):
            if set(r) != set(q):
                moves += c.OBJECT_MULT
        elif not _check_if_equal(r, q):
            moves += c.OBJECT_MULT
    return moves


def _check_if_equal(eq1, eq2):
    eq1 = s.simplify(s.sympify(eq1))
    eq2 = s.simplify(s.sympify(eq2))

    return eq1.equals(eq2)
