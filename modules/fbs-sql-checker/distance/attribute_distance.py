import re
import constants as c
import uuid

operation_map: dict[str, str, str] = {}


def get_attributes_distance(ref: list[str], query: list[str]):
    moves = 0
    if ref.__contains__("*"):
        moves = 0
    elif set(ref) == set(query):
        for r, q in zip(ref, query):
            if r != q:
                moves += c.ORDER_MULT
                query.remove(r)
                query.insert(ref.index(r), r)
    else:
        for q in query:
            if q not in ref:
                moves += c.OBJECT_MULT

    op_dist = _get_operation_distance(ref, query)
    moves += round(op_dist)
    return moves


def get_command_distance(ref: list[str], query: list[str]):
    moves = 0
    if len(ref) != len(query):
        moves += c.OBJECT_MULT
    elif set(ref) != set(query):
        moves += c.STRUCT_MULT
    return moves


def get_keyword_distance(ref_list: list, query_list: list):
    moves = 0

    if set(ref_list) != set(query_list):
        moves += c.OBJECT_MULT
        print(moves)
    return moves


def _get_operation_distance(ref_list: list[str], query_list: list[str]):
    ref_op_list = []
    query_op_list = []

    # using a regex pattern to extract the operations contained in both attribute lists
    for exp in ref_list:
        if re.findall(c.MATH_EXP_REGEX, exp):
            ref_op_list.append(exp)
    for exp in query_list:
        if re.findall(c.MATH_EXP_REGEX, exp):
            query_op_list.append(exp)
    print("ref op , qur op", ref_op_list, query_op_list)
    return _calculate_expression_similarity(ref_op_list, query_op_list)

# Jaccard index may not be the best method to measure the distance of two mathematical expressions
def _calculate_expression_similarity(ref_exp: list[str], query_exp: list[str]):
    diff = 0
    for r, q in zip(ref_exp, query_exp):
        ref_set = set(r.replace("(", "").replace(")", ""))
        query_set = set(q.replace("(", "").replace(")", ""))
        intersection = len(ref_set.intersection(query_set))
        union = len(ref_set.union(query_set))  # len(ref_set) + len(query_set) - intersection
        if union != 0:
            # Jaccard Index / Similarity Coefficient
            similarity_coeffiecient = 1 - (intersection / union)
            _add_to_op_map(operation_map, r, q, similarity_coeffiecient)
            diff += similarity_coeffiecient * c.STRUCT_MULT
    return diff


def _add_to_op_map(op_map, ref, query, sim):
    generated_uuid = str(uuid.uuid4())
    short_id = generated_uuid[:4]  # Take the first 8 characters as the short ID
    new_entry_key = f"{short_id}"
    op_map[new_entry_key] = {
        "ref": ref,
        "query": query,
        "similarity": sim
    }
