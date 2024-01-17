import sqlparse
import constants as c
import table_distance as tab_dist
import format as f
import re
import result_log as log

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

    #print(f"REF ALIAS {ref_alias_map}, QUE ALIAS {query_alias_map}\n")
    #print(f"REF TAB {ref_tab_name}, QUE TAB {query_tab_name}")

    from_distance = tab_dist.get_from_clause_distance(ref_tab_name, query_tab_name, ref_join_list, query_join_list)

    log.write_to_log(f"tables used: reference: {ref_tab_name}; query: {query_tab_name}\n")
    log.write_to_log(f"reference table aliases: {ref_alias_map}; query table aliases {query_alias_map}\n")
    log.write_to_log(f"data retrieval clause: reference: {ref_join_list}; query: {query_join_list}\n")
    log.write_to_log(f"comparison equations: reference: {ref_comp_list}; query: {query_comp_list}\n")
    log.write_to_log(f"group by attributes: reference: {ref_group_list}; query: {query_group_list}\n")
    log.write_to_log(f"having attributes: reference: {ref_having_list}; query: {query_having_list}\n")
    log.write_to_log(f"order by attributes: reference: {ref_order_list}; query: {query_order_list}\n")


    #print(f"REF COMP {ref_comp_list}, QUE COMP {query_comp_list}")

    comparison_distance = tab_dist.comparison_distance(ref_comp_list, query_comp_list)
    
    #print("comparison_distance", comparison_distance)
#
    #print(f"REF JOIN/WHERE {ref_join_list}, QUE JOIN/WHERE {query_join_list}")
#
    #print(f"REF ORDER BY {ref_order_list}, QUE ORDER BY {query_order_list}")
#
    #print(f"REF GROUP BY {ref_group_list}, QUE GROUP By {query_group_list}")

    order_distance = tab_dist.group_and_order_by_distance(ref_order_list, query_order_list)
    #print("order dist", order_distance)

    group_by_distance = tab_dist.group_and_order_by_distance(ref_group_list, query_group_list)
    #print("group_by_distance dist", group_by_distance)

    #print(f"REF having_distance {ref_having_list}, QUE having_distance {query_having_list}")
    having_distance = tab_dist.group_and_order_by_distance(ref_having_list, query_having_list)
    #print("having_distance dist", having_distance)

    log.write_to_log(f"Distance: table and data retrieval clause = {from_distance}, comparison equations = {comparison_distance}, group by = {group_by_distance}, having = {having_distance}, order by = {order_distance}\n")

    return from_distance + comparison_distance + order_distance + group_by_distance + having_distance


def _token_iteration(tokens: sqlparse.sql.Statement, tab_map: dict, name_list: list, join_list: list, comp_list: list,
                     order_list: list, group_list: list, having_list: list):
    for i, token in enumerate(tokens):
        if isinstance(token, sqlparse.sql.Token):
            # Parenthesis check
            if isinstance(token, sqlparse.sql.Parenthesis):
                #TODO: iterate through elements inside Parenthesis
                #print("Parenthesis error")
                continue
            # check and extract tables used after the FROM keyword
            if token.ttype == sqlparse.tokens.Keyword and token.value == c.FROM:
                _extract_from(tokens, i, tab_map, name_list)
            # check and extract the JOIN keywords and tables used after it 
            if token.ttype == sqlparse.tokens.Keyword and token.value in c.JOIN_TYPES:
                _extract_join(token, tokens, i, tab_map, name_list, join_list)
            # check and extract the comparison equations after ON condition
            if token.ttype == sqlparse.tokens.Keyword and token.value == c.ON:
                _extract_on(tokens, i, comp_list)
            # check and extract the WHERE keyword and comparison equations after it
            if isinstance(token, sqlparse.sql.Where):
                _extract_where(token, comp_list, join_list)
            # check and extract attributes and iterate through group by clause  
            if token.ttype == sqlparse.tokens.Keyword and token.value == c.GROUP_BY:  
                _extract_group_by(tokens, i, group_list, having_list)
            # extract attributes inside order by clause  
            if token.ttype == sqlparse.tokens.Keyword and token.value == c.ORDER_BY:
                _extract_order_by(tokens, i, order_list)



