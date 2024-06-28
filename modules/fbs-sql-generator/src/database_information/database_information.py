import copy

import logging

logger = logging.getLogger("name")


def get_columns(cursor, table_name, database_name):
    query = f"SELECT COLUMN_NAME, DATA_TYPE, TABLE_SCHEMA, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table_name}' "
    cursor.execute(query)
    result = cursor.fetchall()
    own_results = []
    nullable_columns = []
    for row in result:
        if row[2] == database_name:
            own_results.append(row)
            if row[3] == "YES":
                new_tuple = (table_name, row[0])
                nullable_columns.append(new_tuple)
    return own_results, nullable_columns


def get_all_table_information(cursor, database_name):
    query = f"SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '{database_name}'"
    cursor.execute(query)
    result = cursor.fetchall()
    return result


def get_keys(cursor, database_name):
    query = f"""
            SELECT
                TABLE_NAME,
                COLUMN_NAME
            FROM
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE
                TABLE_SCHEMA = '{database_name}'
                and REFERENCED_TABLE_NAME IS NOT NULL;
            """
    cursor.execute(query)
    keys = cursor.fetchall()
    return keys


def get_table_information(connection, database_name):
    cursor = connection.cursor()
    query = f"""
            SELECT
                TABLE_NAME,
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE
                TABLE_SCHEMA = '{database_name}'
            """

    cursor.execute(query)
    constraint_info = cursor.fetchall()
    tables = []
    primary_keys = []
    foreign_keys = []
    multiple_primary_keys = []
    unique_keys = []
    for row in constraint_info:
        if row[0] not in tables:
            tables.append(row[0])
        if row[1] == "PRIMARY":
            new_tuple = (row[0], row[2])
            primary_keys.append(new_tuple)
        if row[1] != "PRIMARY" and row[1] != row[2]:
            new_tuple = (row[0], row[2], row[3], row[4])
            foreign_keys.append(new_tuple)
        if row[1] == row[2]:
            new_tuple = (row[0], row[1])
            unique_keys.append(new_tuple)
    for i in range(0, len(primary_keys) - 2):
        if primary_keys[i][0] == primary_keys[i + 1][0]:
            multiple_primary_keys.append(primary_keys[i][0])

    primary_tables = copy.deepcopy(tables)
    for table in tables:
        for key in foreign_keys:
            if table in key[0]:
                if table in primary_tables:
                    primary_tables.remove(table)
    cursor.close()
    return primary_tables, tables, foreign_keys, primary_keys, unique_keys
