# sel_attribute_checker.py

from parser import parse_query
import pro_attribute_checker as AC

select_commands = [
    "sum",
    "count",
    "round",
    "distinct",
    "sec_to_time",
    "avg",
    "max",
    "min",
    "time_to_sec",
    "like",
    "between",
    "div",
    "year",
    "mul",
]
equals = ["eq", "neq", "gte", "gt", "lt", "lte"]

literal = []

# Returns SelectionAttributes as a list if there is a where
def select_where(json_file):
    list_tables = []
    if "where" in json_file:
        for val1 in json_file["where"]:
            if isinstance(json_file["where"][val1], str):
                if "." in json_file["where"][val1]:
                    list_tables.append(json_file["where"][val1].split(".")[1].lower())
                else:
                    list_tables.append(json_file["where"][val1].lower())
            if isinstance(json_file["where"][val1], dict):
                for val2 in json_file["where"][val1]:
                    if isinstance(val2, str):
                        if AC.single_select_dict(val2):
                            list_tables.extend(AC.single_select_dict(val2))
                        elif "." in val2:
                            list_tables.append(val2.split(".")[1].lower())
                        else:
                            list_tables.append(val2.lower())
            for i in range(len(json_file["where"][val1])):
                if isinstance(json_file["where"][val1][i], dict):
                    for val3 in json_file["where"][val1][i]:
                        if val3 in select_commands:
                            for val4 in json_file["where"][val1][i][val3]:
                                if isinstance(val4, str):
                                    if "." in val4:
                                        list_tables.append(val4.split(".")[1].lower())
                                    else:
                                        list_tables.append(val4.lower())
            if isinstance(json_file["where"][val1], list) and (
                len(json_file["where"][val1]) > 1
            ):
                if isinstance(json_file["where"][val1][1], dict):
                    if AC.single_select_dict(json_file["where"][val1][1]):
                        list_tables.extend(
                            AC.single_select_dict(json_file["where"][val1][1])
                        )
                    if "literal" in json_file["where"][val1][1]:
                        literal.append(json_file["where"][val1][1]["literal"])
                for elem in json_file["where"][val1]:
                    if isinstance(elem, str):
                        if "." in elem:
                            list_tables.append(elem.split(".")[1].lower())
                        else:
                            list_tables.append(elem.lower())
            for i in range(len(json_file["where"][val1])):
                if not isinstance(json_file["where"][val1][i], int):
                    for elem in json_file["where"][val1][i]:
                        if elem in equals:
                            if isinstance(json_file["where"][val1][i][elem], list):
                                for j in range(len(json_file["where"][val1][i][elem])):
                                    if isinstance(
                                        json_file["where"][val1][i][elem][j], str
                                    ):
                                        if "." in json_file["where"][val1][i][elem][j]:
                                            list_tables.append(
                                                json_file["where"][val1][i][elem][
                                                    j
                                                ].split(".")[1]
                                            )
                                        else:
                                            list_tables.append(
                                                json_file["where"][val1][i][elem][j]
                                            )
                                    if isinstance(
                                        json_file["where"][val1][i][elem][j], dict
                                    ):
                                        for elem1 in json_file["where"][val1][i][elem][
                                            j
                                        ]:
                                            if elem1 in select_commands:
                                                if isinstance(
                                                    json_file["where"][val1][i][elem][
                                                        j
                                                    ][elem1],
                                                    str,
                                                ):
                                                    if (
                                                        "."
                                                        in json_file["where"][val1][i][
                                                            elem
                                                        ][j][elem1]
                                                    ):
                                                        list_tables.append(
                                                            json_file["where"][val1][i][
                                                                elem
                                                            ][j][elem1].split(".")[1]
                                                        )
                                                    else:
                                                        list_tables.append(
                                                            json_file["where"][val1][i][
                                                                elem
                                                            ][j][elem1]
                                                        )
                                            if elem1 == "literal":
                                                literal.append(
                                                    json_file["where"][val1][i][elem][
                                                        j
                                                    ][elem1]
                                                )
                                        list_tables.extend(
                                            AC.single_select_dict(
                                                json_file["where"][val1][i][elem][j]
                                            )
                                        )
                        if elem == "where":
                            list_tables.extend(
                                select_where(json_file["where"][val1][i])
                            )
    return set(list_tables)


