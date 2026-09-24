"""
runs the eat server and calls all other component builders
"""
import json
import os
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
from jwt import PyJWKClient
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
JWKS_URL = os.getenv("OIDC_JWK_SET_URI", "http://identity-service:8080/oauth2/jwks")
OIDC_ISSUER = os.getenv("OIDC_ISSUER", "http://localhost:8080")

jwks_client = PyJWKClient(JWKS_URL)


def verify_token(token: str):
    """
    Verifies the JWT token using JWKS (RS256) or legacy secret key (HS256).
    """
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=OIDC_ISSUER,
            options={"verify_aud": False},
        )
    except Exception:
        if SECRET_KEY:
            return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        raise


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
        token = verify_token(daten)
    # pylint: disable-next=broad-exception-caught
    except Exception:
        return (
            create_error_screen(
                "Sie sind nicht berechtigt, auf diese Daten zuzugreifen."
            ),
            [],
            [],
        )
    user_id = token.get("sub") or token.get("id")
    course_access = []
    course_roles_raw = token.get("courseRoles")

    if course_roles_raw:
        course_roles = (
            json.loads(course_roles_raw)
            if isinstance(course_roles_raw, str)
            else course_roles_raw
        )
        for course, role in course_roles.items():
            if role in ("DOCENT", "TUTOR"):
                course_access.append(int(course))

    try:
        courses_resp = requests.get(
            f"{FBS_BASE_URL}/api/v1/users/{user_id}/courses",
            headers={"Authorization": f"Bearer {daten}"},
            verify=not FBS_TLS_NO_VERIFY,
            timeout=10,
        )
        if courses_resp.status_code == 200:
            courses = courses_resp.json()
            if not course_access:
                course_access = [int(course["id"]) for course in courses]
        else:
            courses = []
    except Exception:
        courses = []

    if not course_access:
        return (
            create_error_screen(
                "Sie sind nicht berechtigt, auf diese Daten zuzugreifen."
            ),
            [],
            [],
        )

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
