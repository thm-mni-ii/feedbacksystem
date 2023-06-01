"""
This module provides the Dash DataTable framework for building the E-Learning Analytics Tool.
"""
from datetime import datetime, timedelta
import pandas as pd
import dateutil.parser
import dash
import dash_bootstrap_components as dbc
from dash import dcc
from dash import html
from dash import dash_table, callback
from dash.dependencies import Input, Output

from api.connect.data_service import get_data
from api.util.utilities import update_date_time


tmp_df = get_data(-1)


def get_attributes_to_hide(list_of_strings, excludes):
    """
    remove certain values from a list
    :param list_of_strings: a list of items
    :param excludes: list of items to be removed from the other list
    :return: list without the removed values
    """
    for ex in excludes:
        list_of_strings.remove(ex)
    return list_of_strings

# pylint: disable=duplicate-code

layout = html.Div(
    [
        html.H3("Table", style={"text-align": "left", "margin-left": "407px"}),
        dbc.Container(
            dbc.Card(
                [
                    dbc.Col(
                        timerow := html.Div(
                            [
                                "Date/Time From",
                                dcc.Input(
                                    id="date_time_from_table",
                                    value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                                    type="datetime-local",
                                ),
                                "Date/Time To",
                                dcc.Input(
                                    id="date_time_to_table",
                                    value=(
                                        datetime.now() + timedelta(hours=1, minutes=30)
                                    ).strftime("%Y-%m-%dT%H:%M"),
                                    type="datetime-local",
                                ),
                            ]
                        ),
                    ),
                    dcc.Checklist(
                        id="toggle_hiding_queries",
                        options=["Exclude equal queries", "Exclude Date"],
                        inline=True,
                        style={
                            "justify-content": "center",
                            "display": "flex",
                        },
                        inputClassName="checkbox",
                    ),
                    table := dash_table.DataTable(
                        id="datatable-interactivity",
                        data=tmp_df.to_dict("records"),
                        columns=[
                            {"id": c, "name": c, "hideable": True}
                            for c in tmp_df.columns
                        ],
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
                        hidden_columns=get_attributes_to_hide(
                            tmp_df.astype(str).columns.tolist(),
                            ["Statement", "UniqueName"],
                        ),
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
                        tooltip_data=[
                            {"Statement": str(row["Statement"])}
                            for _, row in tmp_df.iterrows()
                        ],
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
                            "fontSize": "18px",
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



# pylint: disable=too-many-return-statements
@callback(
    Output(timerow, "children"),
    Output("is_date_on", "data"),
    Input("toggle_hiding_queries", "value"),
    Input("is_date_on", "data"),
)

def hide_date(date_hider, is_date_on):
    """
    hides date input if box is checked
    :param date_hider: checkbox with date in it
    :param is_date_on: information if the date input was previously active
    :return: html Element for date input or have the input hidden
    """
    if dash.callback_context.triggered[0]["value"] is None:
        return (
            html.Div(
                [
                    "Date/Time From",
                    dcc.Input(
                        id="date_time_from_table",
                        value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                    "Date/Time To",
                    dcc.Input(
                        id="date_time_to_table",
                        value=(
                            datetime.now() + timedelta(hours=1, minutes=30)
                        ).strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                ]
            ),
            True,
        )
    if (
        "Exclude Date" not in dash.callback_context.triggered[0]["value"]
        and is_date_on
        and (len(date_hider) == 1 or not date_hider)
    ):
        return dash.no_update
    if (
        "Exclude equal queries" in dash.callback_context.triggered[0]["value"]
        and not is_date_on
        and (len(date_hider) == 1 or not date_hider)
    ):
        return (
            html.Div(
                [
                    "Date/Time From",
                    dcc.Input(
                        id="date_time_from_table",
                        value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                    "Date/Time To",
                    dcc.Input(
                        id="date_time_to_table",
                        value=(
                            datetime.now() + timedelta(hours=1, minutes=30)
                        ).strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                ]
            ),
            True,
        )
    if not date_hider:
        return (
            html.Div(
                [
                    "Date/Time From",
                    dcc.Input(
                        id="date_time_from_table",
                        value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                    "Date/Time To",
                    dcc.Input(
                        id="date_time_to_table",
                        value=(
                            datetime.now() + timedelta(hours=1, minutes=30)
                        ).strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                ]
            ),
            True,
        )
    if "Exclude Date" in date_hider:
        return (
            html.Div(
                children=[
                    "Date/Time From",
                    dcc.Input(
                        id="date_time_from_table",
                        value=(datetime.now() - timedelta(hours=500000)).strftime(
                            "%Y-%m-%dT%H:%M"
                        ),
                        type="datetime-local",
                    ),
                    "Date/Time To",
                    dcc.Input(
                        id="date_time_to_table",
                        value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                ],
                style={"visibility": "hidden"},
            ),
            False,
        )
    if "Exclude Date" not in date_hider:
        return (
            html.Div(
                [
                    "Date/Time From",
                    dcc.Input(
                        id="date_time_from_table",
                        value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                    "Date/Time To",
                    dcc.Input(
                        id="date_time_to_table",
                        value=(
                            datetime.now() + timedelta(hours=1, minutes=30)
                        ).strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                ]
            ),
            True,
        )
    return dash.no_update

# pylint: enable=too-many-return-statements


# Update date_time_to_table based on date_time_from_table
@callback(Output("date_time_to_table", "value"), Input("date_time_from_table", "value"))
def update_date_time_to_table(input_value):
    """
    set the time of the to-input 1 hour and 30 minutes after the from date,
    after the from date was changed
    :param input_value: datetime to which 90 minutes need to be added
    :return: datetime with updated time
    """
    return update_date_time(input_value, 90)


@callback(
    Output("filter-query-output", "children"),
    Output("datatable-interactivity", "data"),
    Output("datatable-interactivity", "tooltip_data"),
    Input("datatable-interactivity", "filter_query"),
    Input("date_time_from_table", "value"),
    Input("date_time_to_table", "value"),
    Input("intermediate-value", "data"),
    Input("toggle_hiding_queries", "value"),
)
def read_query(query, date_time_from_table, date_time_to_table, daten, toggle_queries):
    """
    Reads the filter options of the previous Dash DataTable and creates a text out of it

    Args:
        Filter query of a Dash DataTable.

    Returns:
        Printable String to show the user which filters are set. Also works for hided columns.
    """
    date_time_from_table = dateutil.parser.parse(date_time_from_table)

    date_time_to_table = dateutil.parser.parse(date_time_to_table)

    local_df = pd.read_json(daten)
    local_df["Time"] = pd.to_datetime(local_df.Time)

    if toggle_queries:
        if "Exclude equal queries" in toggle_queries:
            local_df = local_df.drop_duplicates(subset="Statement")
        if "Exclude Date" not in toggle_queries:
            local_df = local_df[
                (local_df.Time >= date_time_from_table)
                & (local_df.Time < date_time_to_table)
            ]
    else:
        local_df = local_df[
            (local_df.Time >= date_time_from_table)
            & (local_df.Time < date_time_to_table)
        ]
    tooltip_data = [
        {"Statement": str(row["Statement"])} for _, row in local_df.iterrows()
    ]
    if query is None or len(query) == 0:
        ret_string = []
        ret_string.append("No filter set")
        return ret_string, local_df.to_dict("records"), tooltip_data
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
    for name, value in values.items():
        local_df = local_df[local_df[name] == value]
        output.append(f"{name} = {value}")
    result = ", ".join(output)
    result = "Filter: " + result
    return dcc.Markdown(result), local_df.to_dict("records"), tooltip_data

# pylint: enable=duplicate-code
