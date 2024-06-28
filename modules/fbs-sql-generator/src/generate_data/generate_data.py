import time
import random
from src.database_information.database_information import get_columns
from src.insert.insert import insert
from src.foreign_key_data.foreign_key_data import check_for_foreign_key
from src.data.data import gen_single_data_point, gen_specific_data, gen_unique_data
from src.data_manipulation.data_manipulation import (
    check_if_column_is_nullable,
    check_if_value_is_changeable,
    create_multiple_mins_max,
    generate_number_not_in_list,
    generate_random_id,
)
from datetime import datetime
import logging

logger = logging.getLogger("name")


def gen(
    cursor,
    connection,
    table_name,
    database_name,
    foreign_keys,
    primary_keys,
    fake,
    entries_in_table,
    data_to_generate,
    unique_keys,
):
    start = time.time()
    own_results, nullable_columns = get_columns(cursor, table_name, database_name)
    potential_id = 1
    all_data = []
    number_of_entries = 100
    for i in range(0, len(entries_in_table)):
        if table_name == entries_in_table[i][0]:
            number_of_entries = int(entries_in_table[i][1])
            break
    for i in range(0, number_of_entries):
        is_key(table_name, own_results[0], primary_keys, foreign_keys)
        all_data.append(
            gen_all_data(
                own_results,
                potential_id,
                fake,
                data_to_generate,
                table_name,
                primary_keys,
                foreign_keys,
                unique_keys,
                all_data,
            )
        )
        potential_id = potential_id + 1
    logger.error(f"data generated for table: {table_name} in {time.time()- start}")
    start = time.time()
    columns_to_set_null = []
    number_columns = []
    name_columns = []
    id_column = []
    manipulated_value = []
    for column in own_results:
        columns = []
        number_columns.append(
            check_if_value_is_changeable(
                table_name, column, foreign_keys, primary_keys, unique_keys
            )
        )
        name_columns.append(
            is_lastname(column, data_to_generate, table_name, unique_keys)
        )
        id_column.append(is_id(column, data_to_generate, table_name))
        for nullable_column in nullable_columns:
            if check_if_column_is_nullable(table_name, column[0], nullable_column):
                columns = generate_indexes(number_of_entries, 0.05)
        columns_to_set_null.append(columns)
    for i in range(0, len(columns_to_set_null)):
        for index in columns_to_set_null[i]:
            all_data[index][i] = None
    for i in range(0, len(number_columns)):
        if number_columns[i]:
            new_data, random_value = create_multiple_mins_max(all_data, i)
            if new_data is not None:
                all_data = new_data
            if random_value is not None:
                entry = []
                entry.append(table_name)
                entry.append(own_results[i][0])
                entry.append(random_value)
                manipulated_value.append(entry)
        if name_columns[i]:
            used_indexes = []
            entry = []
            if number_of_entries > 5:
                first_index = generate_number_not_in_list(
                    0, number_of_entries - 1, used_indexes
                )
                while all_data[first_index][i] is None:
                    first_index = generate_number_not_in_list(
                        0, number_of_entries - 1, used_indexes
                    )
                used_indexes.append(first_index)
                second_index = generate_number_not_in_list(
                    0, number_of_entries - 1, used_indexes
                )
                while all_data[second_index][i] is None:
                    second_index = generate_number_not_in_list(
                        0, number_of_entries - 1, used_indexes
                    )
                used_indexes.append(second_index)
                third_index = generate_number_not_in_list(
                    0, number_of_entries - 1, used_indexes
                )
                while all_data[third_index][i] is None:
                    third_index = generate_number_not_in_list(
                        0, number_of_entries - 1, used_indexes
                    )
                used_indexes.append(third_index)
                fourth_index = generate_number_not_in_list(
                    0, number_of_entries - 1, used_indexes
                )
                while all_data[fourth_index][i] is None:
                    fourth_index = generate_number_not_in_list(
                        0, number_of_entries - 1, used_indexes
                    )
                used_indexes.append(fourth_index)
                all_data[first_index][i] = "Schmidt"
                all_data[second_index][i] = "Schmitt"
                all_data[third_index][i] = "Schmit"
                all_data[fourth_index][i] = "Schmittt"
                entry.append(table_name)
                entry.append(own_results[i][0])
                manipulated_value.append(entry)
        if id_column[i]:
            all_data = generate_random_id(1, 1_000_000, all_data, i)
    logger.error(f"data manipulated for table: {table_name} in {time.time()- start}")
    start = time.time()
    insert(cursor, all_data, own_results, table_name, connection)
    logger.error(f"data inserted for table: {table_name} in {time.time()- start}")
    return manipulated_value


