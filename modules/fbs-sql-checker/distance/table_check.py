import sqlparse
import constants as c
import table_distance as tab_dist
import format as f
import re

ref_tab_name: list[str] = []
query_tab_name: list[str] = []

ref_alias_map: dict[str, str] = {}
query_alias_map: dict[str, str] = {}

ref_join_list: list[str] = []
query_join_list: list[str] = []

ref_comp_list: list[str] = []
query_comp_list: list[str] = []

ref_order_list: list[str] = []
query_order_list: list[str] = []

ref_group_list: list[str] = []
query_group_list: list[str] = []

ref_having_list: list[str] = []
query_having_list: list[str] = []


def extract_tables(ref, query):
    _token_iteration(ref, ref_alias_map, ref_tab_name, ref_join_list, 
                     ref_comp_list, ref_order_list, ref_group_list,
                     ref_having_list)
    _token_iteration(query, query_alias_map, query_tab_name, 
                     query_join_list, query_comp_list, query_order_list,
                     query_group_list, query_having_list)

    print(f"REF ALIAS {ref_alias_map}, QUE ALIAS {query_alias_map}\n")
    print(f"REF TAB {ref_tab_name}, QUE TAB {query_tab_name}")

    from_distance = tab_dist.get_from_clause_distance(ref_tab_name, query_tab_name, ref_join_list, query_join_list)

    print(f"REF COMP {ref_comp_list}, QUE COMP {query_comp_list}")

    comparison_distance = tab_dist.comparison_distance(ref_comp_list, query_comp_list)

    print(f"REF JOIN/WHERE {ref_join_list}, QUE JOIN/WHERE {query_join_list}")

    print(f"REF ORDER BY {ref_order_list}, QUE ORDER BY {query_order_list}")

    print(f"REF GROUP BY {ref_group_list}, QUE GROUP By {query_group_list}")

    order_distance = tab_dist.group_and_order_by_distance(ref_order_list, query_order_list)
    print("order dist", order_distance)

    group_by_distance = tab_dist.group_and_order_by_distance(ref_group_list, query_group_list)
    print("group_by_distance dist", group_by_distance)

    print(f"REF having_distance {ref_having_list}, QUE having_distance {query_having_list}")
    having_distance = tab_dist.comparison_distance(ref_having_list, query_having_list)
    print("having_distance dist", having_distance)
    return from_distance + comparison_distance + order_distance + group_by_distance + having_distance


def _token_iteration(tokens: sqlparse.sql.Statement, tab_map: dict, name_list: list, join_list: list, comp_list: list,
                     order_list: list, group_list: list, having_list: list):
    for i, token in enumerate(tokens):
        if isinstance(token, sqlparse.sql.Token):
            _extract_from(token, tokens, i, tab_map, name_list)

            _extract_join(token, tokens, i, tab_map, name_list, join_list)

            _extract_on(token, tokens, i, comp_list)

            _extract_where(token, comp_list, join_list)

            # extract attributes and iterate through group by clause    
            _extract_group_by(token, tokens, i, group_list, having_list)
            # extract attributes inside order by clause
            _extract_order_by(token, tokens, i, order_list)


def _extract_from(token: sqlparse.sql.Token, tokens, i, tab_map, name_list):
    if token.ttype == sqlparse.tokens.Keyword and token.value == c.FROM:
        next_token = tokens[i + 2] # +2 to bypass whitespace token
        if isinstance(next_token, sqlparse.sql.Identifier):
            _extract_table_elements(next_token, tab_map, name_list)
        elif isinstance(next_token, sqlparse.sql.IdentifierList):
            for t in list[sqlparse.sql.Identifier](next_token.get_identifiers()):
                _extract_table_elements(t, tab_map, name_list)


def _extract_join(token: sqlparse.sql.Token, tokens, i, tab_map, name_list, join_list):
    if token.ttype == sqlparse.tokens.Keyword and token.value in c.JOIN_TYPES:
        next_token = tokens[i + 2]
        _extract_table_elements(next_token, tab_map, name_list)
        join_list.append(token.value)


def _extract_on(token: sqlparse.sql.Token, tokens, i ,comp_list):
    if token.ttype == sqlparse.tokens.Keyword and token.value == c.ON:
        next_token = tokens[i + 2]
        if isinstance(next_token, sqlparse.sql.Comparison):
            comp_list.append(f.format_comp_db_name(next_token.value))


