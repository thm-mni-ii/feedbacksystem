# parser.py
import json
import logging

import mo_sql_parsing

from api.error import QueryParsingParserException


class QueryParser:
    def __init__(self, logger = None):
        if logger is None:
            logger = logging.getLogger()
        self._logger = logger

    def parse_query(self, query: str):
        try:
            parsed_query = mo_sql_parsing.parse(query)
        except Exception as e:
            logging.warning(f"Not able to parse the statement: {query}", exc_info=e)
            raise QueryParsingParserException(query) from e

        json_output = json.dumps(parsed_query, indent=4)
        pyt_obj = json.loads(json_output)
        return pyt_obj

