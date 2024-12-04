from api.attribute_common import select_where
from api.parser import QueryParser


class SelAttributeChecker:
    def __init__(self, parser: QueryParser):
        self._parser = parser

    # returns SelectionAttributes for a statement and uses herefor different arts of sql-statements
    def extract_sel_attributes(self, json_file, literals):
        where_attributes = []
        json_file = self._parser.parse_query(json_file)
        try:
            if (select_where(json_file, literals) is not None) and (select_where(json_file, literals)):
                where_attributes.extend([select_where(json_file, literals)])
        except Exception as e:
            print(e)
            where_attributes = [["Unknown"]]
        if len(where_attributes) > 0:
            return list(where_attributes[0])
        return list(where_attributes)


    def extract_order_by(self, json_file):
        json_file = self._parser.parse_query(json_file)
        order_by = []
        order_by_list = list(self._iterate(json_file, "orderby"))
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


    def extract_group_by(self, json_file):
        json_file = self._parser.parse_query(json_file)
        group_by = []
        group_by_list = list(self._iterate(json_file, "groupby"))
        for s in group_by_list:
            try:
                group_by.append(s["value"])
            except Exception:
                for y in s:
                    group_by.append(y["value"])
        if len(group_by) == 0:
            group_by = "Unknown"
        return group_by


    def extract_having(self, json_file):
        json_file = self._parser.parse_query(json_file)
        all_having = [
            []
        ]  # reason having in check_solution_chars() in json_creator is [[[...]]]
        having = []
        having_list = list(self._iterate(json_file, "having"))
        att = []  # if necessary , not in use now...: customerId
        att_operator = []  # count
        att_op_compare = []  # gt...
        val_compare = []  # value example 5
        for s in having_list:
            self._parse_one_cond(s, having, att, att_operator, att_op_compare, val_compare)
        all_having[0].append(having)  # or having_order
        if len(all_having) == 0:
            all_having = "Unknown"
        if all_having == [[[]]]:
            return []
        return all_having


    def _iterate(self, data, param):
        if isinstance(data, list):
            for item in data:
                yield from self._iterate(item, param)
        elif isinstance(data, dict):
            for key, item in data.items():
                if key == param:
                    yield item
                else:
                    yield from self._iterate(item, param)


    def _parse_one_cond(  # pylint: disable = R1710
        self, s, having, att, att_operator, att_op_compare, val_compare
    ):  # pylint: disable=R1710
        if isinstance(s, dict):
            for i in s.values():
                if isinstance(i, str):
                    having.append(i)
                if isinstance(i, dict):
                    key, values = self._get_vals_and_keys(i)
                    if not isinstance(key, dict) and not isinstance(key, list):
                        having.append(key)
                    if not isinstance(key, dict) and not isinstance(key, list):
                        having.append(values)
                    if isinstance(values, dict):
                        key1, values1 = self._get_vals_and_keys(values)
                        if not isinstance(key1, dict) and not isinstance(key1, list):
                            having.append(key1)
                        if isinstance(values1, str):
                            having.append(values1)
                        if isinstance(values1, dict):
                            key2, values2 = self._get_vals_and_keys(values1)
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
                                                    self._parse_one_cond(
                                                        r,
                                                        having,
                                                        att,
                                                        att_operator,
                                                        att_op_compare,
                                                        val_compare,
                                                    )
            return having


    def _get_vals_and_keys(s):  # pylint: disable=R1710
        if isinstance(s, dict):
            keys_list = list(s.keys())
            values = list(s.values())
            return keys_list[0], values[0]
