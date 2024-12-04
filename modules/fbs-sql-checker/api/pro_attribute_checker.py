# pro_attribute_checker.py
from api.attribute_common import select_commands, single_select_dict, select_where
import formatting as f
from api.parser import QueryParser


class ProAttributeChecker:
    def __init__(self, parser: QueryParser):
        self._parser = parser

    # Return ProjectionAttributes as a List
    def _list_of_select(self, json_file):
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
    def _single_select(self, json_file, literals):
        selects = []
        if not (f.is_string(json_file)) and (f.is_select(json_file)):
            if isinstance(json_file["select"], str):
                if "." in json_file["select"]:
                    selects.append(json_file["select"].split(".")[1].lower())
                else:
                    selects.append(json_file["select"].lower())
            for val in json_file["from"]:
                if val == "value":
                    if self._select_union(json_file["from"]["value"], literals):
                        selects.extend(self._select_union(json_file["from"]["value"], literals))
                    if self._list_of_select(json_file["from"]["value"]):
                        selects.extend(self._list_of_select(json_file["from"]["value"]))
                    if select_where(json_file["from"]["value"], literals):
                        selects.append(select_where(json_file["from"]["value"], literals))
        return set(selects)



    # Returns ProjectionAttributes as a List if it is a union
    def _select_union(self, json_file, literals):
        list_tables = []
        if not f.is_string(json_file):
            for val in json_file:
                if val == "union":
                    for val1 in range(len(json_file["union"])):
                        if self._list_of_select(json_file["union"][val1]):
                            for elem in self._list_of_select(json_file[val][val1]):
                                if not isinstance(elem, dict):
                                    list_tables.append(elem.lower())
                        if select_where(json_file["union"][val1], literals):
                            if len(select_where(json_file["union"][val1], literals)) == 1:
                                list_tables.append(
                                    select_where(  # pylint: disable=E1136
                                        json_file["union"][val1],
                                        literals
                                    )[  # pylint: disable=E1136
                                        0
                                    ].lower()  # pylint: disable=E1136
                                )
                            else:
                                for elem in select_where(json_file["union"][val1], literals):
                                    list_tables.append(elem.lower())
        return set(list_tables)


    # returns ProjectionAttributes for a statement and uses herefor different arts of sql-statements
    def extract_pro_attributes(self, json_file, literals):
        attributes = []
        json_file = self._parser.parse_query(json_file)
        try:
            if (single_select_dict(json_file) is not None) and (
                single_select_dict(json_file)
            ):
                attributes.extend(single_select_dict(json_file))
            if (self._single_select(json_file, literals) is not None) and (self._single_select(json_file, literals)):
                attributes.extend(self._single_select(json_file, literals))
            if (self._select_union(json_file, literals) is not None) and (self._select_union(json_file, literals)):
                attributes.extend(self._select_union(json_file, literals))
            if (self._list_of_select(json_file) is not None) and (self._list_of_select(json_file)):
                attributes.extend(self._list_of_select(json_file))
        except Exception as e:
            print(e)
            attributes = ["Unknown"]
        return list(attributes)
