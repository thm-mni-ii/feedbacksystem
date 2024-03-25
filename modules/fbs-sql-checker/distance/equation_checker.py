import re
import constants as c
import sympy as s


def check_equation(ref: list[str], query: list[str]):
    moves = 0
    for r, q in zip(ref, query):
        # Check if both elements match the equality comparison regex
        if re.match(c.EQ_COMP_REGEX, r) and re.match(c.EQ_COMP_REGEX, q):
            # Compare the sets of characters in each equation
            # If they are different, increment the moves counter
            if set(r) != set(q):
                moves += c.OBJECT_MULT
        # If they don't match the regex, check if they are equal using a different method
        elif not _check_if_equal(r, q):
            # Increment the moves counter if they are not equal
            moves += c.OBJECT_MULT
    # Return the total number of moves calculated
    return moves

# Helper function to check if two equations are mathematically equal
def _check_if_equal(eq1, eq2):
    # Simplify and parse the equations using sympy
    eq1 = s.simplify(s.sympify(eq1))
    eq2 = s.simplify(s.sympify(eq2))
    # Check if the simplified equations are equal
    return eq1.equals(eq2)
