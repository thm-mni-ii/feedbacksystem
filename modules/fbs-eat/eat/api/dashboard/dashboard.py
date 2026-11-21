"""
this generates a dashboard with multiple key figures to display the data
"""


import math
from datetime import datetime, timedelta
import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
import plotly.graph_objs as go
from dash import Input, Output, callback, dcc, html, dash
from plotly.subplots import make_subplots

from api.connect.data_service import get_data
from api.util.utilities import (
    update_date_time,
    filter_checklist,
    update_course,
    add_slider,
    add_checklist,
    create_time_row,
    add_exercise_dropdown,
    filter_data,
    convert_time,
    create_invisible_time_row,
    filter_attempt_limits,
    select_all_exercises_in_course,
    filter_time,
    select_all_courses,
)
from api.util.dashboard_util import (
    hide_histogram,
    create_course_bars,
    create_figure_with_subfigure,
    reduce_data_to_necessary_columns,
    create_overview_bar,
    get_values_from_data,
    get_avg_att_time,
)

tmp_df = get_data(-1)

layout = html.Div(
    [
        html.H3(
            "Standard Analyses", style={"text-align": "left", "margin-left": "407px"}
        ),
        dbc.Container(
            dbc.Card(
                [
                    dbc.Row(  ## Dropdown menus
                        [
                            dbc.Col(
                                add_exercise_dropdown(
                                    "course_dashboard",
                                    "Course",
                                    tmp_df.CourseName.unique(),
                                )
                            ),
                            dbc.Col(
                                add_exercise_dropdown(
                                    "exercise_dashboard",
                                    "Exercise",
                                    tmp_df.UniqueName.unique(),
                                ),
                            ),
                            dbc.Col(
                                html.Div(
                                    [
                                        "Key Figure",
                                        key_figure := dcc.Dropdown(
                                            [
                                                "Typical Mistakes",
                                                "Average Attempts",
                                                "Average Time",
                                            ],
                                            "Typical Mistakes",
                                            style={"background-color": "#e9e7e9"},
                                            clearable=False,
                                        ),
                                    ]
                                ),
                            ),
                            dbc.Col(
                                create_time_row(
                                    "timerow_dashboard",
                                    "date_time_from",
                                    "date_time_to",
                                ),
                            ),
                        ]
                    ),
                    add_checklist("checkbox", ["Attempts", "Date"], ["Attempts"]),
                    add_slider(
                        tmp_df,
                        "slider_dashboard",
                        "checklist_filter_components_dashboard",
                    ),
                    dbc.Row(
                        dbc.Container(
                            [
                                histogram_card := dbc.Card(
                                    histogram := dcc.Graph(),
                                    body=True,
                                    style={"display": "none"},
                                ),
                                histogram_avg_submissions_card := dbc.Card(
                                    histogram_avg_submissions := dcc.Graph(),
                                    body=True,
                                    style={"display": "none"},
                                ),
                                histogram_avg_time_card := dbc.Card(
                                    histogram_avg_time := dcc.Graph(),
                                    body=True,
                                    style={"display": "block"},
                                ),
                            ],
                            style={"margin-top": "20px"},
                        ),
                    ),
                    # dbc.Row(
                    #     dbc.Container(
                    #         dbc.Card(, body=True),
                    #         style={"margin-top": "20px"},
                    #     )
                    # ),
                ],
                style={"padding": "10px"},
            ),
        ),
    ],
)


@callback(
    Output("checkbox", "options"),
    Output("checkbox", "value"),
    Input("checkbox", "value"),
    Input(key_figure, "value"),
)
def hide_attempts(checklist_elements, key_figures):
    """
    hide the attempts slider when the checkbox is not selected
    or the average attempts key figure is selected
    :param checklist_elements: checklist containing the checkbox
    :param key_figures: selected key figure
    :return: the attempts slider either hidden or shown
    """
    if "Average Attempts" in key_figures:
        options = [
            {"label": "Attempts", "value": "Attempts", "disabled": True},
            {
                "label": "Date",
                "value": "Date",
            },
        ]
        if "Attempts" in checklist_elements:
            checklist_elements.remove("Attempts")
    else:
        options = ["Attempts", "Date"]
    return options, checklist_elements


