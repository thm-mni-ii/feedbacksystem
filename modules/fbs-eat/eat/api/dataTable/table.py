"""
This module provides the Dash DataTable framework for building the E-Learning Analytics Tool.
"""

import dash_bootstrap_components as dbc
from dash import dcc, Dash
from dash import html
from dash import dash_table, callback
from dash.dependencies import Input, Output
import pandas as pd
from datetime import datetime, timedelta
from api.connect.data_service import data
import logging

logger = logging.getLogger("name")


df = data(-1)


def get_attributes_to_hide(list,excludes):
    for ex in excludes:
        list.remove(ex)
    return list

dff = df

for _, row in dff.iterrows():
    logger.error(_)
    logger.error(row['Statement'])

layout = html.Div(
    [
        html.H3("Table", style={"text-align": "left", "margin-left": "407px"}),
        dbc.Container(
            dbc.Card(
                [
                    dbc.Col(
                        html.Div(
                            [
                                "Date/Time From",
                                date_time_from := dcc.Input(
                                    datetime.now().strftime("%Y-%m-%dT%H:%M"),
                                    type="datetime-local",
                                ),
                                "Date/Time To",
                                date_time_to := dcc.Input(
                                    (
                                        datetime.now()
                                        + timedelta(hours=1, minutes=30)
                                    ).strftime("%Y-%m-%dT%H:%M"),
                                    type="datetime-local",
                                ),
                            ]
                        ),
                    ),
                    dcc.Checklist(
                        id='toggle_hiding_queries',
                        options=["Exclude equal queries","Exclude Date"],
                        inline=True,
                        style={
                            "display": "flex",
                        },
                        inputClassName="checklist label",
                    ),
                    table := dash_table.DataTable(
                        id="datatable-interactivity",
                        data=df.to_dict("records"),
                        columns=[{"id": c, "name": c, "hideable": True} for c in df.columns],
                        style_as_list_view=True,
                        filter_action="custom",
                        page_size=10,
                        editable=False,
                        sort_action="native",
                        sort_mode="multi",
                        column_selectable="multi",
                        row_selectable=False,
                        row_deletable=False,
                        page_action="native",
                        page_current=0,
                        hidden_columns=get_attributes_to_hide(df.astype(str).columns.tolist(),
                                                              ["Statement", "UniqueName"]),
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
                        tooltip_data=[{"Statement": str(row["Statement"])} for _, row in dff.iterrows()],
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
                            'fontSize': '18px'
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
# Update date_time_to based on date_time_from
@callback(Output(date_time_to, "value"), Input(date_time_from, "value"))
def update_date_time_to(input_value):
    try:
        date_time = datetime.strptime(input_value, "%Y-%m-%dT%H:%M")
        return date_time + timedelta(hours=1, minutes=30)
    except:
        return input_value

@callback(
    Output("filter-query-output", "children"),
    Output("datatable-interactivity", "data"),
    Output("datatable-interactivity","tooltip_data"),
    Input("datatable-interactivity", "filter_query"),
    Input(date_time_from, "value"),
    Input(date_time_to, "value"),
    Input("intermediate-value","data"),
    Input("toggle_hiding_queries","value")
)

def read_query(query,date_time_from,date_time_to,daten,toggle_queries):
    """
    Reads the filter options of the previous Dash DataTable and creates a text out of it

    Args:
        Filter query of a Dash DataTable.

    Returns:
        Printable String to show the user which filters are set. Also works for hided columns.
    """
    try:
        date_time_from = datetime.strptime(date_time_from, "%Y-%m-%dT%H:%M")
    except:
        date_time_from = datetime.strptime(date_time_from, "%Y-%m-%dT%H:%M:%S")

    try:
        date_time_to = datetime.strptime(date_time_to, "%Y-%m-%dT%H:%M")
    except:
        date_time_to = datetime.strptime(date_time_to, "%Y-%m-%dT%H:%M:%S")

    date_time_from = date_time_from - timedelta(hours=2)
    date_time_to = date_time_to - timedelta(hours=2)



    df = pd.read_json(daten)
    df["Time"] = pd.to_datetime(df.Time)

    if toggle_queries:
        if "Exclude equal queries" in toggle_queries:
            df = df.drop_duplicates(subset='Statement')
        if "Exclude Date" not in toggle_queries:
            df = df[
                (df.Time >= date_time_from) & (df.Time < date_time_to)
                ]
    else:
        df = df[
            (df.Time >= date_time_from) & (df.Time < date_time_to)
            ]
    dff = df
    tooltip_data = [{"Statement": str(row["Statement"])} for _, row in dff.iterrows()]
    if query is None or len(query) == 0:
        retString = []
        retString.append("No filter set")
        return retString, dff.to_dict("records"), tooltip_data
    query = query.replace(" scontains ", " s= ")
    query = query.replace(" icontains ", " s= ")
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
    dff = df
    for name, value in values.items():
        dff = dff[dff[name] == value]
        output.append(f"{name} = {value}")
    result = ", ".join(output)
    result = "Filter: " + result
    return dcc.Markdown(result), dff.to_dict("records"), tooltip_data