def _extract_from(tokens, i, tab_map, name_list):
    next_token = tokens[i + 2] # +2 to bypass whitespace token
    # if singular table used, append it to list
    if isinstance(next_token, sqlparse.sql.Identifier):
        _extract_table_elements(next_token, tab_map, name_list)
    # if multiple tables used, iterate through them and save them to list
    elif isinstance(next_token, sqlparse.sql.IdentifierList):
        for t in list[sqlparse.sql.Identifier](next_token.get_identifiers()):
            _extract_table_elements(t, tab_map, name_list)


def _extract_join(token: sqlparse.sql.Token, tokens, i, tab_map, name_list, join_list):
    next_token = tokens[i + 2]
    _extract_table_elements(next_token, tab_map, name_list)
    join_list.append(token.value)


def _extract_on(tokens, i, comp_list):
    next_token = tokens[i + 2] # +2 to avoid whitespace
    # Check if the next_token is a Comparison object from sqlparse
    if isinstance(next_token, sqlparse.sql.Comparison):
        # If it is a Comparison, format it to remove whitespaces
        # The formatted comparison is appended to comp_list
        comp_list.append(f.format_whitespace(next_token.value))


def _extract_where(token, comp_list, join_list):
    #print("extract where_ : ", token.value)
    for t in token.tokens:
        # add comparison to the list if found 
        if isinstance(t, sqlparse.sql.Comparison):
            #print("extr token comp ", t.tokens)
            comp_list.append(f.format_whitespace(t.value))
        # save everything inside a parenthesis
        if isinstance(t, sqlparse.sql.Parenthesis):
            #print(f"PARA {t.tokens}")
            comp_list.append(f.format_parenthesis(t.value))
        if t.ttype == sqlparse.tokens.Keyword and t.value == c.BETWEEN:
            # TODO: find a way to extract the identifier before the between and the two integer after them
            continue
    # append where keyword to the list of clauses 
    join_list.append(token.token_first().value) 


def _extract_group_by(tokens, i, group_list, having_list):
    j = i + 1
    # Loop through the tokens starting from the position after GROUP BY
    while j < len(tokens):
        t = tokens[j]
        if isinstance(t, sqlparse.sql.Token):
            # Check if the token is of a type that can be part of a GROUP BY clause
            if isinstance(tokens[j], (
                    sqlparse.sql.IdentifierList, sqlparse.sql.Identifier, 
                    sqlparse.sql.Operation, sqlparse.sql.Function, 
                    sqlparse.sql.Parenthesis)):
                # If so, extract the attributes from the token and add them to the group_list
                _extract_group_by_attributes(tokens[j], group_list)
                # Move to the next token
                j += 1
            # Check and extract any HAVING clause attributes
            _extract_having(t, tokens, j, having_list)
            # Check if the current token marks the end of the GROUP BY clause
            # This can be an ORDER BY or HAVING keyword, or a semicolon indicating the end of the query
            if (t.ttype == sqlparse.tokens.Keyword and (t.value == c.ORDER_BY or t.value == c.HAVING)) or \
               (t.ttype == sqlparse.tokens.Punctuation and t.value == ";"):
                break
        j += 1


def _extract_having(t, tokens, j, having_list):
    # Initialize k as the next index after j
    k = j + 1
    # Check if the current token is a HAVING keyword
    if t.ttype == sqlparse.tokens.Keyword and t.value == c.HAVING:
        # Loop through the tokens starting from index k
        while k < len(tokens):
            # Check if the current token is a valid SQL token
            if isinstance(tokens[k], sqlparse.sql.Token):
                # Check if the token is a Comparison type
                if isinstance(tokens[k], sqlparse.sql.Comparison):
                    # If it's a Comparison, format it and add to having_list
                    having_list.append(f.format_whitespace(tokens[k].value))
                    # Move to the next token after processing the Comparison
                    k += 1
                #print("inside", tokens)
                # Check if the token is an ORDER_BY keyword or a semicolon, indicating the end of the HAVING clause
                if (tokens[k].ttype == sqlparse.tokens.Keyword and tokens[k].value == c.ORDER_BY) or \
                   (tokens[k].ttype == sqlparse.tokens.Punctuation and tokens[k].value == ";"):
                    # Break the loop if ORDER_BY or semicolon is found
                    break
            # Increment k to move to the next token
            k += 1
        # Increment j at the end of the loop
        j += 1



