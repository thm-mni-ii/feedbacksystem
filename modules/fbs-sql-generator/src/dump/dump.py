import subprocess
import os
import logging
import mysql.connector
from src.database_information.database_information import get_table_information

logger = logging.getLogger("name")

mysql_password = os.getenv("MYSQL_PASSWORD")


def get_sql_dump(database, file_name):
    MYSQL_HOST = "mysql_dp"
    MYSQL_USER = "root"

    DUMP_FILE_PATH = file_name

    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST, user=MYSQL_USER, password=mysql_password, database=database
        )
        cursor = conn.cursor()
    except mysql.connector.Error as e:
        print("Error connecting to MySQL:", e)
        exit(1)

    real_table_list = []
    foreign_tables = []
    primary_tables, tables, foreign_keys, _, _ = get_table_information(conn, database)
    for primary_table in primary_tables:
        real_table_list.append(primary_table)
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
                real_table_list.append(foreign_table_name)
                foreign_tables.remove(foreign_table_name)

    create_table_statements = []
    for table in real_table_list:
        cursor.execute(f"SHOW CREATE TABLE {table};")
        create_table_statement = cursor.fetchone()[1] + ";"
        create_table_statements.append(create_table_statement)
    # Write CREATE TABLE statements to the dump file
    with open(DUMP_FILE_PATH, "w") as f:
        for create_table_statement in create_table_statements:
            f.write(create_table_statement + "\n")

        # Insert data into each table
        for table_name in real_table_list:
            select_query = f"SELECT * FROM {table_name};"
            cursor.execute(select_query)
            rows = cursor.fetchall()

            # Write INSERT statements for each row
            for row in rows:
                columns = ", ".join([f"`{desc[0]}`" for desc in cursor.description])
                values = ", ".join(
                    [f"'{value}'" if value is not None else "NULL" for value in row]
                )
                insert_statement = (
                    f"INSERT INTO {table_name} ({columns}) VALUES ({values});"
                )
                f.write(insert_statement + "\n")

    print("SQL dump file created successfully!")

    cursor.close()
    conn.close()
