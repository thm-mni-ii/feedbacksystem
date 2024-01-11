import sqlparse
import constants as c
import attribute_distance as att_dist
import format as f

ref_pro_att: list[str] = []
query_pro_att: list[str] = []

ref_cmd_list: list[str] = []
query_cmd_list: list[str] = []

ref_distinct_list: list[str] = []
query_distinct_list: list[str] = []

ref_map: dict[str, dict[str, str]] = {}
query_map: dict[str, dict[str, str]] = {}


def extract_attributes(ref, query):
    _token_iteration(ref, ref_map, ref_pro_att, ref_cmd_list, ref_distinct_list)
    _token_iteration(query, query_map, query_pro_att, query_cmd_list, query_distinct_list)

    print(f"REF MAP: {ref_map}\nQuery Map: {query_map}\n")
    print("Projection attributes before order: ", ref_pro_att, query_pro_att)

    print(f"COMMAND LIST HERE {ref_cmd_list}, QUERY {query_cmd_list}")

    attribute_distance = att_dist.get_attributes_distance(ref_pro_att, query_pro_att)

    print("Projection attributes after order: ", ref_pro_att, query_pro_att, "\n")

    command_distance = att_dist.get_command_distance(ref_cmd_list, query_cmd_list)

    keyword_distance = att_dist.get_keyword_distance(ref_distinct_list, query_distinct_list)

    print(f"Ref distinct list {ref_distinct_list} Query distinct list {query_distinct_list}")

    print(f"attributes: {attribute_distance}, command: {command_distance}, keyword: {keyword_distance}")

    return attribute_distance + command_distance + keyword_distance


def _token_iteration(tokens, map_dict, pro_att_list, cmd_list, distinct_list):
    for i, token in enumerate(tokens):
        if isinstance(token, sqlparse.sql.Token):
            if token.ttype == sqlparse.tokens.Whitespace or token.ttype == sqlparse.tokens.Newline:
                continue
            if token.ttype == sqlparse.tokens.Keyword and token.value == c.DISTINCT:
                _extract_keyword(tokens[i + 2], map_dict)
            if token.ttype == sqlparse.tokens.Wildcard:
                pro_att_list.append(token.value)
                break
            if isinstance(token, sqlparse.sql.IdentifierList):
                for t in token.get_identifiers():
                    _extract_att_and_cmds(t, map_dict, pro_att_list, cmd_list, distinct_list)
            if isinstance(token, sqlparse.sql.Parenthesis):
                _extract_parenthesis(token, map_dict, pro_att_list, cmd_list, distinct_list)                      
            if isinstance(token, (sqlparse.sql.Identifier, sqlparse.sql.Function, sqlparse.sql.Operation)):
                _extract_att_and_cmds(token, map_dict, pro_att_list, cmd_list, distinct_list)
            if token.ttype == sqlparse.tokens.Keyword and token.value == c.FROM:
                break


def _extract_att_and_cmds(token, map_dict, pro_att_list, cmd_list, distinct_list):
    if isinstance(token, sqlparse.sql.Operation):
        pro_att_list.append(f.format_whitespace(token.value))   
    if isinstance(token, sqlparse.sql.Function):
        _extract_functions(token, map_dict, pro_att_list, cmd_list, distinct_list)
    if isinstance(token, sqlparse.sql.Identifier):
        _extract_identifier(token, map_dict, pro_att_list, cmd_list, distinct_list)


def _extract_parenthesis(token, map_dict, pro_att_list, cmd_list, distinct_list):
    for t in token.tokens:
        if isinstance(t, sqlparse.sql.IdentifierList):
            for ident in t.get_identifiers():
                _extract_att_and_cmds(ident, map_dict, pro_att_list, cmd_list, distinct_list)
        else:
            _extract_att_and_cmds(t, map_dict, pro_att_list, cmd_list, distinct_list)       


def _extract_identifier(token, map_dict, pro_att_list, cmd_list, distinct_list):
    # commands with aliases are considered as identifier and can only be extracted this way
    if str(token.get_real_name()).upper() in [cmd for cmd in c.SELECT_CMDS]:
        _extract_alias(token, map_dict)
        cmd_list.append(f.format_whitespace(str(token.get_real_name()).upper()))
        pro_att_list.append(f.format_whitespace(f.format_alias(f.format_distinct(f.format_db_name(f.format_command(token))))))
        if token.value.__contains__(c.DISTINCT):
            _extract_keyword(f.format_command(token), distinct_list)
    else:
        pro_att_list.append(f.format_distinct(f.format_db_name(f.format_alias(token.value))))
        _extract_alias(token, map_dict)
            

def _extract_functions(token, map_dict, pro_att_list, cmd_list, distinct_list):
    _extract_alias(token, map_dict)
    if isinstance(token, sqlparse.sql.Function):
        cmd_list.append(str(token.get_real_name()).upper())   
        for p in token.tokens[1]:
            if isinstance(p, sqlparse.sql.Identifier):
                pro_att_list.append(p.value)
            elif isinstance(p, sqlparse.sql.IdentifierList):
                pro_att_list.append(f.format_whitespace(p.value))
        if token.value.__contains__(c.DISTINCT):
            _extract_keyword(f.format_command(token), distinct_list)


def _extract_alias(ident: sqlparse.sql.Identifier, map_dict):
    if ident.has_alias():
        updated_ident = f.format_alias(f.format_db_name(ident.value))
        _add_to_map(map_dict, c.ALIAS, updated_ident, ident.get_alias())


def _extract_keyword(ident, distinct_list):
    if isinstance(ident, sqlparse.sql.IdentifierList):
        ident_list = list[sqlparse.sql.Identifier](ident.get_identifiers())
        # get all the identifiers that are referred to the distinct keyword. (alias gets formatted and removed)
        result = ", ".join(f.format_whitespace(f.format_db_name(f.format_alias(i.value.lower()))) for i in ident_list)
        distinct_list.append(result)
    else:
        # remove trailing alias or distinct keyword to add only the attribute to the map
        updated_value = f.format_distinct(f.format_db_name(f.format_alias(ident)))
        distinct_list.append(updated_value)


def _add_to_map(map_dict, key, inner_key, value):
    if key not in map_dict:
        map_dict[key] = {}
    map_dict[key][inner_key] = value