@callback(
    Output("timerow_dashboard", "children"),
    Output("is_date_on_dashboard", "data"),
    Input("checkbox", "value"),
    Input("is_date_on_dashboard", "data"),
)
def hide_time(checkbox, is_date_on):
    """
    hide the time if the checkkbox is not selected
    :param checkbox: checklist containing the date checkbox
    :return: html div containing the time input form either hidden or shown
    """
    if "Date" in checkbox and is_date_on:
        return dash.no_update
    if "Date" in checkbox:
        return (
            html.Div(
                [
                    "Date/Time From",
                    dcc.Input(
                        id="date_time_from",
                        value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                    "Date/Time To",
                    dcc.Input(
                        id="date_time_to",
                        value=(
                            datetime.now() + timedelta(hours=1, minutes=30)
                        ).strftime("%Y-%m-%dT%H:%M"),
                        type="datetime-local",
                    ),
                ]
            ),
            True,
        )
    return (
        create_invisible_time_row("date_time_from", "date_time_to"),
        False,
    )


def generate_empty_response():
    """
    generate a graph with no values
    :return: graph without values
    """
    fig = make_subplots(
        rows=1,
        cols=2,
    )

    # Initialize empty figure
    for col in range(1, 3):
        fig.append_trace(go.Bar(x=[], y=[]), row=1, col=col)

    fig.update_xaxes(showticklabels=False)
    fig.update_yaxes(showticklabels=False)

    return fig


@callback(
    Output("course_dashboard", "options"),
    Output("course_dashboard", "value"),
    Input("intermediate-value", "data"),
    Input("courses_dict", "data"),
)
def update_course_name(daten, courses_dict):
    """
    change to coursename to its actual name instead of its ID
    :param daten: all data
    :param courses_dict: the real names of the courses
    :return: list of all courses the user is allowed to see, but with real names
    """
    return update_course(daten, courses_dict)


@callback(
    Output("checklist_filter_components_dashboard", "children"),
    Input("checkbox", "value"),
    Input("intermediate-value", "data"),
    Input(key_figure, "value"),
)
def checklist_filter_masks(checks, daten, key_figures):
    """
    This callback creates all required filter masks based on the checklist variable
    """
    if "Attempts" in checks:
        if "Average Attempts" in key_figures:
            checks.remove("Attempts")
    local_df = pd.read_json(daten)
    local_df = local_df[local_df["UserId"] != 0]
    filters = filter_checklist(checks, local_df, "slider_dashboard")

    return filters


@callback(
    Output("exercise_dashboard", "options"),
    Input("course_dashboard", "value"),
    Input("intermediate-value", "data"),
)
def update_exercises_dropdown_course(input_value, daten):
    """
    update the options in the exercise dropdown according to the selected courses
    :param input_value: selected courses
    :param daten: all data
    :return: updated exercise dropdown
    """
    local_df = pd.read_json(daten)
    local_df = local_df[local_df["UserId"] != 0]

    if not input_value:
        return list(local_df.UniqueName.unique())
    return list(local_df[local_df.CourseName.isin(input_value)].UniqueName.unique()) + [
        "Übersicht"
    ]


@callback(
    Output("date_time_to", "value"),
    Input("date_time_from", "value"),
    prevent_initial_call=True,
)
def update_date_time_to(input_value):
    """
    set the time of the to-input 1 hour and 30 minutes after the from date,
    after the from date was changed
    :param input_value: datetime to which 90 minutes need to be added
    :param check: checklist to check if date was selected
    :return: datetime with updated time
    """
    return update_date_time(input_value, 90)


# pylint: disable=too-many-arguments


# Update histogram_avg_submissions figure
@callback(
    Output(histogram_avg_submissions, "figure"),
    Output(histogram_avg_submissions_card, "style"),
    Input("exercise_dashboard", "value"),
    Input("course_dashboard", "value"),
    Input(key_figure, "value"),
    Input("intermediate-value", "data"),
    Input("date_time_from", "value"),
    Input("date_time_to", "value"),
    Input("checkbox", "value"),
    prevent_initial_call=True,
)
def update_histogram_avg_submissions(
    exercise_value,
    course_value,
    key_figure_value,
    data,
    date_time_from,
    date_time_to,
    checklist_value,
):
    """
    update the average attempts graph
    :param exercise_value: which exercises are selected
    :param course_value: which courses are selected
    :param key_figure_value: which key figure is selected
    :param data: all data
    :param date_time_from: start of timeframe
    :param date_time_to: end of timeframe
    :param checklist_value: checklist with attempts and date
    :return: histogram with average attemtps of a task
    """
    local_df = pd.read_json(data)
    local_df["Time"] = pd.to_datetime(local_df["Time"])
    local_df = local_df[local_df["UserId"] != 0]

    if "Average Attempts" in key_figure_value:
        display_style = {"display": "block"}
    else:
        display_style = {"display": "none"}

    if not exercise_value or "Übersicht" in exercise_value:
        if not course_value:
            return generate_empty_response(), display_style
        exercise_value = select_all_exercises_in_course(local_df, course_value)

    task_len = {}
    if "Date" in checklist_value:
        local_df = filter_time(
            local_df, convert_time(date_time_from), convert_time(date_time_to)
        )
    if not course_value or local_df.empty:
        return generate_empty_response(), display_style

    filtered_df = local_df[local_df.UniqueName.isin(exercise_value)]
    for task in filtered_df.UniqueName.unique():
        local_df = filtered_df[filtered_df.UniqueName == task]

        avg_submissions = len(local_df) / len(local_df.UserId.unique())
        task_len[f"{task}"] = avg_submissions
    fig = px.bar(
        local_df,
        x=list(task_len.keys()),
        y=list(task_len.values()),
        labels={
            "x": "Excercise",
            "y": "Average Attempts",
        },
    )
    fig.update_layout(showlegend=False, height=600)

    return fig, display_style


# pylint: disable=too-many-locals


# Update histogramm figure
@callback(
    Output(histogram, "figure"),
    Output(histogram_card, "style"),
    Input("course_dashboard", "value"),
    Input("exercise_dashboard", "value"),
    Input(key_figure, "value"),
    Input("checkbox", "value"),
    Input("slider_dashboard", "value"),
    Input("date_time_from", "value"),
    Input("date_time_to", "value"),
    Input("intermediate-value", "data"),
    prevent_initial_call=True,
)
def update_histogram(
    course_value,
    exercise_value,
    key_figure_value,
    checklist_value,
    slider_value,
    date_time_from,
    date_time_to,
    daten,
):
    """
    updates the typical mistake histogram according to the options the user selected
    :param course_value: courses selcted
    :param exercise_value: exercises selected
    :param key_figure_value: key figure selected
    :param checklist_value: checkboxes selected
    :param slider_value: value of slider
    :param date_time_from: start of timeframe
    :param date_time_to: end of timeframe
    :param daten: all data
    :return: updated histogram
    """
    # pylint: disable=duplicate-code
    labels = [
        "Joins",
        "Projection_Attributes",
        "Selection_Attributes",
        "GroupBy",
        "OrderBy",
        "Strings",
        "Tables",
    ]
    # pylint: enable=duplicate-code
    display_style = hide_histogram(key_figure_value)

    local_df = filter_data(daten)

    # if no excercises are choosen, use all excercises
    if not exercise_value:
        if not course_value:
            return generate_empty_response(), display_style
        exercise_value = select_all_exercises_in_course(local_df, course_value)

    # Filter dataframe
    filtered_df = filter_attempt_limits(local_df, slider_value)

    if "Date" in checklist_value:
        filtered_df = filter_time(
            filtered_df, convert_time(date_time_from), convert_time(date_time_to)
        )

    if "Übersicht" in exercise_value:
        filtered_df = filtered_df[
            filtered_df.UniqueName.isin(
                select_all_exercises_in_course(local_df, course_value)
            )
        ]
        hist_df = filtered_df[labels]
        if hist_df.empty:
            return generate_empty_response(), display_style
        result_dict = {}

        for column in hist_df.columns:
            value_counts = hist_df[column].value_counts()
            total_counts = value_counts.sum()
            percent_correct = value_counts.get("correct", 0) / total_counts * 100
            percent_incorrect = value_counts.get("incorrect", 0) / total_counts * 100
            result_dict[column] = {
                "Correct": percent_correct,
                "Incorrect": percent_incorrect,
            }

        result_df = pd.DataFrame(result_dict)
        local_df = get_values_from_data(result_df, labels)

        fig = create_overview_bar(local_df)
        fig.update_layout(showlegend=False, height=600)
        return fig, display_style

    filtered_df = filtered_df[filtered_df.UniqueName.isin(exercise_value)]
    # Create figure which will be returned and contains all subfigures
    fig = create_figure_with_subfigure(exercise_value)

    # Initialize subfigures
    for row in range(1, math.ceil(len(exercise_value) / 2) + 1):
        for col in range(1, 2 + 1):
            fig.append_trace(go.Bar(x=[], y=[]), row=row, col=col)
    # Order columns
    hist_df = reduce_data_to_necessary_columns(filtered_df)
    # No data
    if hist_df.empty:
        return generate_empty_response(), display_style

    fig = create_course_bars(hist_df, fig, labels)
    return fig, display_style


@callback(
    Output(histogram_avg_time, "figure"),
    Output(histogram_avg_time_card, "style"),
    Input("intermediate-value", "data"),
    Input("course_dashboard", "value"),
    Input("exercise_dashboard", "value"),
    Input(key_figure, "value"),
    Input("slider_dashboard", "value"),
    Input("checkbox", "value"),
    Input("date_time_from", "value"),
    Input("date_time_to", "value"),
)
def track_time(
    daten,
    course_value,
    exercise_value,
    key_figure_value,
    slider_value,
    checklist_value,
    date_time_from,
    date_time_to,
):
    """
    creates a diagram that shows the average time it took a student to solve a task
    :param daten: all data
    :param course_value: selected courses
    :param exercise_value: selected exercises
    :param key_figure_value: selected key figure
    :param slider_value: selected attempts limit
    :param checklist_value: checkboxes value
    :param date_time_from: timeframe startpoint
    :param date_time_to: timeframe endpoint
    :return: diagramm with the average time it took for a task
    """
    local_df = filter_data(daten)
    local_df = local_df[local_df["UserId"] != 0]
    local_df["Time"] = pd.to_datetime(local_df["Time"])
    fig = go.Figure()

    if "Average Time" in key_figure_value:
        display_style = {"display": "block"}
    else:
        display_style = {"display": "none"}
        # abort if Average Time not selected
        return fig, display_style

    local_df = filter_attempt_limits(local_df, slider_value)
    if "Date" in checklist_value:
        local_df = filter_time(
            local_df, convert_time(date_time_from), convert_time(date_time_to)
        )
    if not course_value:
        course_value = select_all_courses(local_df)
    if not exercise_value or "Übersicht" in exercise_value:
        # abort if no exercise is selected
        exercise_value = select_all_exercises_in_course(local_df, course_value)
    # calculates all times for each task
    times = get_avg_att_time(local_df, exercise_value)
    local_df = pd.DataFrame(times)
    if not times:
        return fig, display_style
    fig.add_trace(
        go.Box(
            y=local_df[1],
            x=local_df[0],
        )
    )
    fig.update_layout(
        xaxis={"type": "category", "showgrid": True, "zeroline": True},
        yaxis={"title": "Average Time in s"},
        showlegend=False,
    )
    return fig, display_style


# pylint: enable=too-many-locals
# pylint: enable=too-many-arguments
