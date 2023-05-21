import dash_bootstrap_components as dbc
from api.analysis.analysis import layout as analysis_layout
from api.connect.connecttominio import data
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

external_stylesheets = [dbc.themes.BOOTSTRAP, "./assets/style.css"]
server = flask.Flask(__name__)
app = Dash(
    __name__,
    external_stylesheets=external_stylesheets,
    suppress_callback_exceptions=True,
    server=server
)

app.title = "Dashboard"
SESSION_TYPE = 'redis'
app.server.secret_key = 'your_secret_key_here'
Session(app)
secret_key = "8Dsupersecurekeydf0"

@app.server.before_request
def authorizeSession():
    '''
    alert("1");
    console.log("1");
    const id = localStorage.get('token');
    console.log(id);
    console.log("2222222222222222222222222222222222222222222222222222222222222222222222222222222222");
    :return:
    '''

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
    token = jwt.decode(daten, secret_key, algorithms=["HS256"])
    courseAccess = []
    courseRoles = json.loads(token['courseRoles'])
    for course,role in courseRoles.items():
        if role == "DOCENT" or role == "TUTOR":
            courseAccess.append(int(course))
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
