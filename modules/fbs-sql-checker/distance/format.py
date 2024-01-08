import re
import sqlparse
import constants as c


def format_alias(ident: str):
    # check ident with pattern to get the alias keyword and alias name
    regex = re.compile(c.ALIAS_REGEX, re.IGNORECASE)
    match = regex.search(ident)
    if match:
        # flag is used for case sensitivity
        ident = re.sub(c.ALIAS_REGEX, "", ident, flags=re.IGNORECASE).strip()
    return ident


def format_db_name(ident: str):
    # check ident with pattern to get the alias keyword and alias name
    regex = re.compile(c.DB_NAME_REGEX)

    # Check if the ident matches the pattern
    match = regex.search(ident)
    if match:
        ident = match.group(1)

    return ident


def format_distinct(ident: str):
    if ident.__contains__(c.DISTINCT):
        ident = ident.replace(c.DISTINCT, "").strip()
    return ident


def format_command(ident: sqlparse.sql.Identifier):
    # get_real_name() function returns the select command and will get removed along the alias and the 'as' keyword
    formatted = ident.value.replace(ident.get_real_name(), "").replace("(", "").replace(")", "")
    return formatted


def format_comp_db_name(ident: str):
    # Split the input string using the regex pattern to find the operator
    parts = re.split(c.DB_COMP_REGEX, ident)

    # Get the left and right sides of the equation after removing whitespace
    left_substring = parts[0].rsplit('.', 1)[-1].strip()
    right_substring = parts[2].rsplit('.', 1)[-1].strip()

    # Check if the operator is "LIKE" and replace it with "="
    operator = parts[1].strip()

    # Join the substrings back together with the operator
    result = f"{left_substring} {operator} {right_substring}"

    return result


def format_whitespace(ident: str):
    return ident.replace(" ", "")