# returns SelectionAttributes for a statement and uses herefor different arts of sql-statements
def extract_sel_attributes(json_file, client):
    where_attributes = []
    json_file = parse_query(json_file, client)
    try:
        if (select_where(json_file) is not None) and (select_where(json_file)):
            where_attributes.extend([select_where(json_file)])
    except Exception as e:
        print(e)
        where_attributes = [["Unknown"]]
    if len(where_attributes) > 0:
        return list(where_attributes[0])
    return list(where_attributes)


def extract_order_by(json_file, client):
    json_file = parse_query(json_file, client)
    order_by = []
    order_by_list = list(iterate(json_file, "orderby"))
    for s in order_by_list:
        value = []
        try:
            value.append(s["value"])
            if "sort" in s:
                value.append(s["sort"])
            else:
                value.append("asc")
            order_by.append(value)
        except Exception:
            for y in s:
                value = []
                value.append(y["value"])
                try:
                    value.append(y["sort"])
                except Exception:
                    value.append("asc")
                order_by.append(value)
    if len(order_by) == 0:
        order_by = "Unknown"
    return order_by


def extract_group_by(json_file, client):
    json_file = parse_query(json_file, client)
    group_by = []
    group_by_list = list(iterate(json_file, "groupby"))
    for s in group_by_list:
        try:
            group_by.append(s["value"])
        except Exception:
            for y in s:
                group_by.append(y["value"])
    if len(group_by) == 0:
        group_by = "Unknown"
    return group_by


def extract_having(json_file, client):
    json_file = parse_query(json_file, client)
    all_having = [
        []
    ]  # reason having in check_solution_chars() in json_creator is [[[...]]]
    having = []
    having_list = list(iterate(json_file, "having"))
    att = []  # if necessary , not in use now...: customerId
    att_operator = []  # count
    att_op_compare = []  # gt...
    val_compare = []  # value example 5
    for s in having_list:
        parse_one_cond(s, having, att, att_operator, att_op_compare, val_compare)
    all_having[0].append(having)  # or having_order
    if len(all_having) == 0:
        all_having = "Unknown"
    if all_having == [[[]]]:
        return []
    return all_having


def iterate(data, param):
    if isinstance(data, list):
        for item in data:
            yield from iterate(item, param)
    elif isinstance(data, dict):
        for key, item in data.items():
            if key == param:
                yield item
            else:
                yield from iterate(item, param)


def parse_one_cond(  # pylint: disable = R1710
    s, having, att, att_operator, att_op_compare, val_compare
):  # pylint: disable=R1710
    if isinstance(s, dict):
        for i in s.values():
            if isinstance(i, str):
                having.append(i)
            if isinstance(i, dict):
                key, values = get_vals_and_keys(i)
                if not isinstance(key, dict) and not isinstance(key, list):
                    having.append(key)
                if not isinstance(key, dict) and not isinstance(key, list):
                    having.append(values)
                if isinstance(values, dict):
                    key1, values1 = get_vals_and_keys(values)
                    if not isinstance(key1, dict) and not isinstance(key1, list):
                        having.append(key1)
                    if isinstance(values1, str):
                        having.append(values1)
                    if isinstance(values1, dict):
                        key2, values2 = get_vals_and_keys(values1)
                        if not isinstance(key2, dict) and not isinstance(key2, list):
                            having.append(key2)
                        if isinstance(values2, dict) and not isinstance(values2, list):
                            having.append(values2)
        for i in s:  # keys
            if not isinstance(i, dict) and not isinstance(i, list):
                having.append(i)
            if not isinstance(s[i], str):
                for t in s[i]:
                    if not isinstance(t, str):
                        if isinstance(t, int):
                            if not isinstance(t, dict) and not isinstance(t, list):
                                having.append(t)
                        if isinstance(t, dict):
                            values = list(t.values())
                            keys = list(t.keys())
                            if not isinstance(keys[0], dict) and not isinstance(
                                keys[0], list
                            ):
                                having.append(keys[0])
                            if not isinstance(values[0], dict) and not isinstance(
                                values[0], list
                            ):
                                having.append(values[0])
                            if len(values) > 0:
                                for f in values:
                                    if not isinstance(f, str):
                                        for r in f:
                                            if not isinstance(
                                                r, dict
                                            ) and not isinstance(r, list):
                                                having.append(r)
                                            if isinstance(r, dict):
                                                parse_one_cond(
                                                    r,
                                                    having,
                                                    att,
                                                    att_operator,
                                                    att_op_compare,
                                                    val_compare,
                                                )
        return having


def get_vals_and_keys(s):  # pylint: disable=R1710
    if isinstance(s, dict):
        keys_list = list(s.keys())
        values = list(s.values())
        return keys_list[0], values[0]
