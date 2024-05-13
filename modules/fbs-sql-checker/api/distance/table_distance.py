from . import constants as c
from . import db_connection as db
from . import equation_checker as ec
import re


def get_from_clause_distance(ref: list, query: list, ref_join: list, query_join: list):
    moves = 0
    # check for table used if number of table used else difference * OMU
    moves += abs(len(ref) - len(query)) * c.OBJECT_MULT

    # join difference
    if len(ref_join) != len(query_join):
        moves += abs(len(ref_join) - len(query_join)) * c.OBJECT_MULT
    else:
        for r, q in zip(sorted(ref_join), sorted(query_join)):
            if r != q:
                moves += c.STRUCT_MULT
    # test if both queries yield the same results
    moves += _join_queries_distance(ref, query, ref_join, query_join)

    return moves



def _join_queries_distance(ref, query, ref_join, query_join):
    moves = 0
    # Check if the WHERE clause is not present in
    if c.WHERE not in ref_join and c.WHERE not in query_join:
        # check if different JOINS clauses were used 
        if any(rj in c.JOIN_TYPES for rj in ref_join) and any(qj in c.JOIN_TYPES for qj in query_join):
            mapped_ref, mapped_query = _map_values(ref, query)
            # Format the join part of the SQL script for both reference and query
            ref_script = _format_join_script(mapped_ref, ref_join)
            query_script = _format_join_script(mapped_query, query_join)
            try:
                # Set up database connection
                connection = db.setup_db(ref)
                # Execute the formatted reference and query scripts in the database
                ref_res = db.execute_query(ref_script, connection)
                query_res = db.execute_query(query_script, connection)
                # Compare the results of the reference and query scripts
                if ref_res != query_res:
                    moves += c.OBJECT_MULT
                connection.close()
            except Exception as e:
                print("Database Error", e)
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
    # Initialize the SQL script with the base SELECT statement
    script: str = "SELECT * FROM "
    if len(tab_name) != 0:
        # Add the first table name to the FROM clause
        script += f"{tab_name[0]}"
        # Iterate through the remaining table names to build the JOIN clauses
        for i in range(1, len(tab_name)):
            # Determine the join type for the current table (if available)
            join_type = join_list[i - 1] if i - 1 < len(join_list) else ""
            # Append the join type and current table name to the script
            # Also include the ON clause to specify the join condition
            script += f" {join_type} {tab_name[i]} ON {tab_name[i - 1]}.x = {tab_name[i]}.x"
    # Complete the SQL script with a semicolon
    script += ";"
    return script



def comparison_distance(ref: list[str], query: list[str]):
    moves = 0

    if len(ref) != len(query):
        # If lengths are different, calculate the absolute difference in length
        # Multiply the difference by a predefined constant (OBJECT_MULT) and add to the moves counter
        moves += abs(len(ref) - len(query)) * c.OBJECT_MULT
    else:
        for r, q in zip(sorted(ref), sorted(query)):
            if re.match(c.SYMBOL_REGEX, r) and re.match(c.SYMBOL_REGEX, q):
                moves += ec.check_equation(r, q)
            else:
                if r != q:
                # Increment the moves counter by OBJECT_MULT for each differing pair
                    moves += c.OBJECT_MULT
    # Return the total number of moves calculated
    return moves



def group_and_order_by_distance(ref: list[str], query: list[str]):
    moves = 0
    # Check if both lists contain the same elements, irrespective of order
    if sorted(ref) == sorted(query):
        for r in ref:
            # Check if the corresponding element in the query list is at a different position
            if query[ref.index(r)] != r:
                # Increment the moves counter by the order multiplier
                moves += c.ORDER_MULT
                # Remove the element from its current position in the query list
                query.remove(r)
                # Insert the element at its correct position based on the reference list
                query.insert(ref.index(r), r)
    # Check if the lengths of the two lists are different
    elif len(ref) != len(query):   
        # Increment the moves counter by the object multiplier times the difference in length
        moves += abs(len(ref) - len(query)) * c.OBJECT_MULT 
    # If the lists are of the same length but have different elements
    else:
        # Iterate through each pair of elements in the sorted lists
        for r, q in zip(sorted(ref), sorted(query)):
            # Check if the elements are different
            if r != q:
                # Increment the moves counter by the object multiplier for each differing pair
                moves += c.OBJECT_MULT
    return moves