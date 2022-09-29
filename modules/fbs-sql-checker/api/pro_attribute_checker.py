# pro_attribute_checker.py

from parser import parse_query
from sel_attribute_checker import select_where
import formatting as f

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


# Return ProjectionAttributes as a List
def list_of_select(json_file):
    selects = []
    if not (f.is_string(json_file)) and (f.is_select(json_file)):
        if isinstance(json_file["select"], list):
            for val in range(len(json_file["select"])):
                if "value" in json_file["select"][val]:
                    for val1 in json_file["select"][val]["value"]:
                        if val1 in select_commands:
                            if isinstance(json_file["select"][val]["value"][val1], str):
                                if "." in json_file["select"][val]["value"][val1]:
                                    selects.append(
                                        json_file["select"][val]["value"][val1]
                                        .split(".")[1]
                                        .lower()
                                    )
                                else:
                                    selects.append(
                                        json_file["select"][val]["value"][val1].lower()
                                    )
                            if isinstance(
                                json_file["select"][val]["value"][val1], list
                            ):
                                for i in range(
                                    len(json_file["select"][val]["value"][val1])
                                ):
                                    if isinstance(
                                        json_file["select"][val]["value"][val1][i], dict
                                    ):
                                        for elem1 in json_file["select"][val]["value"][
                                            val1
                                        ][i]:
                                            if elem1 in select_commands:
                                                if isinstance(
                                                    json_file["select"][val]["value"][
                                                        val1
                                                    ][i][elem1],
                                                    list,
                                                ):
                                                    for elem2 in range(
                                                        len(
                                                            json_file["select"][val][
                                                                "value"
                                                            ][val1][i][elem1]
                                                        )
                                                    ):
                                                        if isinstance(
                                                            json_file["select"][val][
                                                                "value"
                                                            ][val1][i][elem1][elem2],
                                                            str,
                                                        ):
                                                            if (
                                                                "."
                                                                in json_file["select"][
                                                                    val
                                                                ]["value"][val1][i][
                                                                    elem1
                                                                ][
                                                                    elem2
                                                                ]
                                                            ):
                                                                selects.append(
                                                                    json_file["select"][
                                                                        val
                                                                    ]["value"][val1][i][
                                                                        elem1
                                                                    ][
                                                                        elem2
                                                                    ]
                                                                    .split(".")[1]
                                                                    .lower()
                                                                )
                                                            else:
                                                                selects.append(
                                                                    json_file["select"][
                                                                        val
                                                                    ]["value"][val1][i][
                                                                        elem1
                                                                    ][
                                                                        elem2
                                                                    ]
                                                                )
                                                        elif isinstance(
                                                            json_file["select"][val][
                                                                "value"
                                                            ][val1][i][elem1][elem2],
                                                            list,
                                                        ):
                                                            for elem3 in json_file[
                                                                "select"
                                                            ][val]["value"][val1][i][
                                                                elem1
                                                            ][
                                                                elem2
                                                            ]:
                                                                if (
                                                                    elem3
                                                                    in select_commands
                                                                ):
                                                                    if (
                                                                        "."
                                                                        in json_file[
                                                                            "select"
                                                                        ][val]["value"][
                                                                            val1
                                                                        ][
                                                                            i
                                                                        ][
                                                                            elem1
                                                                        ][
                                                                            elem2
                                                                        ][
                                                                            elem3
                                                                        ]
                                                                    ):
                                                                        selects.append(
                                                                            json_file[
                                                                                "select"
                                                                            ][val][
                                                                                "value"
                                                                            ][
                                                                                val1
                                                                            ][
                                                                                i
                                                                            ][
                                                                                elem1
                                                                            ][
                                                                                elem2
                                                                            ][
                                                                                elem3
                                                                            ]
                                                                            .split(".")[
                                                                                1
                                                                            ]
                                                                            .lower()
                                                                        )
                                                                    else:
                                                                        selects.append(
                                                                            json_file[
                                                                                "select"
                                                                            ][val][
                                                                                "value"
                                                                            ][
                                                                                val1
                                                                            ][
                                                                                i
                                                                            ][
                                                                                elem1
                                                                            ][
                                                                                elem2
                                                                            ][
                                                                                elem3
                                                                            ].lower()
                                                                        )
                                                else:
                                                    if (
                                                        "."
                                                        in json_file["select"][val][
                                                            "value"
                                                        ][val1][i][elem1]
                                                    ):
                                                        selects.append(
                                                            json_file["select"][val][
                                                                "value"
                                                            ][val1][i][elem1]
                                                            .split(".")[1]
                                                            .lower()
                                                        )
                                                    else:
                                                        selects.append(
                                                            json_file["select"][val][
                                                                "value"
                                                            ][val1][i][elem1].lower()
                                                        )
                    if "." in json_file["select"][val]["value"]:
                        selects.append(
                            json_file["select"][val]["value"].split(".")[1].lower()
                        )
                    else:
                        if not isinstance(json_file["select"][val]["value"], dict):
                            selects.append(json_file["select"][val]["value"].lower())
    return set(selects)


