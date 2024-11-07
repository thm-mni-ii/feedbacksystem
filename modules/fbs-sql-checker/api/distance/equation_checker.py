from . import constants as c
import sympy as s


def check_equation(ref, query):
    moves = 0
    # Check if both elements match the equality comparison regex
    eq1 = s.simplify(s.sympify(ref))
    eq2 = s.simplify(s.sympify(query))
    try:
        if s.Eq(eq1, eq2).canonical:
            # Increment the moves counter if they are not equal
            return moves
        # Return the total number of moves calculated
    except Exception:
        moves += c.OBJECT_MULT
        return moves
