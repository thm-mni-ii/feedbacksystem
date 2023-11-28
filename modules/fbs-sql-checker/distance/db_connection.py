import psycopg2
import constants as c

connection = None


def setup_db(att_list):
    with psycopg2.connect(
            host=c.HOSTNAME,
            dbname=c.DB_NAME,
            user=c.USERNAME,
            password=c.PASSWORD,
            port=c.PORT_ID
    ) as connection:
        cursor = connection.cursor()

        for i, att in enumerate(att_list):
            sql_script = f"CREATE TABLE IF NOT EXISTS {chr(65 + i)} (x INTEGER, CONSTRAINT {chr(97 + i)}_unique_x UNIQUE (x));"
            cursor.execute(sql_script)

        bits = len(att_list)
        for i in range(2 ** bits):
            binary_number = format(i, f'0{bits}b')
            decimal_number = int(binary_number, 2)
            offset = -1
            for j in range(len(binary_number)):
                if binary_number[offset] == '1':
                    select_query = f"SELECT * FROM {chr(65 + j)} WHERE x = {decimal_number};"
                    cursor.execute(select_query)
                    result = cursor.fetchone()

                    if result is None:
                        insert_query = f"INSERT INTO {chr(65 + j)} (x) VALUES ({decimal_number});"
                        cursor.execute(insert_query)
                offset -= 1
        connection.commit()
    return connection


def execute_query(query, connection: psycopg2):
    cursor = connection.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    res_set = set(frozenset(s) for s in result)
    connection.commit()
    return res_set
