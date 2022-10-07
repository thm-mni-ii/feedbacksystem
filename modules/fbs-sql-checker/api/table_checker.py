# table_checker.py

from parser import parse_query
import formatting as f

# Return a single From and a where-clause
def is_single_from_where(json_file):
    list_tables = []
    if not (f.is_string(json_file)) and (f.is_from(json_file)):
        if isinstance(json_file["from"], str):
            if json_file["from"].count(json_file["from"]) == 1:
                list_tables.append(json_file["from"].lower())
        if isinstance(json_file["from"], dict):
            if "value" in json_file["from"]:
                if isinstance(json_file["from"]["value"], str):
                    list_tables.append(json_file["from"]["value"].lower())
    for val in json_file:
        if val == "where":
            if isinstance(json_file[val], list):
                for val1 in json_file[val]:
                    if val1 == "in":
                        for i in range(len(json_file[val][val1])):
                            list_tables.extend(
                                is_single_from_where(json_file[val][val1][i])
                            )
            elif isinstance(json_file[val], dict):
                for val1 in json_file["where"]:
                    for val2 in json_file["where"][val1]:
                        if val2 == "exists":
                            if isinstance(json_file["where"][val1][val2], dict):
                                if (
                                    is_single_from_where(json_file["where"][val1][val2])
                                ) and (
                                    is_single_from_where(json_file["where"][val1][val2])
                                    not in list_tables
                                ):
                                    list_tables.extend(
                                        is_single_from_where(
                                            json_file["where"][val1][val2]
                                        )
                                    )
                    if isinstance(json_file["where"][val1], list):
                        if len(json_file["where"][val1]) > 1:
                            if isinstance(json_file["where"][val1][1], dict):
                                if (is_single_from_where(val2)) and (
                                    is_single_from_where(val2) is not None
                                ):
                                    for elem in is_single_from_where(val2):
                                        if elem not in list_tables:
                                            list_tables.append(elem)
                                elif (
                                    (is_join(val2))
                                    and (is_join(val2) not in list_tables)
                                    and (is_join(val2) is not None)
                                ):
                                    list_tables.append(is_join(val2))
    if (
        (is_join(json_file))
        and (is_join(json_file) not in list_tables)
        and (is_join(json_file) is not None)
    ):
        for elem in is_join(json_file):
            if elem not in list_tables:
                list_tables.append(elem)
    return list_tables


# Return Tables as a List if there is a join --> works for a python List too
def is_join(json_file):  # pylint: disable=R1710
    list_tables = []
    list_joins = []
    return_list = []
    is_join_var = False
    join_type = ""
    if not (f.is_string(json_file)) and (f.is_from(json_file)):
        for val in json_file["from"]:
            if (
                (isinstance(val, str))
                and ((val not in "value") and (val not in "name"))
                and (len(val) > 1)
            ):
                list_tables.append(val.lower())
            if isinstance(val, dict):
                for element in val:
                    if element == "value":
                        list_tables.append(val[element].lower())
                    if isinstance(val[element], str) and (
                        (element not in "name") and (element not in "using")
                    ):
                        list_tables.append(val[element].lower())
                    if is_join_var is True:
                        for val1 in val[element]:
                            insert = []
                            insert.append(join_type)
                            for val in val[element][val1]:  # pylint: disable=W0621
                                insert.append(val)
                            list_joins.append(insert)
                        is_join_var = False
                    if (
                        element in "inner join"
                        or element in "left join"
                        or element in "join"
                        or element in "right join"
                        or element in "outer join"
                    ):
                        is_join_var = True
                        join_type = element
                        for val1 in val[element]:
                            if val1 == "value":
                                list_tables.append(val[element][val1].lower())
            if val == "value":
                if isinstance(json_file["from"]["value"], dict):
                    if (
                        (
                            is_single_from_where(json_file["from"]["value"])
                            not in list_tables
                        )
                        and (
                            is_single_from_where(json_file["from"]["value"]) is not None
                        )
                        and (is_single_from_where(json_file["from"]["value"]))
                    ):
                        list_tables.extend(
                            is_single_from_where(json_file["from"]["value"])
                        )
                for elem in json_file["from"]["value"]:  # pylint: disable=W0612
                    if (
                        (is_union(json_file["from"]["value"]) is not None)
                        and (is_union(json_file["from"]["value"]))
                        and (is_union(json_file["from"]["value"]) not in list_tables)
                    ):
                        list_tables.extend(is_union(json_file["from"]["value"]))
                    if (
                        (is_join(json_file["from"]["value"]) is not None)
                        and (is_join(json_file["from"]["value"]))
                        and (is_join(json_file["from"]["value"]) not in list_tables)
                    ):
                        list_tables.extend(is_join(json_file["from"]["value"]))
        return_list.append(sorted(list(set(list_tables))))
        return_list.append(list_joins)
        return return_list


# Returns tables as a List if it is a union
def is_union(json_file):  # pylint: disable=R1710
    list_tables = []
    if not f.is_string(json_file):
        for val in json_file:
            if val == "union":
                for i in range(len(json_file[val])):
                    if (is_single_from_where(json_file[val][i])) is not None:
                        list_tables.extend(is_single_from_where(json_file[val][i]))
                    else:
                        list_tables.append(is_join(json_file[val][i]))
                return sorted(set(list_tables))
            return None


# return tables for a statement and uses therefor different arts of sql-statements
def extract_tables(json_file, client):
    json_file = parse_query(json_file, client)
    try:
        if is_single_from_where(json_file) is not None and is_single_from_where(
            json_file
        ):
            tables = is_single_from_where(json_file)
        elif (
            is_join(json_file) is not None
            and is_join(json_file) is not []  # pylint: disable=R0123
        ):  # pylint: disable=R0123
            tables = is_join(json_file)
        else:
            tables = is_union(json_file)
    except Exception:
        tables = ["Unknown"]
    # Gibt Indexerror bei falschen Queries
    if type(tables[0]) == str:  # pylint: disable=C0123
        tables[0] = [tables[0]]
    if len(tables) < 2:
        tables.append("Empty")
    if len(tables[1]) == 0:
        tables[1].append("Empty")
    return tables
