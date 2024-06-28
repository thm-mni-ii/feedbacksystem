from src.connect.connect import (
    create_and_connect,
    connect,
    create_new_database,
    get_sql_dump,
)
from src.database_information.database_information import (
    get_table_information,
    get_all_table_information,
    get_keys,
)
from src.data.data import get_generation_information
from src.generate_data.generate_data import generate_tables
from flask import Flask, render_template, request, send_file
from faker import Faker
from src.templates.table import generate_html_tables
from src.templates.download_file import download_file
from src.helper.helper import find_table_and_column
from src.enums.datatype import Datatype
from src.dump.dump import get_sql_dump
import sys
import time
import logging
import threading
import os
import jwt
import json


logger = logging.getLogger("name")

secret_key = "your-256-bit-secret"

app = Flask(__name__)


@app.route("/")
def index():
    try:
        response = get_token_from_header(request.headers["Authorization"])
        logger.error(response)
        if response == -1:
            return "<H1> Unauthorized</H1>", 403
    except Exception as e:
        logger.error(e)
        return "<H1>Unauthorized</H1>", 401
    return render_template("input.html")


@app.route("/submit", methods=["POST"])
def show_template():
    file = request.files["sql"].read()
    try:
        response = get_token_from_header(request.headers["Authorization"])
        logger.error(response)
        if response == -1:
            return "<H1> Error retrieving your file </H1>", 403
        database_name = str(
            response["id"]
        )
    except Exception as e:
        logger.error(e)
        return "<H1> Error retrieving your file </H1>", 401
    connection = create_and_connect(database_name)
    cursor = connection.cursor()
    create_new_database(file, cursor)
    time.sleep(1)
    cursor.close()
    connection.close()
    connection = connect(database_name)
    cursor = connection.cursor()
    key_data = get_keys(cursor, database_name)
    data = get_all_table_information(cursor, database_name)
    results = get_generation_information(data)
    new_data = []
    tables = []
    for i in range(0, len(results)):
        if data[i][3] not in tables:
            tables.append(data[i][3])
        entry = []
        entry.append(data[i][3])
        entry.append(data[i][0])
        entry.append(results[i].value)
        entry.append(data[i][1])
        test_tuple = (data[i][3], data[i][0])
        if test_tuple in key_data:
            entry.append(True)
        else:
            entry.append(False)
        new_data.append(entry)
    return generate_html_tables(new_data, tables)


@app.route("/changes", methods=["POST"])
def show():
    try:
        start = time.time()
        try:
            response = get_token_from_header(request.headers["Authorization"]) 
            if response == -1:
                return 403
            database_name = str(
                response["id"]
            )
        except Exception as e:
            logger.error(e)
            return "<H1> Error retrieving your file </H1>", 401
        table_data = []
        entries_in_table = []
        for key, value in request.form.items():
            entry = []
            if value.isdigit():
                entry.append(key)
                entry.append(value)
                entries_in_table.append(entry)
            else:
                table, column = find_table_and_column(key, "---", "---dp")
                entry.append(table)
                entry.append(column)
                entry.append(value)
                table_data.append(entry)
        fake = Faker("de_DE")
        connection = connect(database_name)
        primary_tables, tables, foreign_keys, primary_keys, unique_keys = (
            get_table_information(connection, database_name)
        )
        cursor = connection.cursor()
        sys.setrecursionlimit(2000)
        manipulated_values = generate_tables(
            primary_tables,
            cursor,
            connection,
            database_name,
            tables,
            foreign_keys,
            primary_keys,
            fake,
            entries_in_table,
            table_data,
            unique_keys,
        )
        cursor.close()
        connection.close()
        file_path = f"/data/{database_name}.sql"
        get_sql_dump(database_name, file_path)
        end = time.time() - start
        logger.error(f"Total  Time: {end}")
    except Exception as e:
        logger.error(e)
        return "<H1> Error retrieving your file </H1>", 500
    try:
        return download_file(
            manipulated_values, get_token(request.headers["Authorization"])
        )
    except Exception as e:
        logger.error(e)
        return "<H1> Error retrieving your file </H1>", 500


@app.route("/download", methods=["GET"])
def download():
    try:
        response = get_token_from_header(request.headers["Authorization"])
        if response == -1:
            return 403
        database_name = str(
            response["id"]
        )
    except Exception as e:
        logger.error(e)
        return "<H1> Error retrieving your file </H1>", 401
    file_path = f"/data/{database_name}.sql"
    get_sql_dump(database_name, file_path)
    threading.Thread(
        target=background_task,
        args=(
            file_path,
            database_name,
        ),
    ).start()
    try:
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        logger.error(e)
        return "<H1> Error retrieving your file </H1>", 500


@app.route("/drop_db")
def drop_db():
    try:
        database_name = "dp"
        file_path = "/data/backup.sql"
        threading.Thread(
            target=background_task,
            args=(
                file_path,
                database_name,
            ),
        ).start()
        return render_template("input.html")
    except:
        return render_template("input.html")


def background_task(file_path, database_name):
    with app.app_context():
        logger.error(f"Background task started for file: {file_path}")
        import time

        time.sleep(5)
        try:
            connection = connect(database_name)
            command = f"DROP DATABASE `{database_name}`"
            cursor = connection.cursor()
            cursor.execute(command)
            logger.error("database dropped")
            os.remove(file_path)
            logger.error(f"File {file_path} deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                logger.error("MySQL connection is closed")


def get_token_from_header(auth_header):
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
        except jwt.InvalidTokenError:
            logger.error("Invalid token")
        course_access = []
        logger.error(decoded_token)
        course_roles = json.loads(decoded_token["courseRoles"])
        logger.error(course_roles)
        for course, role in course_roles.items():
            if role in ("DOCENT"):
                course_access.append(int(course))
        logger.error(course_access)
        if len(course_access) == 0:
            return -1
        return decoded_token
    else:
        logger.error("Invalid Authorization Bearer")
        raise ValueError("Invalid Authorization header")


def get_token(auth_header):
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        token = ""
    return token


if __name__ == "__main__":
    app.run(debug=False, port=3002)