def _extract_order_by(tokens, i, order_list):
    j = i + 1
    while j < len(tokens):
        if isinstance(tokens[j], sqlparse.sql.Token):
            # Check if the token is an IdentifierList (a list of identifiers)
            if isinstance(tokens[j], sqlparse.sql.IdentifierList):
                # Iterate through each sub-token in the IdentifierList
                for t in tokens[j]:
                    # Extract attributes from each sub-token and add them to the order_list
                    _extract_order_by_attributes(t, order_list)
            # Check if the token is one of the types that can be part of an ORDER BY clause
            if isinstance(tokens[j], (
                    sqlparse.sql.Identifier, sqlparse.sql.Operation, sqlparse.sql.Function,
                    sqlparse.sql.Parenthesis, sqlparse.sql.Comparison)):
                # Extract attributes from the token and add them to the order_list
                _extract_order_by_attributes(tokens[j], order_list)
                j += 1
        j += 1



def _extract_table_elements(token, tab_map, name_list: list):
    # Check if the token is an Identifier (e.g., a table name or a column name)
    if isinstance(token, sqlparse.sql.Identifier):
        # Check if the Identifier token has an alias
        if token.has_alias():
            # If there is an alias, map the real name of the table (or column) to its alias
            tab_map[token.get_real_name()] = token.get_alias()
            # Also, append the real name to the name list
            name_list.append(token.get_real_name())
        else:
            # If there is no alias, just append the value of the token (i.e., the name itself) to the list
            name_list.append(token.value)



def _extract_order_by_attributes(token, order_list: list):
    # Check if the token is of a type that can be part of an ORDER BY clause
    if isinstance(token, (
            sqlparse.sql.Identifier, sqlparse.sql.Operation, sqlparse.sql.Function, 
            sqlparse.sql.Parenthesis, sqlparse.sql.Comparison)):
        # Check if the token contains the DESC (descending order) keyword
        if re.search(c.DESC, token.value):
            # If DESC is found, remove it from the token, format the remaining string, and add it to the order list
            order_list.append(re.sub(c.DESC, "", f.format_whitespace(token.value.strip())))
            # Also, add the 'desc' keyword to indicate descending order
            order_list.append("desc")
        # Check if the token contains the ASC (ascending order) keyword
        elif re.search(c.ASC, token.value):
            # If ASC is found, remove it from the token, format the remaining string, and add it to the order list
            order_list.append(re.sub(c.ASC, "", f.format_whitespace(token.value.strip())))
        # If neither DESC nor ASC is found
        else:
            # Format the token's value and add it to the order list
            order_list.append(f.format_whitespace(token.value.strip()))


def _extract_group_by_attributes(token, group_list: list):
    # Check if the token is one of the types that can be part of a GROUP BY clause
    if isinstance(token, (sqlparse.sql.Identifier, sqlparse.sql.Operation, 
                          sqlparse.sql.Function, sqlparse.sql.Parenthesis)):
        # If it is, format its value to remove excess whitespace and add it to the list
        group_list.append(f.format_whitespace(token.value))

    # Check if the token is an IdentifierList (a list of identifiers)
    if isinstance(token, sqlparse.sql.IdentifierList):
        # Iterate through each sub-token in the IdentifierList
        for t in token:
            # Check if the sub-token is an Identifier
            if isinstance(t, sqlparse.sql.Identifier):
                # If it is, format its value and add it to the list
                group_list.append(f.format_whitespace(t.value))

