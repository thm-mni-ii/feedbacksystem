import dash_bootstrap_components as dbc
from api.analysis.analysis import layout as analysis_layout
from api.connect.connecttominio import data
from api.dashboard.dashboard import layout as dashboard_layout
from api.dataPreProcessing.chooseTaskType import layout as chooseTaskType_layout
from api.dataTable.table import layout as table_layout
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
from flask import request, session
from flask_session import Session
import flask
import jwt

#debug = False if os.environ["DASH_DEBUG_MODE"] == "False" else True
debug = False
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
secret_key = "your-secret-key"

@app.server.before_request
def pri():
    #token =  request.headers['Authorization'].split(" ")[1]
    #print(token)
    #session['username'] = jwt.decode(token, secret_key, algorithms=["HS256"])
    #print(decoded_token)
    pass
app.layout = html.Div(
    [
        dcc.Location(id="url", refresh=False),
        dcc.Store(id="intermediate-value"),
        dcc.Store(id="save_courses"),
        html.Div(id="container"),
    ]
)


@app.callback(
    Output("container", "children"),
    Output("intermediate-value", "data"),
    Input("url", "pathname"),
    Input("save_courses","data")
)
def getDatas(url,daten):

    return addComponents(), data(1)


def addComponents():
    container = []
    container.append(html.Br())
    container.append(
        html.H1("E-Learning Analytics Tool", style={"text-align": "center"})
    )
    container.append(html.Br())
    container.append(html.Br())
    container.append(chooseTaskType_layout)
    container.append(html.Br())
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
