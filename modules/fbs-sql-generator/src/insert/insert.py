import time

import logging

logger = logging.getLogger("name")


def insert(connection, data, cols, table, db):
    insert_query = f"INSERT INTO {table} ("
    end_string = ") VALUES ("
    for col in cols:
        insert_query = insert_query + f"{col[0]}, "
        end_string = end_string + "%s, "
    insert_query = insert_query[:-2]
    insert_query = insert_query + end_string
    insert_query = insert_query[:-2]
    insert_query = insert_query + ")"
    for data_row in data:
        connection.execute(insert_query, data_row)
        db.commit()
