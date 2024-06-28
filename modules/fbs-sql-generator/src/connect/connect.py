import mysql.connector
import time
import os
import logging

logger = logging.getLogger("name")
import configparser
import getpass


mysql_password = os.getenv("MYSQL_PASSWORD")
os.getenv("JWT_SECRET")


def connect(database_name):
    connection = []
    try:
        connection = mysql.connector.connect(
            host="mysql_dp",
            user="root",
            password=mysql_password,
            database=database_name,
            port=3307,
        )
        logger.error("Connected to the database")
        return connection
    except mysql.connector.Error as err:
        print("Error:", err)
        logger.error(f"FEHLER BY CONNECTION: {err}")


def create_and_connect(database_name):
    delete_database(database_name)
    create_database(database_name)
    return connect(database_name)


def connect_to_mysql():
    connection = []
    try:
        connection = mysql.connector.connect(host="localhost", user="root")
        print("Connected to the database")
        return connection
    except mysql.connector.Error as err:
        print("Error:", err)


def create_new_database(sql_script, cursor):
    try:
        cursor.execute(sql_script.decode("UTF-8"))
    except Exception as e:
        print(f"Error executing command: {e}")
    logger.error(cursor)


def delete_database(database_name):
    try:
        connection = mysql.connector.connect(
            host="mysql_dp", user="root", password=mysql_password, port=3306
        )
        if connection.is_connected():
            cursor = connection.cursor()
            create_db_query = f"DROP DATABASE `{database_name}`"
            cursor.execute(create_db_query)
            logger.error(f"databse: {database_name} deleted")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


def create_database(database_name):
    try:
        connection = mysql.connector.connect(
            host="mysql_dp", user="root", password=mysql_password, port=3306
        )
        if connection.is_connected():
            cursor = connection.cursor()
            create_db_query = f"CREATE DATABASE `{database_name}`"
            cursor.execute(create_db_query)
            logger.error(f"databse: {database_name} created")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


def get_sql_dump(database):
    MYSQL_HOST = "mysql_dp"
    MYSQL_USER = "root"

    DUMP_FILE_PATH = "/data/backup.sql"

    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST, user=MYSQL_USER, password=mysql_password, database=database
        )
        cursor = conn.cursor()
    except mysql.connector.Error as e:
        print("Error connecting to MySQL:", e)
        exit(1)

    cursor.execute("SHOW TABLES;")
    tables = cursor.fetchall()

    real_table_list = []
    create_table_statements = []
    for table in tables:
        table_name = table[0]
        cursor.execute(f"SHOW CREATE TABLE {table_name};")
        create_table_statement = cursor.fetchone()[1] + ";"
        create_table_statements.append(create_table_statement)
        if (
            "CONSTRAINT" not in create_table_statement
            and "FOREIGN KEY" not in create_table_statement
        ):
            real_table_list.append(create_table_statement)

    # Write CREATE TABLE statements to the dump file
    with open(DUMP_FILE_PATH, "w") as f:
        for create_table_statement in create_table_statements:
            f.write(create_table_statement + "\n")

        # Insert data into each table
        for table_name in tables:
            table_name = table_name[0]
            # Select data from table
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
