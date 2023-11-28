import sys
import query_parser as parser
import attribute_check as att_check
import table_check as tab_check


def get_distance(query1, query2):
    parsed_ref = parser.parse_query(query1)
    parsed_comp = parser.parse_query(query2)

    attribute_distance = att_check.extract_attributes(parsed_ref, parsed_comp)
    table_distance = tab_check.extract_tables(parsed_ref, parsed_comp)

    return attribute_distance + table_distance


if len(sys.argv) < 3:
    print("Insufficient arguments passed.")
    print("Please provide two SQL queries as arguments.")
else:
    ref_query = sys.argv[1]
    comp_query = sys.argv[2]

    distance = get_distance(ref_query, comp_query)

    print(f"\nDistance: {distance}")
