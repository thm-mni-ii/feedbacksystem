"""
Display data while making it possible to filter in background
"""
from datetime import datetime, timedelta

import dash
import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
from dash import ALL, Input, Output, callback, dcc, html
import dateutil.parser

from api.connect.data_service import get_data
from api.util.utilities import (
    update_date_time,
    create_new_columns_buttons,
    create_new_filter_buttons,
    prepare_data_for_graph,
    create_marks_for_slider,
    update_button,
    update_slider,
    filter_checklist,
    update_course,
    add_checklist,
    add_slider,
    create_time_row,
    add_exercise_dropdown
)


tmp_df = get_data(-1)

all_filters = [
    "Projection Attributes",
    "Selection Attributes",
    "Strings",
    "Joins",
    "Tables",
    "Correct",
    "GroupBy",
    "OrderBy",
]
columns = []
correctfilters = []
incorrectfilters = []

# pylint: disable=line-too-long

layout = html.Div(
    [
        html.H3(
            "Flexible Analyses", style={"text-align": "left", "margin-left": "407px"}
        ),
        dbc.Container(
            dbc.Card(
                html.Div(
                    id="analysis_box",
                    children=[
                        html.Div(  ## Dropdown menus
                            [
                                dbc.Container(
                                    [
                                        dbc.Row(  ## Dropdown menus
                                            [
                                                dbc.Col(
                                                    add_exercise_dropdown("course_analysis", "Course",
                                                                          tmp_df.CourseName.unique()),
                                                ),
                                                dbc.Col(
                                                    add_exercise_dropdown("exercise_analysis", "Exercise",
                                                                          tmp_df.UniqueName.unique()),
                                                ),
                                                dbc.Col(
                                                    create_time_row(
                                                        "timerow_analysis",
                                                        "date_time_from2",
                                                        "date_time_to2",
                                                    ),
                                                ),
                                                add_checklist("checkbox_analysis"),
                                                add_slider(
                                                    tmp_df,
                                                    "slider_attempt_analysis",
                                                    "checklist_filter_"
                                                    "components_analysis",
                                                ),
                                            ]
                                        )
                                    ],
                                    style={"padding": "10px"},
                                ),
                            ]
                        ),
                        dcc.Graph(id="line-graph", figure={}),
                        html.Div(
                            id="aktiv",
                            style={
                                "margin-left": "20%",
                                "margin-bottom": "40px",
                                "margin-top": "20px",
                            },
                            children=[
                                html.Table(
                                    style={
                                        "border-collapse": "separate",
                                        "border-spacing": "100px 25px",
                                    },
                                    children=[
                                        html.Tr(
                                            [
                                                html.Td(
                                                    "Active filters",
                                                    style={"font-size": "18px"},
                                                ),
                                                html.Td(
                                                    id="filter",
                                                    style={"height": "40px"},
                                                ),
                                            ]
                                        ),
                                        html.Tr(
                                            [
                                                html.Td(
                                                    "Active Columns",
                                                    style={"font-size": "18px"},
                                                ),
                                                html.Td(
                                                    id="zeilen",
                                                    style={"height": "40px"},
                                                ),
                                            ]
                                        ),
                                    ],
                                )
                            ],
                        ),
                        html.Div(
                            id="filter_block",
                            children=[
                                html.Table(
                                    style={
                                        "borderCollapse": "collapse",
                                        "width": "100%",
                                    },
                                    id="tabelle",
                                    children=[
                                        html.Thead(
                                            [
                                                html.Tr(
                                                    [
                                                        html.Th(
                                                            "Key figure",
                                                            style={
                                                                "text-align": "center"
                                                            },
                                                        ),
                                                        html.Th(
                                                            "Background filter",
                                                            style={
                                                                "text-align": "center"
                                                            },
                                                        ),
                                                        html.Th(
                                                            "Columns",
                                                            style={
                                                                "text-align": "center"
                                                            },
                                                        ),
                                                    ]
                                                ),
                                                html.Tr(
                                                    [
                                                        html.Td(),
                                                        html.Td(
                                                            children=[
                                                                html.Label(
                                                                    "True",
                                                                    style={
                                                                        "color": "lightgreen",
                                                                        "float": "left",
                                                                    },
                                                                ),
                                                                html.Label(
                                                                    "False",
                                                                    style={
                                                                        "color": "red",
                                                                        "float": "right",
                                                                    },
                                                                ),
                                                            ],
                                                            style={
                                                                "text-align": "center"
                                                            },
                                                        ),
                                                        html.Td(),
                                                    ]
                                                ),
                                            ]
                                        ),
                                        html.Tbody(
                                            id="body",
                                            children=[
                                                html.Tr(
                                                    [
                                                        html.Td(
                                                            row,
                                                            id={
                                                                "type": "name",
                                                                "index": row,
                                                            },
                                                            style={
                                                                "textAlign": "center"
                                                            },
                                                        ),
                                                        html.Td(
                                                            dcc.Slider(
                                                                id={
                                                                    "type": "slider_background_filter",
                                                                    "index": row,
                                                                },
                                                                min=0,
                                                                max=2,
                                                                step=1,
                                                                value=1,
                                                                included=False,
                                                            ),
                                                            style={
                                                                "textAlign": "center"
                                                            },
                                                        ),
                                                        html.Td(
                                                            html.Button(
                                                                "+",
                                                                id={
                                                                    "type": "add-button",
                                                                    "index": row,
                                                                },
                                                                className="add-button",
                                                            ),
                                                            style={
                                                                "textAlign": "center"
                                                            },
                                                        ),
                                                    ]
                                                )
                                                for row in all_filters
                                            ],
                                        ),
                                    ],
                                )
                            ],
                        ),
                    ],
                ),
            )
        ),
    ]
)

