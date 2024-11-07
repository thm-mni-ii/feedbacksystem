import re
from . import constants as c
import uuid
from . import format as f


def get_attributes_distance(ref: list[str], query: list[str]):
    moves = 0
    # distance is equal to 0 if * is used
    if ref.__contains__("*"):
        return 0
    # check for order of attributes and add RMU
    elif sorted(ref) == sorted(query):
        for r in ref:
            if query[ref.index(r)] != r:
                moves += c.ORDER_MULT
                query.remove(r)
                query.insert(ref.index(r), r)
    # check for missing elements and add the OMU if true
    elif len(ref) != len(query):
        moves += abs(len(ref) - len(query)) * c.OBJECT_MULT
    else:
        # compare each element used, if discrepency was found, OMU is added
        for r, q in zip(sorted(ref), sorted(query)):
            if r != q:
                moves += c.OBJECT_MULT
    # get operation distance
    op_dist = _get_operation_distance(ref, query)
    moves += round(op_dist)
    return moves


def get_command_distance(ref: list[str], query: list[str]):
    moves = 0
    # check for number of commmands used and add OMU when there is a difference
    if len(ref) != len(query):
        moves += abs(len(ref) - len(query)) * c.OBJECT_MULT
    # check for each element and if there difference SMU is added
    elif set(ref) != set(query):
        for r, q in zip(sorted(ref), sorted(query)):
            if r != q:
                moves += c.STRUCT_MULT
    return moves


def get_keyword_distance(ref_list: list, query_list: list):
    moves = 0
    if set(ref_list) != set(query_list):
        moves += c.OBJECT_MULT
        # print("distinct", moves)
    return moves


def _get_operation_distance(ref_list: list[str], query_list: list[str]):
    ref_op_list = []
    query_op_list = []

    # check for mathematic operations inside the attribute list using the regex pattern
    # add them to the list of operation for comparison if found
    for exp in ref_list:
        if re.findall(c.MATH_EXP_REGEX, exp):
            ref_op_list.append(exp)
    for exp in query_list:
        if re.findall(c.MATH_EXP_REGEX, exp):
            query_op_list.append(exp)
    # print("ref op , qur op", ref_op_list, query_op_list)
    return _calculate_expression_similarity(ref_op_list, query_op_list)


# Jaccard index may not be the best method to measure the distance of two mathematical expressions
def _calculate_expression_similarity(ref_exp: list[str], query_exp: list[str]):
    operation_map: dict[str, str, str] = {}
    diff = 0
    for r, q in zip(ref_exp, query_exp):
        # Parenthesis formatting
        ref_set = set(f.format_parenthesis(r))
        query_set = set(f.format_parenthesis(q))
        intersection = len(ref_set.intersection(query_set))
        union = len(ref_set.union(query_set))
        if union != 0:
            # Jaccard Similarity Coefficient: 1 - J(A,B)
            similarity_coeffiecient = 1 - (intersection / union)
            _add_to_op_map(operation_map, r, q, similarity_coeffiecient)
            diff += similarity_coeffiecient * c.STRUCT_MULT
    return diff


def _add_to_op_map(op_map, ref, query, sim):
    generated_uuid = str(uuid.uuid4())
    short_id = generated_uuid[:4]  # Take the first 8 characters as the short ID
    new_entry_key = f"{short_id}"
    op_map[new_entry_key] = {"ref": ref, "query": query, "similarity": sim}
