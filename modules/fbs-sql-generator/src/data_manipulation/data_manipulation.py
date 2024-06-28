import random

import logging

logger = logging.getLogger("name")


def check_if_column_is_nullable(table, column, is_nullable):
    if table == is_nullable[0] and column == is_nullable[1]:
        return True
    return False


def check_if_value_is_changeable(
    table_name, column, foreign_keys, primary_keys, unique_keys
):
    for unique_key in unique_keys:
        if table_name == unique_key[0] and column[0] == unique_key[1]:
            return False
    if column[1] != "int" and column[1] != "decimal":
        return False
    for i in range(0, len(foreign_keys)):
        if table_name == foreign_keys[i][0] and column[0] == foreign_keys[i][1]:
            return False
    for i in range(0, len(primary_keys)):
        if table_name == primary_keys[i][0] and column[0] == primary_keys[i][1]:
            return False
    if column[0] == "PLZ":
        return False
    return True


def create_multiple_mins_max(data, index):
    if len(data) < 10:
        return None, None
    max = None
    min = None
    used_indexes = []
    random_number = generate_number_not_in_list(0, len(data) - 1, used_indexes)
    used_indexes.append(random_number)
    random_value = data[random_number][index]
    lower_index = generate_number_not_in_list(0, len(data) - 1, used_indexes)
    used_indexes.append(lower_index)
    higher_index = generate_number_not_in_list(0, len(data) - 1, used_indexes)
    used_indexes.append(higher_index)
    if isinstance(random_value, int):
        data[lower_index][index] = random_value - 1
        data[higher_index][index] = random_value + 1
    elif isinstance(random_value, float):
        data[lower_index][index] = random_value - 1.0
        data[higher_index][index] = random_value + 1.0
    for i in range(0, len(data)):
        if max is None or (data[i][index] is not None and data[i][index] > max):
            max = data[i][index]
        if min is None or (data[i][index] is not None and data[i][index] < min):
            min = data[i][index]
        if data[i][index] is None:
            used_indexes.append(i)
    random_number = generate_number_not_in_list(0, len(data) - 1, used_indexes)
    used_indexes.append(random_number)
    data[random_number][index] = max
    random_number = generate_number_not_in_list(0, len(data) - 1, used_indexes)
    used_indexes.append(random_number)
    data[random_number][index] = min
    return data, random_value


def generate_number_not_in_list(min, max, used_indexes):
    random_index = random.randint(min, max)
    while random_index in used_indexes:
        random_index = random.randint(min, max)
    return random_index


def generate_random_id(min, max, all_data, index):
    new_ids = []
    for entry in all_data:
        new_id = generate_number_not_in_list(min, max, new_ids)
        new_ids.append(new_id)
        entry[index] = new_id
    return all_data