def generate_tables(
    primary_tables,
    cursor,
    connection,
    database_name,
    tables,
    foreign_keys,
    primary_keys,
    fake,
    entries_in_table,
    data_to_generate,
    unique_keys,
):
    tables_filled = []
    foreign_tables = []
    manipulated_values = []
    pt_start = time.time()
    for table_name in primary_tables:
        manipulated_values.append(
            gen(
                cursor,
                connection,
                table_name,
                database_name,
                foreign_keys,
                primary_keys,
                fake,
                entries_in_table,
                data_to_generate,
                unique_keys,
            )
        )
        tables_filled.append(table_name)
    total = time.time() - pt_start
    logger.error(f"Total time for all primary Tables: {total}")
    ft_start = time.time()
    for foreign_table in tables:
        if foreign_table not in primary_tables:
            foreign_tables.append(foreign_table)
    while len(foreign_tables) > 0:
        for foreign_table_name in foreign_tables:
            for foreign_key in foreign_keys:
                if (
                    foreign_key[0] == foreign_table_name
                    and foreign_key[2] in foreign_tables
                ):
                    break
            else:
                manipulated_values.append(
                    generate_foreign_key_tables(
                        foreign_table_name,
                        primary_keys,
                        foreign_keys,
                        cursor,
                        connection,
                        database_name,
                        fake,
                        entries_in_table,
                        data_to_generate,
                        unique_keys,
                    )
                )
                tables_filled.append(foreign_table_name)
                foreign_tables.remove(foreign_table_name)
    total = time.time() - ft_start
    logger.error(f"Total time for all foreign Tables: {total}")
    return manipulated_values


