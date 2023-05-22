import dash_bootstrap_components as dbc
from api.analysis.analysis import layout as analysis_layout
from api.connect.data_service import data
from api.dashboard.dashboard import layout as dashboard_layout
from api.datapreprocessing.chooseTaskType import layout as chooseTaskType_layout
from api.dataTable.table import layout as table_layout
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
from flask import request, session
from flask_session import Session
import flask
import jwt
import json
import os
debug = True if os.environ["DASH_DEBUG_MODE"] == "True" else False

SESSION_TYPE = 'redis'
URL_BASE_PATH = os.getenv("URL_BASE_PATH")
SECRET_KEY = os.getenv("JWT_SECRET")


external_stylesheets = [dbc.themes.BOOTSTRAP, "./assets/style.css"]
server = flask.Flask(__name__)
app = Dash(
    __name__,
    external_stylesheets=external_stylesheets,
    suppress_callback_exceptions=True,
    server=server,
    url_base_pathname=URL_BASE_PATH
)

app.title = "Dashboard"
app.server.secret_key = os.getenv("SERVER_SESSION_SECRET")
Session(app)

def create_error_screen(text):
    error_label = html.Div(html.Label(text, style={'font-size': '36px'}))
    return error_label

app.layout = html.Div(
    [
        dcc.Location(id="url", refresh=False),
        dcc.Store(id="intermediate-value"),
        dcc.Store(id="save_courses"),
        html.Div(id="container"),
    ]
)

app.clientside_callback(
    '''
    function (url) {
        return localStorage.getItem("token");
    }
    ''',
    Output("save_courses","data"),Input("url","pathname"))

@app.callback(
    Output("container", "children"),
    Output("intermediate-value", "data"),
    Input("url", "pathname"),
    Input("save_courses","data")
)
def getDatas(url,daten):
    try:
        token = jwt.decode(daten, SECRET_KEY, algorithms=["HS256"])
    except:
        return create_error_screen("Sie sind nicht berechtigt, auf diese Daten zuzugreifen."), []
    courseAccess = []
    courseRoles = json.loads(token['courseRoles'])

    for course,role in courseRoles.items():
        if role == "DOCENT" or role == "TUTOR":
            courseAccess.append(int(course))

    if not courseAccess:
        return create_error_screen("Sie sind nicht berechtigt, auf diese Daten zuzugreifen."), []

    return addComponents(), data(courseAccess)


def addComponents():
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
    server.run(host="0.0.0.0", port="8050", debug=debug)
