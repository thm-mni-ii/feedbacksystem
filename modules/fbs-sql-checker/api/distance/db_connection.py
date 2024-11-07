import psycopg2
from dotenv import load_dotenv
import os


def setup_db(att_list):
    connection = None

    load_dotenv()
    HOSTNAME = os.getenv("HOSTNAME")
    DB_NAME = os.getenv("DB_NAME")
    USERNAME = os.getenv("DB_USERNAME")
    PASSWORD = os.getenv("PASSWORD")
    PORT_ID = os.getenv("PORT_ID")

    with psycopg2.connect(
        host=HOSTNAME, dbname=DB_NAME, user=USERNAME, password=PASSWORD, port=PORT_ID
    ) as connection:
        cursor = connection.cursor()
        _create_db(att_list, cursor)
        _populate_db(att_list, cursor)
        connection.commit()
    return connection


def _create_db(att_list, cursor):
    # Iterate over the attribute list
    for i, att in enumerate(att_list):
        # Generate SQL script to create a table for each attribute
        # Tables are named A, B, C, etc., with unique constraints on column 'x'
        sql_script = f"CREATE TABLE IF NOT EXISTS {chr(65 + i)} (x INTEGER, CONSTRAINT {chr(97 + i)}_unique_x UNIQUE (x));"
        cursor.execute(sql_script)  # Execute the SQL script


def _populate_db(att_list, cursor):
    bits = len(att_list)  # Determine the number of bits based on the length of att_list
    # Loop through all possible combinations based on the number of bits
    for i in range(2**bits):
        binary_number = format(
            i, f"0{bits}b"
        )  # Convert the current number to a binary string
        decimal_number = int(
            binary_number, 2
        )  # Convert the binary string to a decimal number
        offset = (
            -1
        )  # Initialize offset for iterating through the binary number from right to left
        # Iterate through each bit in the binary number
        for j in range(len(binary_number)):
            if binary_number[offset] == "1":
                # Generate a SQL query to select from table corresponding to the current bit
                select_query = (
                    f"SELECT * FROM {chr(65 + j)} WHERE x = {decimal_number};"
                )
                cursor.execute(select_query)  # Execute the select query
                result = cursor.fetchone()  # Fetch the result of the query
                # If no result is found, insert a new record into the table
                if result is None:
                    insert_query = (
                        f"INSERT INTO {chr(65 + j)} (x) VALUES ({decimal_number});"
                    )
                    cursor.execute(insert_query)  # Execute the insert query
            offset -= 1  # Move to the next bit in the binary number


def execute_query(query, connection: psycopg2):
    cursor = connection.cursor()
    # Execute the SQL query using the cursor
    cursor.execute(query)
    # Fetch all the rows returned by the executed query
    result = cursor.fetchall()
    # Convert the result into a set of frozensets for each row
    # This ensures each row is a unique, immutable set of elements
    res_set = set(frozenset(s) for s in result)
    connection.commit()
    return res_set
