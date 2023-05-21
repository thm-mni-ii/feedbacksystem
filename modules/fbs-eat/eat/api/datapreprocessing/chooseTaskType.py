import pandas as pd
import dash
import dash_bootstrap_components as dbc
from dash import dcc, html
from dash.dependencies import Input, Output

app = dash.Dash(__name__)

dropdown = dbc.Row(
    [
        dbc.Col(
            dcc.Dropdown(
                id="data-dropdown",
                options=[
                    {"label": "SQL", "value": "sql"},
                ],
                clearable=False,
                value="sql",
            )
        )
    ]
)

layout = dbc.Container(
    html.Div(
        style = {
            "align-items":"center",
            "justify":"center"
        },
        children = [
            html.Br(),
            html.Br(),
            html.Br(),
            dbc.Row(
                [
                    dbc.Col(
                        html.Div("Choose type of task", style={"text-align": "center"})
                    ),
                ],
                style={"text-align": "center"},
            ),
            html.Br(),
            dbc.Row(
                [
                    dbc.Col(dropdown, style={"text-align": "left"})
                ],
                style={"display": "flex","margin-left": "45%","margin-right": "45%","align-items": "center"},
            ),
        ],
    )
)