# Returns a single ProjectionAttribute
def single_select(json_file):
    selects = []
    if not (f.is_string(json_file)) and (f.is_select(json_file)):
        if isinstance(json_file["select"], str):
            if "." in json_file["select"]:
                selects.append(json_file["select"].split(".")[1].lower())
            else:
                selects.append(json_file["select"].lower())
        for val in json_file["from"]:
            if val == "value":
                if select_union(json_file["from"]["value"]):
                    selects.extend(select_union(json_file["from"]["value"]))
                if list_of_select(json_file["from"]["value"]):
                    selects.extend(list_of_select(json_file["from"]["value"]))
                if select_where(json_file["from"]["value"]):
                    selects.append(select_where(json_file["from"]["value"]))
    return set(selects)


# Returns a single ProjectionAttribute if it's a dictionary
def single_select_dict(json_file):
    selects = []
    if not (f.is_string(json_file)) and (f.is_select(json_file)):
        if isinstance(json_file["select"], dict):
            if "value" in json_file["select"]:
                if isinstance(json_file["select"]["value"], str):
                    if "." in json_file["select"]["value"]:
                        selects.append(
                            json_file["select"]["value"].split(".")[1].lower()
                        )
                    else:
                        selects.append(json_file["select"]["value"].lower())
                elif isinstance(json_file["select"]["value"], dict):
                    for val in json_file["select"]["value"]:
                        if val in select_commands:
                            if isinstance(json_file["select"]["value"][val], dict):
                                if "value" in json_file["select"]["value"][val]:
                                    if (
                                        "."
                                        in json_file["select"]["value"][val]["value"]
                                    ):
                                        selects.append(
                                            json_file["select"]["value"][val]["value"]
                                            .split(".")[1]
                                            .lower()
                                        )
                                    else:
                                        selects.append(
                                            json_file["select"]["value"][val]["value"]
                                        )
                                for elem in json_file["select"]["value"][val]:
                                    if (elem in select_commands) and (
                                        isinstance(
                                            json_file["select"]["value"][val][elem],
                                            dict,
                                        )
                                    ):
                                        for elem1 in json_file["select"]["value"][val][
                                            elem
                                        ]:
                                            if elem1 in select_commands and isinstance(
                                                json_file["select"]["value"][val][elem][
                                                    elem1
                                                ],
                                                str,
                                            ):
                                                if (
                                                    "."
                                                    in json_file["select"]["value"][
                                                        val
                                                    ][elem][elem1]
                                                ):
                                                    selects.append(
                                                        json_file["select"]["value"][
                                                            val
                                                        ][elem][elem1]
                                                        .split(".")[1]
                                                        .lower()
                                                    )
                                                else:
                                                    selects.append(
                                                        json_file["select"]["value"][
                                                            val
                                                        ][elem][elem1].lower()
                                                    )
                            if isinstance(json_file["select"]["value"][val], str):
                                if "." in json_file["select"]["value"][val]:
                                    selects.append(
                                        json_file["select"]["value"][val]
                                        .split(".")[1]
                                        .lower()
                                    )
                                else:
                                    selects.append(
                                        json_file["select"]["value"][val].lower()
                                    )
                            if isinstance(json_file["select"]["value"][val], list):
                                for i in range(len(json_file["select"]["value"][val])):
                                    if "value" in json_file["select"]["value"][val][i]:
                                        if isinstance(
                                            json_file["select"]["value"][val][i][
                                                "value"
                                            ],
                                            str,
                                        ):
                                            if (
                                                "."
                                                in json_file["select"]["value"][val][i][
                                                    "value"
                                                ]
                                            ):
                                                selects.append(
                                                    json_file["select"]["value"][val][
                                                        i
                                                    ]["value"]
                                                    .split(".")[1]
                                                    .lower()
                                                )
                                            else:
                                                selects.append(
                                                    json_file["select"]["value"][val][
                                                        i
                                                    ]["value"].lower()
                                                )
    return set(selects)


# Returns ProjectionAttributes as a List if it is a union
def select_union(json_file):
    list_tables = []
    if not f.is_string(json_file):
        for val in json_file:
            if val == "union":
                for val1 in range(len(json_file["union"])):
                    if list_of_select(json_file["union"][val1]):
                        for elem in list_of_select(json_file[val][val1]):
                            if not isinstance(elem, dict):
                                list_tables.append(elem.lower())
                    if select_where(json_file["union"][val1]):
                        if len(select_where(json_file["union"][val1])) == 1:
                            list_tables.append(
                                select_where(  # pylint: disable=E1136
                                    json_file["union"][val1]
                                )[  # pylint: disable=E1136
                                    0
                                ].lower()  # pylint: disable=E1136
                            )
                        else:
                            for elem in select_where(json_file["union"][val1]):
                                list_tables.append(elem.lower())
    return set(list_tables)


# returns ProjectionAttributes for a statement and uses herefor different arts of sql-statements
def extract_pro_attributes(json_file, client):
    attributes = []
    json_file = parse_query(json_file, client)
    try:
        if (single_select_dict(json_file) is not None) and (
            single_select_dict(json_file)
        ):
            attributes.extend(single_select_dict(json_file))
        if (single_select(json_file) is not None) and (single_select(json_file)):
            attributes.extend(single_select(json_file))
        if (select_union(json_file) is not None) and (select_union(json_file)):
            attributes.extend(select_union(json_file))
        if (list_of_select(json_file) is not None) and (list_of_select(json_file)):
            attributes.extend(list_of_select(json_file))
    except Exception as e:
        print(e)
        attributes = ["Unknown"]
    return list(attributes)
