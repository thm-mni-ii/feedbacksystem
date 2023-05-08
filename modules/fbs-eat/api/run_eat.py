import dash_bootstrap_components as dbc
from dash import Dash, html
import os
from flask import Flask

from api.dataTable.table import layout as table_layout
from api.dashboard.dashboard import layout as dashboard_layout
from api.analysis.analysis import layout as analysis_layout
from api.dataPreProcessing.chooseTaskType import layout as chooseTaskType_layout

debug = False if os.environ["DASH_DEBUG_MODE"] == "False" else True
#debug = True
external_stylesheets = [dbc.themes.BOOTSTRAP, "./assets/style.css"]
app = Dash(__name__, external_stylesheets=external_stylesheets)

server = app.server
app.title = "Dashboard"

app.layout = html.Div([
    html.Br(),
    html.H1("E-Learning Analytics Tool", style={"text-align": "center"}),
    html.Br(),
    html.Br(),
    chooseTaskType_layout,
    html.Br(),
    html.Br(),
    dashboard_layout,
    html.Br(),
    html.Br(),
    table_layout,
    html.Br(),
    html.Br(),
    analysis_layout,
    html.Br(),
    html.Br(),
])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="8050", debug=debug)