def generate_foreign_key_tables(
    table_name,
    primary_keys,
    foreign_keys,
    cursor,
    connection,
    database_name,
    fake,
    entries_in_table,
    data_to_generate,
    unique_keys,
):
    start = time.time()
    own_results, nullable_columns = get_columns(cursor, table_name, database_name)
    number_of_entries = 100
    for i in range(0, len(entries_in_table)):
        if table_name == entries_in_table[i][0]:
            number_of_entries = int(entries_in_table[i][1])
            break
    all_data = []
    all_foreign_key_data = []
    own_foreign_keys = []
    current_foreign_key_index = 0
    foreign_keys_from_same_table = []
    foreign_keys_that_are_primary_keys = []
    own_primary_keys = []
    indexes_of_pk = []
    index = 0
    for key in primary_keys:
        if key[0] == table_name:
            own_primary_keys.append(key)
    for own_columns in own_results:
        if is_primary_key(table_name, own_columns[0], primary_keys):
            indexes_of_pk.append(index)
        index = index + 1
        for foreign_key in foreign_keys:
            if foreign_key[1] == own_columns[0] and foreign_key[0] == table_name:
                own_foreign_keys.append(foreign_key)
                break
    number_of_foreign_keys = len(own_foreign_keys)
    for i in range(0, number_of_foreign_keys - 1):
        same_origin = [
            tup for tup in own_foreign_keys if tup[2] == own_foreign_keys[i][2]
        ]
        if len(same_origin) > 1:
            foreign_keys_from_same_table.append(same_origin)
    for own_foreign_key in own_foreign_keys:
        for primary_key in primary_keys:
            if (
                own_foreign_key[0] == primary_key[0]
                and own_foreign_key[1] == primary_key[1]
            ):
                foreign_keys_that_are_primary_keys.append(own_foreign_key)
    if len(own_primary_keys) != len(foreign_keys_that_are_primary_keys):
        foreign_keys_that_are_primary_keys.clear()
    for i in range(0, len(foreign_keys_that_are_primary_keys)):
        for j in range(i, len(foreign_keys_that_are_primary_keys)):
            if (
                foreign_keys_that_are_primary_keys[i][2]
                != foreign_keys_that_are_primary_keys[j][2]
            ):
                foreign_keys_that_are_primary_keys.clear()
                break
        if len(foreign_keys_that_are_primary_keys) == 0:
            break
    for i in range(0, len(own_foreign_keys)):
        foreign_data = []
        sublist_containing_foreign_key = next(
            (
                sublist
                for sublist in foreign_keys_from_same_table
                if own_foreign_keys[i] in sublist
            ),
            None,
        )
        if sublist_containing_foreign_key is not None:
            query = f"SELECT {own_foreign_keys[i][3]} FROM {own_foreign_keys[i][2]} ORDER BY {sublist_containing_foreign_key[0][3]}"
        else:
            query = f"SELECT {own_foreign_keys[i][3]} FROM {own_foreign_keys[i][2]}"
        cursor.execute(query)
        data_to_use = cursor.fetchall()
        for dat in data_to_use:
            if isinstance(dat, tuple):
                foreign_data.append(dat[0])
            else:
                foreign_data.append(dat)
        all_foreign_key_data.append(foreign_data)
    potential_id = 1
    pks = set()
    for index in range(0, number_of_entries):
        last_used_item = -1
        data = []
        data, pks, last_used_item = generate_single_entry(
            own_results,
            own_foreign_keys,
            table_name,
            last_used_item,
            foreign_keys_from_same_table,
            all_foreign_key_data,
            data,
            primary_keys,
            foreign_keys,
            current_foreign_key_index,
            foreign_keys_that_are_primary_keys,
            potential_id,
            number_of_foreign_keys,
            data_to_generate,
            fake,
            indexes_of_pk,
            pks,
            unique_keys,
            all_data,
        )
        potential_id = potential_id + 1
        all_data.append(data)
    logger.error(f"data generated for table: {table_name} in {time.time()- start}")
    start = time.time()
    columns_to_set_null = []
    number_columns = []
    name_columns = []
    id_column = []
    manipulated_value = []
    for column in own_results:
        columns = []
        name_columns.append(
            is_name_not_foreign(
                column, foreign_keys, table_name, unique_keys, data_to_generate
            )
        )
        id_column.append(
            is_id_not_foreign(column, foreign_keys, table_name, data_to_generate)
        )
        number_columns.append(
            check_if_value_is_changeable(
                table_name, column, foreign_keys, primary_keys, unique_keys
            )
        )
        for nullable_column in nullable_columns:
            if check_if_column_is_nullable(table_name, column[0], nullable_column):
                columns = generate_indexes(number_of_entries, 0.05)
        columns_to_set_null.append(columns)
    for i in range(0, len(columns_to_set_null)):
        for index in columns_to_set_null[i]:
            all_data[index][i] = None
    for i in range(0, len(number_columns)):
        if number_columns[i]:
            new_data, random_value = create_multiple_mins_max(all_data, i)
            if new_data is not None:
                all_data = new_data
            if random_value is not None:
                entry = []
                entry.append(table_name)
                entry.append(own_results[i][0])
                entry.append(random_value)
                manipulated_value.append(entry)
        if name_columns[i]:
            used_indexes = []
            entry = []
            first_index = generate_number_not_in_list(
                0, number_of_entries - 1, used_indexes
            )
            while all_data[first_index][i] is None:
                first_index = generate_number_not_in_list(
                    0, number_of_entries - 1, used_indexes
                )
            used_indexes.append(first_index)
            second_index = generate_number_not_in_list(
                0, number_of_entries - 1, used_indexes
            )
            while all_data[second_index][i] is None:
                second_index = generate_number_not_in_list(
                    0, number_of_entries - 1, used_indexes
                )
            used_indexes.append(second_index)
            third_index = generate_number_not_in_list(
                0, number_of_entries - 1, used_indexes
            )
            while all_data[third_index][i] is None:
                third_index = generate_number_not_in_list(
                    0, number_of_entries - 1, used_indexes
                )
            used_indexes.append(third_index)
            fourth_index = generate_number_not_in_list(
                0, number_of_entries - 1, used_indexes
            )
            while all_data[fourth_index][i] is None:
                fourth_index = generate_number_not_in_list(
                    0, number_of_entries - 1, used_indexes
                )
            used_indexes.append(fourth_index)
            all_data[first_index][i] = "Schmidt"
            all_data[second_index][i] = "Schmitt"
            all_data[third_index][i] = "Schmit"
            all_data[fourth_index][i] = "Schmittt"
            entry.append(table_name)
            entry.append(own_results[i][0])
            manipulated_value.append(entry)
        if id_column[i]:
            # for all ids generated
            all_data = generate_random_id(1, 1_000_000, all_data, i)
    logger.error(f"data manipulated for table: {table_name} in {time.time()- start}")
    start = time.time()
    insert(cursor, all_data, own_results, table_name, connection)
    logger.error(f"data inserted for table: {table_name} in {time.time()- start}")
    return manipulated_value


