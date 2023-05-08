"""
This module provides the Dash DataTable framework for building the E-Learning Analytics Tool.
"""

import dash_bootstrap_components as dbc
from dash import dcc, Dash
from dash import html
from dash import dash_table, callback
from dash.dependencies import Input, Output
import pandas as pd

df = pd.read_csv("data/cleaned_data_with_names.csv")

layout = html.Div(
    [
        html.H3("Table", style={"text-align": "left", "margin-left": "407px"}),
        dbc.Container(
            dbc.Card(
                [
                    table := dash_table.DataTable(
                        id="datatable-interactivity",
                        data=df.to_dict("records"),
                        columns=[{"id": c, "name": c, "hideable": True} for c in df.columns],
                        style_as_list_view=True,
                        filter_action="native",  # Setze filter_action auf "native" oder "feather"
                        page_size=10,
                        editable=False,
                        sort_action="native",
                        sort_mode="multi",
                        column_selectable="multi",
                        row_selectable=False,
                        row_deletable=False,
                        page_action="native",
                        page_current=0,
                        css=[
                            {
                                "selector": ".dash-spreadsheet td div",
                                "rule": """
                                    line-height: 15px;
                                    max-height: 30px; min-height: 30px; height: 30px;
                                    display: inline-block;
                                    overflow-y: hidden;
                                    width: auto;
                                """,
                            }
                        ],
                        tooltip_data=[{"Statement": str(row["Statement"])} for _, row in df.iterrows()],
                        style_table={"overflow": "auto", "height": "auto"},
                        style_header={
                            "textAlign": "left",
                            "padding": "10px",
                            "font-size": "18px",
                            "font-weight": "bold",
                        },
                        style_cell={
                            "textAlign": "left",
                            "minWidth": "auto",
                            "maxWidth": "auto",
                            "width": "auto",
                            "font_size": "16px",
                            "whiteSpace": "normal",
                            "height": "auto",
                        },
                        style_filter={
                            "color": "white",
                            "font_size": "16px",
                        },
                        tooltip_delay=0,
                        tooltip_duration=None,
                    ),
                    html.Div(
                        id="filter-query-output",
                        style={"font-size": "18px", "font-weight": "bold"},
                    ),
                ],
                style={"padding": "10px"},
            )
        ),
    ]
)


@callback(
    Output("filter-query-output", "children"),
    Input("datatable-interactivity", "filter_query"),
)

def read_query(query):
    """
    Reads the filter options of the previous Dash DataTable and creates a text out of it

    Args:
        Filter query of a Dash DataTable.

    Returns:
        Printable String to show the user which filters are set. Also works for hided columns.
    """
    if query is None:
        return "No filter set"
    query = query.replace(" scontains ", " s= ")
    values = {}
    parts = query.split(" && ")
    for part in parts:
        name, value = part.split(" s= ")
        name = name.strip("{}")
        try:
            value = int(value)
        except ValueError:
            value = value.strip("'")
        values[name] = value
    output = []
    for name, value in values.items():
        output.append(f"{name} = {value}")
    result = ", ".join(output)
    result = "Filter: " + result
    return dcc.Markdown(result)
