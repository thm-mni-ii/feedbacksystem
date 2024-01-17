import sys
import query_parser as parser
import attribute_check as att_check
import table_check as tab_check
import result_log as log
import format as f


def get_distance(ref, query):
    try:
        # query parsing
        parsed_ref = parser.parse_query(ref)
        parsed_query = parser.parse_query(query)

        # distance calculation
        attribute_distance = att_check.extract_attributes(parsed_ref, parsed_query)
        table_distance = tab_check.extract_tables(parsed_ref, parsed_query)

        return attribute_distance + table_distance
    except Exception as e:
        print("Error measuring distance", e)
        return -1


if __name__ == "__main__":
    # accept queries as arguments
    if len(sys.argv) < 3:
        print("Insufficient arguments passed.")
        print("Please provide two SQL queries as arguments.")
    else:
        ref_query = sys.argv[1]
        comp_query = sys.argv[2]
        
    r = f.format_query(ref_query.lower())
    q = f.format_query(comp_query.lower())
    
    log.write_to_log(f"reference:\n{ref_query}\n\nquery:\n{comp_query}\n")

    distance = get_distance(r, q)

    log.write_to_log(f"Distance = {distance}\n------------------------------------------------------------------\n\n")

    print(f"\nDistance = {distance}")