def generate_single_entry(
    own_results,
    own_foreign_keys,
    table_name,
    last_used_item,
    foreign_keys_from_same_table,
    all_foreign_key_data,
    data,
    primary_keys,
    foreign_keys,
    current_foreign_key_index,
    foreign_keys_that_are_primary_keys,
    potential_id,
    number_of_foreign_keys,
    data_to_generate,
    fake,
    indexes_of_pk,
    pks,
    unique_keys,
    all_data,
):
    indexes_of_foreign_keys = {}
    for foreign_key in foreign_keys:
        if foreign_key[2] not in indexes_of_foreign_keys:
            indexes_of_foreign_keys[foreign_key[2]] = -1
    current_foreign_key = ""
    counter = 0
    for column in own_results:
        for own_foreign_key in own_foreign_keys:
            if own_foreign_key[1] == column[0]:
                current_foreign_key = own_foreign_key[2]
                break
        if check_for_foreign_key(column[0], own_foreign_keys, table_name):
            if any(
                column[0] == tuple_item[1]
                for sublist in foreign_keys_from_same_table
                for tuple_item in sublist
            ):
                if indexes_of_foreign_keys[current_foreign_key] == -1:
                    random_number = generate_random_number(
                        0, len(all_foreign_key_data[current_foreign_key_index]) - 1
                    )
                    indexes_of_foreign_keys[current_foreign_key] = random_number
                else:
                    random_number = indexes_of_foreign_keys[current_foreign_key]
            else:
                random_number = generate_random_number(
                    0, len(all_foreign_key_data[current_foreign_key_index]) - 1
                )
            data.append(all_foreign_key_data[current_foreign_key_index][random_number])
            if any(
                column[0] == tup[1] for tup in foreign_keys_that_are_primary_keys
            ):  # needs to be looked for multiple foreign keys from different tables that are the pk
                all_foreign_key_data[current_foreign_key_index].pop(random_number)
            current_foreign_key_index = (
                current_foreign_key_index + 1
            ) % number_of_foreign_keys
        else:
            if is_unique(table_name, column[0], unique_keys):
                unallowed = [sublist[counter] for sublist in all_data]
                result, _ = gen_unique_data(
                    data_to_generate,
                    potential_id,
                    fake,
                    table_name,
                    column[0],
                    column,
                    unallowed,
                )
            else:
                result, _ = gen_specific_data(
                    data_to_generate, potential_id, fake, table_name, column[0], column
                )
            data.append(result)
        counter += 1
    pk_of_entry = ""
    for pk_index in indexes_of_pk:
        if isinstance(data[pk_index], int) or isinstance(data[pk_index], float):
            pk_of_entry += str(data[pk_index])
        elif isinstance(data[pk_index], str):
            pk_of_entry += data[pk_index]
        else:
            pk_of_entry += data[pk_index].strftime("%d/%m/%Y")
    if str(pk_of_entry) in pks:
        data = []
        data, pks, last_used_item = generate_single_entry(
            own_results,
            own_foreign_keys,
            table_name,
            -1,
            foreign_keys_from_same_table,
            all_foreign_key_data,
            data,
            primary_keys,
            foreign_keys,
            current_foreign_key_index,
            foreign_keys_that_are_primary_keys,
            potential_id,
            number_of_foreign_keys,
            data_to_generate,
            fake,
            indexes_of_pk,
            pks,
            unique_keys,
            all_data,
        )
    else:
        pks.add(pk_of_entry)
    return data, pks, last_used_item


