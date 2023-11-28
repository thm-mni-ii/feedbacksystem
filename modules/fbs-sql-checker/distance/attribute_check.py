import sqlparse
import constants as c
import attribute_distance as att_dist
import format as f

ref_pro_att: list[str] = []
query_pro_att: list[str] = []

ref_cmd_list: list[str] = []
query_cmd_list: list[str] = []

ref_map: dict[str, dict[str, str]] = {}
query_map: dict[str, dict[str, str]] = {}


def extract_attributes(ref, query):
    _token_iteration(ref, ref_map, ref_pro_att, ref_cmd_list)
    _token_iteration(query, query_map, query_pro_att, query_cmd_list)

    print(f"REF MAP: {ref_map}\nQuery Map: {query_map}\n")
    print("Projection attributes before order: ", ref_pro_att, query_pro_att)

    print(f"COMMAND LIST HERE {ref_cmd_list}, QUERY {query_cmd_list}")

    attribute_distance = att_dist.get_attributes_distance(ref_pro_att, query_pro_att)

    print("Projection attributes after order: ", ref_pro_att, query_pro_att, "\n")

    command_distance = att_dist.get_command_distance(ref_cmd_list, query_cmd_list)

    keyword_distance = att_dist.get_keyword_distance(ref_map, query_map)

    print(f"attributes: {attribute_distance}, command: {command_distance}, keywordw: {keyword_distance}")

    return attribute_distance + command_distance + keyword_distance


def _token_iteration(tokens, map_dict, pro_att_list, cmd_list):
    for i, token in enumerate(tokens):
        if isinstance(token, sqlparse.sql.Token):
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
                        _extract_att_and_cmds(t, map_dict, pro_att_list, cmd_list)
                if isinstance(token, (
                        sqlparse.sql.Identifier, sqlparse.sql.Function, sqlparse.sql.Operation,
                        sqlparse.sql.Parenthesis)):
                    _extract_att_and_cmds(token, map_dict, pro_att_list, cmd_list)
                if token.ttype == sqlparse.tokens.Keyword and token.value == c.FROM:
                    break


def _extract_att_and_cmds(token, map_dict, pro_att_list, cmd_list):
    _extract_alias(token, map_dict)
    if isinstance(token, (sqlparse.sql.Operation, sqlparse.sql.Parenthesis)):
        pro_att_list.append(token.value)
    if isinstance(token, sqlparse.sql.Function):
        params = [p.value for p in token.get_parameters()]
        cmd_list.append(token.get_real_name())
        pro_att_list.append(params[0])
        if token.value.__contains__(c.DISTINCT):
            _extract_keyword(f.format_command(token), map_dict)
    if isinstance(token, sqlparse.sql.Identifier):
        if str(token.get_real_name()).upper() in [cmd for cmd in c.SELECT_CMDS]:
            cmd_list.append(token.get_real_name())
            pro_att_list.append(f.format_alias(f.format_distinct(f.format_db_name(f.format_command(token)))))
            if token.value.__contains__(c.DISTINCT):
                _extract_keyword(f.format_command(token), map_dict)
        else:
            pro_att_list.append(f.format_distinct(f.format_db_name(f.format_alias(token.value))))


def _extract_alias(ident: sqlparse.sql.Identifier, map_dict):
    if ident.has_alias():
        updated_ident = f.format_alias(f.format_db_name(ident.value))
        # token first will extract the attribute without its alias
        _add_to_map(map_dict, c.ALIAS, updated_ident, ident.get_alias())


def _extract_keyword(ident, map_dict):
    if isinstance(ident, sqlparse.sql.IdentifierList):
        ident_list = list[sqlparse.sql.Identifier](ident.get_identifiers())
        # get all the identifiers that are referred to the distinct keyword. (alias gets formatted and removed)
        result = ", ".join(f.format_db_name(f.format_alias(i.value)) for i in ident_list)
        _add_to_map(map_dict, c.KEYWORD, c.DISTINCT, result)
    else:
        # remove trailing alias or distinct keyword to add only the attribute to the map
        updated_value = f.format_distinct(f.format_db_name(f.format_alias(ident)))
        _add_to_map(map_dict, c.KEYWORD, c.DISTINCT, updated_value)


def _add_to_map(map_dict, key, inner_key, value):
    if key not in map_dict:
        map_dict[key] = {}
    map_dict[key][inner_key] = value
