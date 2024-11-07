from inspect import trace

from . import attribute_check as att_check
from . import table_check as tab_check
from . import result_log as log
from . import format as f
import sqlparse
import traceback


# first argument is always the solution
def get_distance(ref, query):
    try:
        r = f.format_query(ref.lower())
        q = f.format_query(query.lower())

        # query parsing
        parsed_ref = _parse_query(r)
        parsed_query = _parse_query(q)

        # distance calculation
        attribute_distance = att_check.extract_attributes(parsed_ref, parsed_query)
        table_distance = tab_check.extract_tables(parsed_ref, parsed_query)
        log.write_to_log(f"reference:\n{ref}\n\nquery:\n{query}\n")

        log.write_to_log(
            f"Distance = {attribute_distance + table_distance}\n"
            f"------------------------------------------------------------------\n\n"
        )

        return attribute_distance + table_distance
    except Exception as e:
        print("Error measuring distance", e)
        print(traceback.format_exc())
        return -1


def _parse_query(query: str):
    try:
        formatted_query = sqlparse.format(query, keyword_case="lower")
        parsed_query = sqlparse.parse(formatted_query)[0].tokens
    except Exception as e:
        print(f"ParsingError: {e}")

    return parsed_query
