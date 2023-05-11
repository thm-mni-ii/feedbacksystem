import re  # pylint: disable=missing-module-docstring

import mo_sql_parsing as msp


class SQLAliasMasker:
    """todo"""

    def __init__(self, query: str):
        self.query = msp.parse(query)

    def mask_aliases_(self):
        """todo"""
        self.replace_table_aliases_()
        self.replace_column_aliases_()

    def get_masked_query(self):
        """todo"""
        return msp.format(self.query)

    def __get_column_aliases(self):
        query = self.query.get("select")
        items = []

        self.__get_aliases(query, items)

        return self.__build_alias_dict(items, "clmn")

    def __get_table_aliases(self):
        query = self.query.get("from")
        items = []

        self.__get_aliases(query, items)

        return self.__build_alias_dict(items, "tbl")

    def __get_aliases(self, query, items, parent=""):
        if parent == "name":
            items.append({parent: query})

        if isinstance(query, dict):
            for key in query:
                self.__get_aliases(query[key], items, key)
        elif isinstance(query, list):
            for item in query:
                self.__get_aliases(item, items, parent)

        return items

    def __build_alias_dict(self, aliases, prefix):
        alias_dict = {}
        for idx, alias in enumerate(aliases):
            alias_mask = f"{prefix}_alias_{idx}"
            alias_dict[alias.get("name")] = alias_mask

        return alias_dict

    def __replace_column_alias_select(self, query, match, replacement, aliases):
        if isinstance(query, (dict, list)):
            for k, v in (  # pylint: disable=invalid-name
                query.items() if isinstance(query, dict) else enumerate(query)
            ):  # replace initial alias definition
                if v == match:
                    query[k] = replacement

                self.__replace_column_alias_select(v, match, replacement, aliases)

    def __replace_column_alias_gen(self, query, match, replacement, aliases):
        if isinstance(query, (dict, list)):
            for k, v in (  # pylint: disable=invalid-name
                query.items() if isinstance(query, dict) else enumerate(query)
            ):
                # replace initial alias definition
                if v == match:
                    query[k] = replacement
                self.__replace_column_alias_gen(v, match, replacement, aliases)

    def __replace_table_alias_from(self, query, match, replacement, aliases, pattern):
        if isinstance(query, (dict, list)):
            for k, v in (  # pylint: disable=invalid-name
                query.items() if isinstance(query, dict) else enumerate(query)
            ):
                # replace initial alias definition
                if v == match:
                    query[k] = replacement

                # replace table reference in leaf nodes
                if isinstance(v, str):
                    if table_reference := pattern.match(v):
                        tokens = table_reference.group().split(".")
                        if (
                            tokens[0] in aliases.keys()
                        ):  # check if table is indeed an alias
                            tokens[0] = aliases.get(tokens[0])
                            query[k] = ".".join(tokens)
                self.__replace_table_alias_from(v, match, replacement, aliases, pattern)

    def __replace_table_alias_gen(self, query, aliases, pattern):
        if isinstance(query, (dict, list)):
            for k, v in (  # pylint: disable=invalid-name
                query.items() if isinstance(query, dict) else enumerate(query)
            ):
                # replace table reference in leaf nodes with aliases dict
                if isinstance(v, str):
                    if table_reference := pattern.match(v):
                        tokens = table_reference.group().split(".")
                        if (
                            tokens[0] in aliases.keys()
                        ):  # check if table is indeed an alias
                            tokens[0] = aliases.get(tokens[0])
                            query[k] = ".".join(tokens)
                self.__replace_table_alias_gen(v, aliases, pattern)

    def replace_table_aliases_(self):
        """todo"""
        aliases = self.__get_table_aliases()
        pattern = re.compile(
            r"\b\w+\.\w+\b"
        )  # this pattern matches strings in form of: 'table.attribute'

        for k, v in aliases.items():  # pylint: disable=invalid-name
            self.__replace_table_alias_from(
                self.query.get("from"), k, v, aliases, pattern
            )

        # iterate over all clauses to replace table references
        for key in set(self.query.keys()).difference(["from"]):
            self.__replace_table_alias_gen(self.query.get(key), aliases, pattern)

    def replace_column_aliases_(self):
        """todo"""
        aliases = self.__get_column_aliases()

        for k, v in aliases.items():  # pylint: disable=invalid-name
            self.__replace_column_alias_select(self.query.get("select"), k, v, aliases)

            for affected_clauses in set(self.query.keys()).intersection(
                set(["groupby", "orderby", "having"])
            ):
                # https://dev.mysql.com/doc/refman/8.0/en/problems-with-alias.html
                self.__replace_column_alias_gen(
                    self.query.get(affected_clauses), k, v, aliases
                )
