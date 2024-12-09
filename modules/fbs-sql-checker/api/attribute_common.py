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

equals = ["eq", "neq", "gte", "gt", "lt", "lte"]

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


# Returns SelectionAttributes as a list if there is a where
def select_where(json_file, literal: list[any]):
    if literal is None:
        literal = []

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
                        if single_select_dict(val2):
                            list_tables.extend(single_select_dict(val2))
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
                    if single_select_dict(json_file["where"][val1][1]):
                        list_tables.extend(
                            single_select_dict(json_file["where"][val1][1])
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
                                            single_select_dict(
                                                json_file["where"][val1][i][elem][j]
                                            )
                                        )
                        if elem == "where":
                            list_tables.extend(
                                select_where(json_file["where"][val1][i], literal)
                            )
    return set(list_tables)
