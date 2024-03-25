import sqlparse


def parse_query(query: str):
    try:
        formatted_query = sqlparse.format(query, keyword_case='lower')
        parsed_query = sqlparse.parse(formatted_query)[0].tokens
    except Exception as e:
        print(f"ParsingError: {e}")
    
    return parsed_query