import re
import sqlparse
from . import constants as c


def format_alias(ident: str):
    # check ident with pattern to get the alias keyword and alias name
    regex = re.compile(c.ALIAS_REGEX, re.IGNORECASE)
    match = regex.search(ident)

    if match:
        # flag is used for case sensitivity
        ident = re.sub(c.ALIAS_REGEX, "", ident).strip()
    return ident


def format_distinct(ident: str):
    if ident.__contains__(c.DISTINCT):
        ident = ident.replace(c.DISTINCT, "").strip()
    return ident


def format_command(ident: sqlparse.sql.Identifier):
    # get_real_name() function returns the select command and will get removed along the alias and the 'as' keyword
    formatted = ident.value.replace(ident.get_real_name(), "").replace("(", "").replace(")", "")
    return formatted


# remove database name e.g.: db.id and special characters 
def format_query(ident: str):
    return re.sub(c.FORMATTING_REGEX, "", ident).strip().lower()


def format_parenthesis(ident: str):
    return re.sub(c.PARENTHESIS_REGEX, "", ident).strip()


def format_whitespace(ident: str):
    return ident.replace(" ", "")


def format_like(ident: str):
    if f"{c.NOT} {c.LIKE}" in ident:
        ident = ident.replace(f"{c.NOT} {c.LIKE}", '!=')
    elif c.LIKE in ident:
        ident = ident.replace(c.LIKE, '=')
    return ident