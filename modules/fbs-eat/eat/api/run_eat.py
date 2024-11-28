"""
runs the eat server and calls all other component builders
"""

import json
import os
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
from flask_session import Session
import flask
import jwt

import requests
import dash_bootstrap_components as dbc

from api.analysis.analysis import layout as analysis_layout
from api.connect.data_service import get_data
from api.dashboard.dashboard import layout as dashboard_layout
from api.data_table.table import layout as table_layout

DEBUG = os.environ["DASH_DEBUG_MODE"]

SESSION_TYPE = "redis"
URL_BASE_PATH = os.getenv("URL_BASE_PATH")
SECRET_KEY = os.getenv("JWT_SECRET")
FBS_BASE_URL = os.getenv("FBS_BASE_URL")
FBS_TLS_NO_VERIFY = os.getenv("FBS_TLS_NO_VERIFY") == "true"


external_stylesheets = [dbc.themes.BOOTSTRAP, "./assets/style.css"]
server = flask.Flask(__name__)
app = Dash(
    __name__,
    external_stylesheets=external_stylesheets,
    suppress_callback_exceptions=True,
    server=server,
    url_base_pathname=URL_BASE_PATH,
)

app.title = "Dashboard"
app.server.secret_key = os.getenv("SERVER_SESSION_SECRET")
Session(app)


def create_error_screen(text):
    """
    creates an error screen that is send to the user
    :param text: text that is going to be displayed
    :return: an html page with the given text in it
    """
    error_label = html.Div(html.Label(text, style={"font-size": "36px"}))
    return error_label


app.layout = html.Div(
    [
        dcc.Location(id="url", refresh=False),
        dcc.Store(id="intermediate-value"),
        dcc.Store(id="save_courses"),
        dcc.Store(id="courses_dict"),
        dcc.Store("is_date_on", "data"),
        dcc.Store("is_date_on_analysis", "data"),
        dcc.Store("is_date_on_dashboard", "data"),
        html.Div(id="container"),
    ]
)

app.clientside_callback(
    """
    function (url) {
        return localStorage.getItem("token");
    }
    """,
    Output("save_courses", "data"),
    Input("url", "pathname"),
)


# pylint: disable=unused-argument
@app.callback(
    Output("container", "children"),
    Output("intermediate-value", "data"),
    Output("courses_dict", "data"),
    Input("url", "pathname"),
    Input("save_courses", "data"),
)
def get_datas(url, daten):
    """
    decodes the user token and gets the according data
    :param url: used to trigger the callback when the page is loaded value does not matter
    :param daten: the token send in the first request
    :return: hhtml div containing all components of the page, the downloaded data,
    the real names of the courses in a list
    """
    try:
        token = jwt.decode(daten, SECRET_KEY, algorithms=["HS256"])
    # pylint: disable-next=broad-exception-caught
    except Exception:
        return (
            create_error_screen(
                "Sie sind nicht berechtigt, auf diese Daten zuzugreifen."
            ),
            [],
            [],
        )
    course_access = []
    course_roles = json.loads(token["courseRoles"])

    for course, role in course_roles.items():
        if role in ("DOCENT", "TUTOR"):
            course_access.append(int(course))

    if not course_access:
        return (
            create_error_screen(
                "Sie sind nicht berechtigt, auf diese Daten zuzugreifen."
            ),
            [],
            [],
        )

    courses = requests.get(
        f"{FBS_BASE_URL}/api/v1/users/{token['id']}/courses",
        headers={"Authorization": f"Bearer {daten}"},
        verify=not FBS_TLS_NO_VERIFY,
        timeout=10,
    ).json()
    courses_dict = {course["id"]: course["name"] for course in courses}

    return add_components(), get_data(course_access), courses_dict


# pylint: enable=unused-argument


def add_components():
    """
    gets all components of the page
    :return: list of all components
    """
    container = []
    container.append(html.Br())
    container.append(dashboard_layout)
    container.append(html.Br())
    container.append(html.Br())
    container.append(table_layout)
    container.append(html.Br())
    container.append(html.Br())
    container.append(analysis_layout)
    container.append(html.Br())
    container.append(html.Br())
    return container


if __name__ == "__main__":
    server.run(host="0.0.0.0", port="8050", DEBUG=DEBUG)
