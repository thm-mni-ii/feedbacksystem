import sqlparse
from . import constants as c
from . import attribute_distance as att_dist
from . import format as f
from . import result_log as log


def extract_attributes(ref, query):

    ref_pro_att: list[str] = []
    query_pro_att: list[str] = []

    ref_cmd_list: list[str] = []
    query_cmd_list: list[str] = []

    ref_distinct_list: list[str] = []
    query_distinct_list: list[str] = []

    ref_map: dict[str, dict[str, str]] = {}
    query_map: dict[str, dict[str, str]] = {}
    _token_iteration(ref, ref_map, ref_pro_att, ref_cmd_list, ref_distinct_list)
    _token_iteration(
        query, query_map, query_pro_att, query_cmd_list, query_distinct_list
    )

    log.write_to_log(
        f"attribute aliases: reference: {ref_map}; query: {query_map}\n\nattributes before order: reference: {ref_pro_att}; query: {query_pro_att}\n"
    )

    attribute_distance = att_dist.get_attributes_distance(ref_pro_att, query_pro_att)

    log.write_to_log(
        f"attributes after order: reference: {ref_pro_att}; query: {query_pro_att}\n"
    )
    log.write_to_log(
        f"command list: reference: {ref_cmd_list}; query: {query_cmd_list}\n"
    )

    command_distance = att_dist.get_command_distance(ref_cmd_list, query_cmd_list)

    keyword_distance = att_dist.get_keyword_distance(
        ref_distinct_list, query_distinct_list
    )

    log.write_to_log(
        f"distinct list: reference: {ref_distinct_list}; query {query_distinct_list}\n"
    )

    log.write_to_log(
        f"Distance: attributes = {attribute_distance}, commands = {command_distance}, keywords = {keyword_distance}\n"
    )

    return attribute_distance + command_distance + keyword_distance


def _token_iteration(tokens, map_dict, pro_att_list, cmd_list, distinct_list):
    for i, token in enumerate(tokens):
        if isinstance(token, sqlparse.sql.Token):
            # bypass token if it represents a whitespace or a newline
            if (
                token.ttype == sqlparse.tokens.Whitespace
                or token.ttype == sqlparse.tokens.Newline
            ):
                continue
            # check if token represents distinct
            if token.ttype == sqlparse.tokens.Keyword and token.value == c.DISTINCT:
                _extract_keyword(tokens[i + 2], distinct_list)
            # wildcard represents *. Iteration breaks after this step
            if token.ttype == sqlparse.tokens.Wildcard:
                pro_att_list.append(token.value)
                break
            # iterate through the identifier list to extract each individual attribute
            if isinstance(token, sqlparse.sql.IdentifierList):
                for t in token.get_identifiers():
                    _extract_att_and_cmds(
                        t, map_dict, pro_att_list, cmd_list, distinct_list
                    )
            # case if attributes are wrapped inside Parenthesis
            if isinstance(token, sqlparse.sql.Parenthesis):
                _extract_parenthesis(
                    token, map_dict, pro_att_list, cmd_list, distinct_list
                )
            # extract attributes based on their type
            if isinstance(
                token,
                (
                    sqlparse.sql.Identifier,
                    sqlparse.sql.Function,
                    sqlparse.sql.Operation,
                ),
            ):
                _extract_att_and_cmds(
                    token, map_dict, pro_att_list, cmd_list, distinct_list
                )
            # break iteration if it reaches the from clause
            if token.ttype == sqlparse.tokens.Keyword and token.value == c.FROM:
                break


def _extract_att_and_cmds(token, map_dict, pro_att_list, cmd_list, distinct_list):
    if isinstance(token, sqlparse.sql.Operation):
        pro_att_list.append(f.format_whitespace(token.value))
    if isinstance(token, sqlparse.sql.Function):
        _extract_functions(token, map_dict, pro_att_list, cmd_list, distinct_list)
    if isinstance(token, sqlparse.sql.Identifier):
        _extract_identifier(token, map_dict, pro_att_list, cmd_list, distinct_list)
    if isinstance(token, sqlparse.sql.Parenthesis):
        _extract_parenthesis(token, map_dict, pro_att_list, cmd_list, distinct_list)


def _extract_parenthesis(token, map_dict, pro_att_list, cmd_list, distinct_list):
    for t in token.tokens:
        if isinstance(t, sqlparse.sql.IdentifierList):
            for ident in t.get_identifiers():
                _extract_att_and_cmds(
                    ident, map_dict, pro_att_list, cmd_list, distinct_list
                )
        else:
            _extract_att_and_cmds(t, map_dict, pro_att_list, cmd_list, distinct_list)


def _extract_identifier(token, map_dict, pro_att_list, cmd_list, distinct_list):
    # commands with aliases are considered as identifier and can only be extracted this way
    if str(token.get_real_name()) in [cmd for cmd in c.SELECT_CMDS]:
        # save alias
        _extract_alias(token, map_dict)
        # save used command
        cmd_list.append(f.format_whitespace(str(token.get_real_name())))
        # save attribute after formatting
        pro_att_list.append(
            f.format_whitespace(
                f.format_alias(f.format_distinct((f.format_command(token))))
            )
        )
        # check for distinct keyword and save the attributes used after it
        if token.value.__contains__(c.DISTINCT):
            _extract_keyword(f.format_command(token), distinct_list)
    else:
        pro_att_list.append(f.format_distinct((f.format_alias(token.value))))
        _extract_alias(token, map_dict)


def _extract_functions(token, map_dict, pro_att_list, cmd_list, distinct_list):
    _extract_alias(token, map_dict)
    if isinstance(token, sqlparse.sql.Function):
        # save command used to list
        cmd_list.append(str(token.get_real_name()))
        # save attribute or attributes used inside the command
        for p in token.tokens[1]:
            if isinstance(p, sqlparse.sql.Identifier):
                pro_att_list.append(p.value)
            elif isinstance(p, sqlparse.sql.IdentifierList):
                pro_att_list.append(f.format_whitespace(p.value))
        # check for distinct keyword and save the attributes used after it
        if token.value.__contains__(c.DISTINCT):
            _extract_keyword(f.format_command(token), distinct_list)


def _extract_alias(ident: sqlparse.sql.Identifier, map_dict):
    if ident.has_alias():
        updated_ident = f.format_alias((ident.value))
        _add_to_map(map_dict, c.ALIAS, updated_ident, ident.get_alias())


def _extract_keyword(ident, distinct_list):
    if isinstance(ident, sqlparse.sql.IdentifierList):
        ident_list = list[sqlparse.sql.Identifier](ident.get_identifiers())
        # get all the identifiers that are referred to the distinct keyword. (alias gets formatted and removed)
        result = ", ".join(
            f.format_whitespace((f.format_alias(i.value.lower()))) for i in ident_list
        )
        distinct_list.append(result)
    else:
        # remove trailing alias or distinct keyword to add only the attribute to the map
        updated_value = f.format_distinct((f.format_alias(str(ident))))
        distinct_list.append(updated_value)


def _add_to_map(map_dict, key, inner_key, value):
    if key not in map_dict:
        map_dict[key] = {}
    map_dict[key][inner_key] = value