def gen_all_data(
    own_results,
    potential_id,
    fake,
    data_to_generate,
    table_name,
    primary_keys,
    foreign_keys,
    unique_keys,
    all_data,
):
    data = []
    counter = 0
    for col in own_results:
        if is_unique(table_name, col[0], unique_keys):
            unallowed = [sublist[counter] for sublist in all_data]
            result, _ = gen_unique_data(
                data_to_generate, potential_id, fake, table_name, col[0], col, unallowed
            )
        else:
            result, _ = gen_specific_data(
                data_to_generate, potential_id, fake, table_name, col[0], col
            )
        counter += 1
        if col[4] is not None:
            if len(result) > col[4]:
                result = result[: col[4]]
        data.append(result)
    return data


def is_unique(table_name, attribute, unique_keys):
    for unique_key in unique_keys:
        if table_name == unique_key[0] and attribute == unique_key[1]:
            return True
    return False


def generate_random_number(min, max):
    if max == 0:
        return 0
    return random.randint(min, max)


def generate_indexes(length, percentage):
    indexes = []
    while len(indexes) / length < percentage:
        indexes.append(generate_random_number(0, length - 1))
    return indexes


def is_primary_key(table_name, column_name, primary_keys):
    for pk in primary_keys:
        if table_name == pk[0] and column_name == pk[1]:
            return True
    return False


def is_name(column, table_name, unique_keys):
    for unique_key in unique_keys:
        if table_name == unique_key[0] and column[0] == unique_key[1]:
            return False
    if (column[0].upper() == "NAME" or column[0].upper() == "NACHNAME") and column[
        1
    ] == "varchar":
        return True
    return False


def is_id(col, data_to_generate, table_name):
    for entry in data_to_generate:
        if entry[0] == table_name and entry[1] == col[0] and entry[2] == "ID":
            return True
    return False


def is_lastname(col, data_to_generate, table_name, unique_keys):
    for unique_key in unique_keys:
        if table_name == unique_key[0] and col[0] == unique_key[1]:
            return False
    for entry in data_to_generate:
        if entry[0] == table_name and entry[1] == col[0] and entry[2] == "Nachname":
            return True
    return False


def is_name_not_foreign(
    column, foreign_keys, table_name, unique_keys, data_to_generate
):
    for foreign_key in foreign_keys:
        if foreign_key[0] == table_name and foreign_key[1] == column[0]:
            return False
    return is_lastname(column, data_to_generate, table_name, unique_keys)


def is_id_not_foreign(column, foreign_keys, table_name, data_to_generate):
    for foreign_key in foreign_keys:
        if foreign_key[0] == table_name and foreign_key[1] == column[0]:
            return False
    return is_id(column, data_to_generate, table_name)


def is_key(table_name, column_name, primary_keys, foreign_keys):
    for pk in primary_keys:
        if table_name == pk[0] and column_name == pk[1]:
            return True
    for fk in foreign_keys:
        if table_name == fk[0] and column_name == fk[1]:
            return True
    return False