# pylint: enable=line-too-long


@callback(
    Output("timerow_analysis", "children"),
    Output("is_date_on_analysis", "data"),
    Input("checkbox_analysis", "value"),
    Input("is_date_on_analysis", "data"),
)
def hide_time(checkbox, is_date_on):
    """
    hide the time-input when the time checkbox is not selected
    :param checkbox: all checkboxes
    :return: the checkbox but with the inputs hidden
    """
    if "Date" in checkbox and is_date_on:
        return dash.no_update
    if "Date" in checkbox:
        test = html.Div(
            [
                "Date/Time From",
                dcc.Input(
                    id="date_time_from2",
                    value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                    type="datetime-local",
                ),
                "Date/Time To",
                dcc.Input(
                    id="date_time_to2",
                    value=(datetime.now() + timedelta(hours=1, minutes=30)).strftime(
                        "%Y-%m-%dT%H:%M"
                    ),
                    type="datetime-local",
                ),
            ]
        )
        return test, True
    return (
        html.Div(
            children=[
                "Date/Time From",
                dcc.Input(
                    id="date_time_from2",
                    value=(datetime.now() - timedelta(hours=500000)).strftime(
                        "%Y-%m-%dT%H:%M"
                    ),
                    type="datetime-local",
                ),
                "Date/Time To",
                dcc.Input(
                    id="date_time_to2",
                    value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                    type="datetime-local",
                ),
            ],
            style={"visibility": "hidden", "height": "0"},
        ),
        False,
    )


@callback(
    Output("course_analysis", "options"),
    Output("course_analysis", "value"),
    Input("intermediate-value", "data"),
    Input("courses_dict", "data"),
)
def update_exercise(daten, courses_dict):
    """
    replace the ids of the courses with their actual name when displayed
    :param daten: all data to display
    :param courses_dict: list of the real names of all courses
    :return: all courses that are selecteable
    """
    return update_course(daten, courses_dict)


@callback(
    Output("exercise_analysis", "options"),
    Input("course_analysis", "value"),
    Input("intermediate-value", "data"),
)
def update_dropdown(input_value, daten):
    """
    Update dropdown menu for exercises when course selection changes
    :param input_value: selected courses
    :param daten: all data
    :return: all exercises that can be selected
    """
    local_df = pd.read_json(daten)
    local_df = local_df[local_df["UserId"] != 0]

    if not input_value:
        return local_df.UniqueName.unique()
    return local_df[local_df.CourseName.isin(input_value)].UniqueName.unique()


@callback(
    Output("date_time_to2", "value"),
    Input("date_time_from2", "value"),
)
def update_date_time_to(input_value):
    """
    set the time of the to-input 1 hour and 30 minutes after the from date,
    after the from date was changed
    :param input_value: datetime to which 90 minutes need to be added
    :return: datetime with updated time
    """
    return update_date_time(input_value, 90)


@callback(
    Output("checklist_filter_components_analysis", "children"),
    Input("checkbox_analysis", "value"),
    Input("intermediate-value", "data"),
)
def checklist_filter_masks(checks, daten):
    """
    This callback creates all required filter masks based on the checklist variable
    """
    local_df = pd.read_json(daten)
    local_df = local_df[local_df["UserId"] != 0]

    filters = filter_checklist(checks, local_df, "slider_attempt_analysis")
    return filters


