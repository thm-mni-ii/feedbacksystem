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
import dateutil.parser

from api.connect.data_service import get_data
from api.util.utilities import (
    update_date_time,
    filter_checklist,
    update_course,
    add_slider,
    add_checklist,
    create_time_row,
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
                                html.Div(
                                    [
                                        "Course",
                                        course := dcc.Dropdown(
                                            tmp_df.CourseName.unique(),
                                            tmp_df.CourseName.unique(),
                                            multi=True,
                                            placeholder="Select one or more courses",
                                            style={"background-color": "#e9e7e9"},
                                        ),
                                    ]
                                )
                            ),
                            dbc.Col(
                                html.Div(
                                    [
                                        "Exercise",
                                        exercise := dcc.Dropdown(
                                            tmp_df.UniqueName.unique(),
                                            multi=True,
                                            placeholder="Select one or more exercise",
                                            style={"background-color": "#e9e7e9"},
                                        ),
                                    ]
                                )
                            ),
                            dbc.Col(
                                html.Div(
                                    [
                                        "Key Figure",
                                        key_figure := dcc.Dropdown(
                                            ["Typical Mistakes", "Average Attempts"],
                                            "Typical Mistakes",
                                            style={"background-color": "#e9e7e9"},
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
                    add_checklist("checkbox"),
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
        html.Div(
            children=[
                "Date/Time From",
                dcc.Input(
                    id="date_time_from",
                    value=(datetime.now() - timedelta(hours=500000)).strftime(
                        "%Y-%m-%dT%H:%M"
                    ),
                    type="datetime-local",
                ),
                "Date/Time To",
                dcc.Input(
                    id="date_time_to",
                    value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                    type="datetime-local",
                ),
            ],
            style={"visibility": "hidden", "height": "0"},
        ),
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
    Output(course, "options"),
    Output(course, "value"),
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
    Output(exercise, "options"),
    Input(course, "value"),
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
    Input(exercise, "value"),
    Input(course, "value"),
    Input(key_figure, "value"),
    Input("intermediate-value", "data"),
    Input("date_time_from", "value"),
    Input("date_time_to", "value"),
    Input("checkbox", "value"),
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
    local_df["Time"] = pd.to_datetime(local_df.Time)
    local_df = local_df[local_df["UserId"] != 0]

    date_time_from = dateutil.parser.parse(date_time_from)

    date_time_to = dateutil.parser.parse(date_time_to)

    if "Average Attempts" in key_figure_value:
        display_style = {"display": "block"}
    else:
        display_style = {"display": "none"}

    task_len = {}
    if "Date" in checklist_value:
        local_df = local_df[
            (local_df.Time >= date_time_from) & (local_df.Time < date_time_to)
        ]
    if not course_value or local_df.empty:
        return generate_empty_response(), display_style

    if exercise_value is None or "Übersicht" in exercise_value:
        filtered_df = local_df
    else:
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
# pylint: disable=too-many-branches
# pylint: disable=too-many-statements




# Update histogramm figure
@callback(
    Output(histogram, "figure"),
    Output(histogram_card, "style"),
    Input(course, "value"),
    Input(exercise, "value"),
    Input(key_figure, "value"),
    Input("checkbox", "value"),
    Input("slider_dashboard", "value"),
    Input("date_time_from", "value"),
    Input("date_time_to", "value"),
    Input("intermediate-value", "data"),
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

    if "Typical Mistakes" in key_figure_value:
        display_style = {"display": "block"}
    else:
        display_style = {"display": "none"}

    local_df = pd.read_json(daten)
    local_df["Time"] = pd.to_datetime(local_df.Time)
    local_df = local_df[local_df["UserId"] != 0]

    # Convert datetime string to datetime object
    date_time_from = dateutil.parser.parse(date_time_from)
    date_time_to = dateutil.parser.parse(date_time_to)

    slider_value = slider_value or [local_df.Attempt.min(), local_df.Attempt.max()]

    # if no excercises are choosen, use all excercises
    if not exercise_value:
        if course_value:
            exercise_value = list(
                local_df[local_df.CourseName.isin(course_value)].UniqueName.unique()
            )
        else:
            return generate_empty_response(), display_style

    # Filter dataframe
    filtered_df = local_df
    filtered_df = filtered_df[
        (filtered_df.Attempt.ge(slider_value[0]))
        & (filtered_df.Attempt.le(slider_value[1]))
    ]

    if course_value:
        filtered_df = filtered_df[filtered_df.CourseName.isin(course_value)]

    # We want all excercise values if Übersicht is checked
    if "Übersicht" not in exercise_value:
        if exercise_value:
            filtered_df = filtered_df[filtered_df.UniqueName.isin(exercise_value)]
    if "Date" in checklist_value:
        filtered_df = filtered_df[
            (filtered_df.Time >= date_time_from) & (filtered_df.Time < date_time_to)
        ]

    if "Übersicht" in exercise_value:
        hist_df = filtered_df[
            [
                "Joins",
                "Projection_Attributes",
                "Selection_Attributes",
                "GroupBy",
                "OrderBy",
                "Strings",
                "Tables",
            ]
        ]

        if hist_df.empty:
            return generate_empty_response(), display_style
        result_dict = {}

        for column in hist_df.columns:
            value_counts = hist_df[column].value_counts()
            total_counts = value_counts.sum()
            percent_correct = value_counts.get("correct", 0) / total_counts
            percent_incorrect = value_counts.get("incorrect", 0) / total_counts
            result_dict[column] = {
                "Correct": percent_correct,
                "Incorrect": percent_incorrect,
            }

        result_df = pd.DataFrame(result_dict)
        # Colors for each bar
        colors = [
            "#60a7ba",
            "#f0912d",
            "#357025",
            "#ba3622",
            "#8f33d6",
            "#6a4c4d",
            "#cf8af3",
        ]

        # Label for each bar
        labels = [
            "Joins",
            "Projection_Attributes",
            "Selection_Attributes",
            "GroupBy",
            "OrderBy",
            "Strings",
            "Tables",
        ]
        values = []

        for i, column in enumerate(result_df.columns):
            values.append(result_df[column].Incorrect)

        data = {"labels": labels, "values": values}
        local_df = pd.DataFrame(data)

        values = local_df["values"].astype(float)
        local_df["values"] = (values * 100).astype(int)

        fig = px.bar(
            local_df,
            x="labels",
            y="values",
            color="labels",
            color_discrete_sequence=colors,
            labels={
                "labels": "SQL-Attribute",
                "values": "STUDENTS",
            },
        )
        fig.update_layout(showlegend=False, height=600)
        return fig, display_style

    # Create figure which will be returned and contains all subfigures
    fig = make_subplots(
        rows=math.ceil(len(exercise_value) / 2),
        cols=2,
        subplot_titles=exercise_value,
        shared_xaxes=True,
        shared_yaxes=True,
    )

    # Initialize subfigures
    for row in range(1, math.ceil(len(exercise_value) / 2) + 1):
        for col in range(1, 2 + 1):
            fig.append_trace(go.Bar(x=[], y=[]), row=row, col=col)
    # Order columns
    hist_df = filtered_df[
        [
            "UniqueName",
            "Joins",
            "Projection_Attributes",
            "Selection_Attributes",
            "GroupBy",
            "OrderBy",
            "Strings",
            "Tables",
        ]
    ].set_index("UniqueName")
    # No data
    if hist_df.empty:
        return generate_empty_response(), display_style

    # Colors for each bar
    colors = [
        "#60a7ba",
        "#f0912d",
        "#357025",
        "#ba3622",
        "#8f33d6",
        "#6a4c4d",
        "#cf8af3",
    ]

    # Label for each bar
    labels = [
        "Joins",
        "Projection_Attributes",
        "Selection_Attributes",
        "GroupBy",
        "OrderBy",
        "Strings",
        "Tables",
    ]

    # Each unique index represents one Course
    for row, idx in enumerate(hist_df.index.unique()):
        show_legend = row == 0
        traces = []

        # Calculate subfigure position in figure
        row = (row + 1) / 2
        col = 1 if row.is_integer() else 0
        row = math.ceil(row) - 1

        # Calculate dataframe for plot
        task_subset_df = hist_df.loc[idx]
        task_subset_df = task_subset_df.apply(pd.value_counts).T
        task_subset_df = task_subset_df.div(task_subset_df.sum(axis=1), axis=0)

        # Handle case if there are only correct answers
        if task_subset_df.shape != (
            7,
            2,
        ):  # sometimes task_subset_df is in the wrong shape
            if task_subset_df.shape != (
                7,
                1,
            ):
                task_subset_df = task_subset_df.T

            if "correct" in task_subset_df.columns.values:
                task_subset_df["incorrect"] = 0

        # Each bar needs a color and a legend entry and will therefore
        # be plotted individually
        for i, color in enumerate(colors):
            trace = go.Bar(
                x=[task_subset_df.index.values[i]],
                y=[task_subset_df.incorrect[i] * 100],
                name=labels[i],
                marker={"color": color},
                showlegend=show_legend,
            )
            traces.append(trace)

            # All traces build one subfigure
        for trace in traces:
            fig.append_trace(trace, row=row + 1, col=col + 1)

        # Figure styling
        fig.update_layout(
            height=400 * (row + 1),
            legend={
                "orientation": "h",
                "xanchor": "left",
                "yanchor": "bottom",
                "x": 0.15,
                "y": 1.05,
            },
        )
        fig.update_xaxes(showticklabels=False)

        for i in range(0, row + 1):
            fig.update_yaxes(title_text="Students", row=i + 1, col=1)

    return fig, display_style

# pylint: enable=too-many-locals
# pylint: enable=too-many-branches
# pylint: enable=too-many-statements
# pylint: enable=too-many-arguments