def _extract_where(token: sqlparse.sql.Token, comp_list, join_list):
    if isinstance(token, sqlparse.sql.Where):
        for t in token.tokens:
            if isinstance(t, sqlparse.sql.Comparison):
                comp_list.append(f.format_comp_db_name(t.value))
        join_list.append(token.token_first().value) 


def _extract_group_by(token: sqlparse.sql.Token, tokens, i, group_list, having_list):
    if token.ttype == sqlparse.tokens.Keyword and token.value == c.GROUP_BY:
        j = i + 1
        while j < len(tokens):
            t = tokens[j]
            if isinstance(t, sqlparse.sql.Token):
                if isinstance(tokens[j], (
                        sqlparse.sql.IdentifierList, sqlparse.sql.Identifier, sqlparse.sql.Operation,
                        sqlparse.sql.Function, sqlparse.sql.Parenthesis)):
                    _extract_group_by_attributes(tokens[j], group_list)
                    j += 1
                # iterating through having tokens
                _extract_having(tokens, j, having_list)
                # check if the query is over or it still has other tokens
                if (t.ttype == sqlparse.tokens.Keyword and (t.value == c.ORDER_BY or t.value == c.HAVING)) or (
                        t.ttype == sqlparse.tokens.Punctuation and t.value == ";"):
                    break
            j += 1

def _extract_having(tokens, j, having_list):
    if tokens[j].ttype == sqlparse.tokens.Keyword and tokens[j].value == c.HAVING:
        k = j + 1
        while k < len(tokens):
            if isinstance(tokens[k], sqlparse.sql.Token):
                if isinstance(tokens[k], sqlparse.sql.Comparison):
                    having_list.append(f.format_comp_db_name(tokens[k].value))
                    k += 1
                if (tokens[k].ttype == sqlparse.tokens.Keyword and tokens[
                    k].value == c.ORDER_BY) or (
                        tokens[k].ttype == sqlparse.tokens.Punctuation and tokens[k].value == ";"):
                    break
            k += 1
        j += 1


def _extract_order_by(token, tokens, i, order_list):
    if token.ttype == sqlparse.tokens.Keyword and token.value == c.ORDER_BY:
        j = i + 1
        while j < len(tokens):
            if isinstance(tokens[j], sqlparse.sql.Token):
                if isinstance(tokens[j], sqlparse.sql.IdentifierList):
                    for t in tokens[j]:
                        _extract_order_by_attributes(t, order_list)
                if isinstance(tokens[j], (
                        sqlparse.sql.Identifier, sqlparse.sql.Operation, sqlparse.sql.Function,
                        sqlparse.sql.Parenthesis, sqlparse.sql.Comparison)):
                    _extract_order_by_attributes(tokens[j], order_list)
                    j += 1
            j += 1


def _extract_table_elements(token, tab_map, name_list: list):
    if isinstance(token, sqlparse.sql.Identifier):
        if token.has_alias():
            tab_map[token.get_real_name()] = token.get_alias()
            name_list.append(token.get_real_name())
        else:
            name_list.append(token.value)


def _extract_order_by_attributes(token, order_list: list):
    if isinstance(token, (
            sqlparse.sql.Identifier, sqlparse.sql.Operation, sqlparse.sql.Function, sqlparse.sql.Parenthesis,
            sqlparse.sql.Comparison)):
        if re.search(c.DESC, token.value):
            order_list.append(re.sub(c.DESC, "", f.format_db_name(token.value)).strip())
            order_list.append("desc")
        elif re.search(c.ASC, token.value):
            order_list.append(re.sub(c.ASC, "", f.format_db_name(token.value)).strip())
        else:
            order_list.append(f.format_db_name(token.value).strip())


def _extract_group_by_attributes(token, order_list: list):
    if isinstance(token,
                  (sqlparse.sql.Identifier, sqlparse.sql.Operation, sqlparse.sql.Function, sqlparse.sql.Parenthesis)):
        order_list.append(f.format_db_name(token.value))
    if isinstance(token, sqlparse.sql.IdentifierList):
        for t in token:
            if isinstance(t, sqlparse.sql.Identifier):
                order_list.append(f.format_db_name(t.value))