@callback(
    [
        Output({"type": "add-button", "index": ALL}, "children"),
        Output("zeilen", "children"),
        Output("filter", "children"),
        Output("line-graph", "figure"),
        Output({"type": "slider_background_filter", "index": ALL}, "marks"),
        Output({"type": "slider_background_filter", "index": ALL}, "value"),
    ],
    [
        Input({"type": "slider_background_filter", "index": ALL}, "value"),
        Input({"type": "add-button", "index": ALL}, "children"),
        Input({"type": "add-button", "index": ALL}, "n_clicks"),
        Input("exercise_analysis", "value"),
        Input("slider_attempt_analysis", "value"),
        Input("course_analysis", "value"),
        Input("exercise_analysis", "options"),
        Input({"type": "delete-button-active", "index": ALL}, "n_clicks"),
        Input({"type": "delete-button-column", "index": ALL}, "n_clicks"),
        Input("date_time_from2", "value"),
        Input("date_time_to2", "value"),
        Input("intermediate-value", "data"),
        Input("checkbox_analysis", "value"),
    ],
)
# pylint: disable=too-many-arguments
# pylint: disable=unused-argument
def update(
    slider,
    button,
    clicks,
    exercises,
    limits,
    courses,
    exercise_options,
    filterbuttons,
    columnbuttons,
    date_time_from,
    date_time_to,
    daten,
    check_list,
):
    """
    update the graph, the background filter slider, and the display that shows which
    filters are selected aswell as columns that are displayed
    :param slider: what background filters are selected
    :param button: the value of all buttons (either "+" if they are not selected
           or "-" if they are not selected
    :param clicks: list of how often the buttons were pressed
    :param exercises: all selected exercises
    :param limits: the selected attempt limits in the slider
    :param courses: all selected courses
    :param exercise_options: all possible exercises that are selectable
    :param filterbuttons: how often a filter button is clicked,
           input value is irrelevant is only used to trigger
           the callback
    :param columnbuttons: how often a column button is clicked,
           input value is irrelevant is only used to trigger
           the callback
    :param date_time_from: starttime that is selected in the date input
    :param date_time_to: endtime that is selected in the date input
    :param daten: all data
    :param check_list: checklist to check whether date or attempts is selected
    :return: "+" or "-" in attribute buttons, buttons to display
            which columns are selcted also to deselected
            this option, buttons to display which filters are selcted also to
            deselected this option, an new graph, change the
            marks of the background filter slider, change the value
            of a background filter slider if it was selected in a column
    """
    trigger = dash.callback_context.triggered[0]["prop_id"].split(".")[0]
    fig = {}
    local_df = pd.read_json(daten)
    local_df["Time"] = pd.to_datetime(local_df["Time"])
    local_df = local_df[local_df["UserId"] != 0]

    date_time_from = dateutil.parser.parse(date_time_from)

    date_time_to = dateutil.parser.parse(date_time_to)

    if not exercises:
        exercises = exercise_options
    # Reduce the data to the data of the selected exercises and the selected limits of attempts
    local_df = local_df[local_df.UniqueName.isin(exercises)]
    limits = limits or [local_df.Attempt.min(), local_df.Attempt.max()]
    local_df = local_df[
        (local_df.Attempt.ge(limits[0])) & (local_df.Attempt.le(limits[1]))
    ]

    if "Date" in check_list:
        local_df = local_df[
            (local_df.Time >= date_time_from) & (local_df.Time < date_time_to)
        ]

    sliders = create_marks_for_slider(local_df, all_filters)
    # abort rest of the function in the initial callback
    if trigger == "":
        return button, columns, correctfilters, incorrectfilters, fig, sliders, slider
    # reset slider if the button belonging to it was changed
    slider = update_slider(slider, trigger, all_filters)
    button = update_button(button, trigger, all_filters)

    # reset a button after the slider belonging to it was changed
    columns.clear()

    # save which columns were selected
    for counter, _ in enumerate(clicks):
        if button[counter] == "-":
            columns.append(all_filters[counter])

    # save which filters were selected
    correctfilters.clear()
    incorrectfilters.clear()
    for counter, singleslider in enumerate(slider):
        if singleslider == 0:
            correctfilters.append(all_filters[counter])
            local_df = local_df[
                local_df[all_filters[counter].replace(" ", "_")] == "correct"
            ]
        if singleslider == 2:
            incorrectfilters.append(all_filters[counter])
            local_df = local_df[
                local_df[all_filters[counter].replace(" ", "_")] == "incorrect"
            ]

    # get the data according to selected courses, columns and filters
    tmpdf = local_df[local_df.CourseName.isin(courses)]
    for _, correct_filter in enumerate(correctfilters):
        tmpsave = correct_filter
        tmpdf = tmpdf[tmpdf[tmpsave.replace(" ", "_")] == "correct"]
    for _, incorrect_filter in enumerate(incorrectfilters):
        tmpsave = incorrect_filter
        tmpdf = tmpdf[tmpdf[tmpsave.replace(" ", "_")] == "incorrect"]

    columnbuttons = create_new_columns_buttons(columns)
    correctfiltersbuttons = create_new_filter_buttons(correctfilters, incorrectfilters)

    if tmpdf is not None:
        data, names = prepare_data_for_graph(local_df, columns)
    # create graph
    if not data or not names:
        return button, columnbuttons, correctfiltersbuttons, fig, sliders, slider
    figdf = pd.DataFrame(list(zip(names, data)), columns=["names", "data"])
    fig = px.bar(
        figdf,
        x="names",
        y="data",
        labels={"names": "", "data": "Count"},
        text="data",
        color="names",
    )
    fig.update_layout(showlegend=False)
    return button, columnbuttons, correctfiltersbuttons, fig, sliders, slider


# pylint: enable=too-many-arguments
# pylint: enable=unused-argument
