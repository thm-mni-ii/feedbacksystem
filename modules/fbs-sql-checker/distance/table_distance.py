import constants as c
import db_connection as db
import equation_checker as ec


def get_from_clause_distance(ref: list, query: list, ref_join: list, query_join: list):
    moves = 0
    # check for table used
    for q in query:
        if q not in ref:
            moves += c.OBJECT_MULT
    print("table DIST", moves)

    # join difference
    if len(ref_join) != len(query_join):
        moves += c.OBJECT_MULT
        print("join DIST", moves)
    elif set(ref_join) != set(query_join):
        moves += c.STRUCT_MULT
        print("clause DIST", moves)

    # check if any type of join exists inside in both lists
    # then test if both queries yield the same results
    if c.WHERE not in ref_join and c.WHERE not in query_join:
        if any(rj in c.JOIN_TYPES for rj in ref_join) and any(qj in c.JOIN_TYPES for qj in query_join):
            mapped_ref, mapped_query = _map_values(ref, query)
            ref_script = _format_join_script(mapped_ref, ref_join)
            query_script = _format_join_script(mapped_query, query_join)
            print(f"script_ {ref_script}\n query: {query_script}")
            try:
                connection = db.setup_db(ref)
                ref_res = db.execute_query(ref_script, connection)
                query_res = db.execute_query(query_script, connection)

                if ref_res == query_res:
                    print("The results are equal")
                else:
                    print("The results are different")
                    moves += c.OBJECT_MULT
                connection.close()
            except Exception as e:
                print(e)

    return moves


def _map_values(ref, query):
    full_list = ref + query
    value_map = {}
    # assign each element to a character
    for idx, element in enumerate(set(full_list)):
        value_map[element] = chr(65 + idx)  # Using A, B, C, ... as values

    # Map the elements in the lists to their corresponding values
    mapped_ref = [value_map[element] for element in ref]
    mapped_query = [value_map[element] for element in query]

    return mapped_ref, mapped_query


def _format_join_script(tab_name: list, join_list: list):
    script: str = "SELECT * FROM "
    if len(tab_name) != 0:
        script += f"{tab_name[0]}"
        for i in range(1, len(tab_name)):
            join_type = join_list[i - 1] if i - 1 < len(join_list) else ""
            script += f" {join_type} {tab_name[i]} ON {tab_name[i - 1]}.x = {tab_name[i]}.x"
    script += ";"
    return script


def comparison_distance(ref: list[str], query: list[str]):
    moves = 0
    if len(ref) != len(query):
        moves += c.OBJECT_MULT
    else:
        moves += ec.check_equation(ref, query)
    print("Comparison Dist", moves)
    return moves


def group_and_order_by_distance(ref: list[str], query: list[str]):
    moves = 0
    if set(ref) == set(query):
        for r, q in zip(ref, query):
            if r != q:
                moves += c.ORDER_MULT
                query.remove(r)
                query.insert(ref.index(r), r)
    else:
        for r in ref:
            if r not in query:
                moves += c.OBJECT_MULT
    return moves
