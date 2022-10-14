# sel_attribute_checker.py

import pro_attribute_checker as AC
from parser import *

selectCommands = [
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
def selectWhere(json_file):
    listTables = []
    if "where" in json_file:
        isWhere = True
        for val1 in json_file["where"]:
            if isinstance(json_file["where"][val1], str):
                if "." in json_file["where"][val1]:
                    listTables.append(json_file["where"][val1].split(".")[1].lower())
                else:
                    listTables.append(json_file["where"][val1].lower())
            if isinstance(json_file["where"][val1], dict):
                for val2 in json_file["where"][val1]:
                    if isinstance(val2, str):
                        if AC.singleSelectDict(val2) != []:
                            listTables.extend(AC.singleSelectDict(val2))
                        elif "." in val2:
                            listTables.append(val2.split(".")[1].lower())
                        else:
                            listTables.append(val2.lower())
            for i in range(len(json_file["where"][val1])):
                if isinstance(json_file["where"][val1][i], dict):
                    for val3 in json_file["where"][val1][i]:
                        if val3 in selectCommands:
                            for val4 in json_file["where"][val1][i][val3]:
                                if isinstance(val4, str):
                                    if "." in val4:
                                        listTables.append(val4.split(".")[1].lower())
                                    else:
                                        listTables.append(val4.lower())
            if isinstance(json_file["where"][val1], list) and (
                len(json_file["where"][val1]) > 1
            ):
                if isinstance(json_file["where"][val1][1], dict):
                    if AC.singleSelectDict(json_file["where"][val1][1]) != []:
                        listTables.extend(
                            AC.singleSelectDict(json_file["where"][val1][1])
                        )
                    if "literal" in json_file["where"][val1][1]:
                        literal.append(json_file["where"][val1][1]["literal"])
                for elem in json_file["where"][val1]:
                    if isinstance(elem, str):
                        if "." in elem:
                            listTables.append(elem.split(".")[1].lower())
                        else:
                            listTables.append(elem.lower())
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
                                            listTables.append(
                                                json_file["where"][val1][i][elem][
                                                    j
                                                ].split(".")[1]
                                            )
                                        else:
                                            listTables.append(
                                                json_file["where"][val1][i][elem][j]
                                            )
                                    if isinstance(
                                        json_file["where"][val1][i][elem][j], dict
                                    ):
                                        for elem1 in json_file["where"][val1][i][elem][
                                            j
                                        ]:
                                            if elem1 in selectCommands:
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
                                                        listTables.append(
                                                            json_file["where"][val1][i][
                                                                elem
                                                            ][j][elem1].split(".")[1]
                                                        )
                                                    else:
                                                        listTables.append(
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
                                        listTables.extend(
                                            AC.singleSelectDict(
                                                json_file["where"][val1][i][elem][j]
                                            )
                                        )
                        if elem == "where":
                            listTables.extend(selectWhere(json_file["where"][val1][i]))
    return set(listTables)


# returns SelectionAttributes for a statement and uses herefor different arts of sql-statements
def extractSelAttributes(json_file, client):
    whereAttributes = []
    json_file = parse_query(json_file, client)
    try:
        if (selectWhere(json_file) is not None) and (selectWhere(json_file) != []):
            whereAttributes.extend([selectWhere(json_file)])
    except Exception as e:
        # print(e)
        whereAttributes = [["Unknown"]]
    if len(whereAttributes) > 0:
        return list(whereAttributes[0])
    else:
        return list(whereAttributes)


def extractOrderBy(json_file, client):
    json_file = parse_query(json_file, client)
    groupBy = []
    groupByList = list(iterate(json_file, "orderby"))
    for s in groupByList:
        value = []
        value.append(s["value"])
        try:
            value.append(s["sort"])
        except Exception as e:
            value.append("asc")
        groupBy.append(value)
    if len(groupBy) == 0:
        groupBy = "Unknown"
    return groupBy


def extractGroupBy(json_file, client):
    json_file = parse_query(json_file, client)
    groupBy = []
    groupByList = list(iterate(json_file, "groupby"))
    for s in groupByList:
        groupBy.append(s["value"])
    if len(groupBy) == 0:
        groupBy = "Unknown"
    return groupBy


def extract_having(json_file, client):
    json_file = parse_query(json_file, client)
    all_havings = []
    having = []
    having_list = list(iterate(json_file, "having"))
    print(having_list)

    # aufteilen bei Bedarf aber complex

    att = []  # customerId
    att_operator = []  # count
    att_op_compare = []  # gt...
    val_compare = []  # value example 5
    having_order = []  # end result

    for s in having_list:
        parse_one_cond(s, having, att, att_operator, att_op_compare, val_compare)

    # aufteilen bei Bedarf aber complex
    """
    i = 0
    for s in having:
        listWithCond = []

        if s == 'count' : # with gt equals: or s == 'gt'
            listWithCond.append(s)
        else:
            havingOrder.append(s)
        if s == 'count':
            listWithCond.append(att[i])
            listWithCond.append(valCompare[i])
            i = i + 1
            havingOrder.append(listWithCond)

    """

    all_havings.append(having) # or having_order
    if len(all_havings) == 0:
        all_havings = "Unknown"
    return all_havings


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


def parse_one_cond(s, having, att, att_operator, att_op_compare, val_compare):

    if type(s) is dict:
        for i in s.values():
            if type(i) is str:
                having.append(i)

            if type(i) is dict:
                key, values = get_vals_and_keys(i)

                if type(key) is not dict and type(key) is not list:
                    having.append(key)
                if type(values) is not dict and type(values) is not list:
                    having.append(values)

                if type(values) is dict:
                    key1, values1 = get_vals_and_keys(values)

                    if type(key1) is not dict and type(key1) is not list:
                        having.append(key1)
                    if type(values1) is str:
                        having.append(values1)

                    if type(values1) is dict:
                        key2, values2 = get_vals_and_keys(values1)

                        if type(key2) is not dict and type(key2) is not list:
                            having.append(key2)
                        if type(values2) is not dict and type(values2) is not list:
                            having.append(values2)

        for i in s:  # keys

            if type(i) is not dict and type(i) is not list:
                having.append(i)

            if type(s[i]) is not str:
                for t in s[i]:

                    if type(t) is not str:

                        if type(t) is int:
                            if type(t) is not dict and type(t) is not list:
                                having.append(t)

                        if type(t) is dict:
                            values = list(t.values())
                            keys = list(t.keys())

                            if type(keys[0]) is not dict and type(keys[0]) is not list:
                                having.append(keys[0])
                            if (
                                type(values[0]) is not dict
                                and type(values[0]) is not list
                            ):
                                having.append(values[0])

                            if len(values) > 0:
                                for s in values:
                                    if type(s) is not str:
                                        for t in s:
                                            if (
                                                type(t) is not dict
                                                and type(t) is not list
                                            ):
                                                having.append(t)
                                            if type(t) is dict:
                                                parse_one_cond(
                                                    t,
                                                    having,
                                                    att,
                                                    att_operator,
                                                    att_op_compare,
                                                    val_compare,
                                                )
        return having


def get_vals_and_keys(s):
    if type(s) is dict:
        keys_list = list(s.keys())
        values = list(s.values())
        return keys_list[0], values[0]
