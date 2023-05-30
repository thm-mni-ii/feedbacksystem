import math
from datetime import datetime, timedelta

import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
import plotly.graph_objs as go
from api.connect.data_service import get_data
from dash import Input, Output, callback, dcc, html
from plotly.subplots import make_subplots
import dateutil.parser


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
                                timerow := html.Div(
                                    [
                                        "Date/Time From",
                                        dcc.Input(
                                            id="date_time_from",
                                            value=datetime.now().strftime(
                                                "%Y-%m-%dT%H:%M"
                                            ),
                                            type="datetime-local",
                                        ),
                                        "Date/Time To",
                                        dcc.Input(
                                            id="date_time_to",
                                            value=(
                                                datetime.now()
                                                + timedelta(hours=1, minutes=30)
                                            ).strftime("%Y-%m-%dT%H:%M"),
                                            type="datetime-local",
                                        ),
                                    ]
                                ),
                            ),
                        ]
                    ),
                    dbc.Row(
                        html.Div(  ## Filter Checkboxes
                            checklist := dcc.Checklist(
                                ["Attempts", "Date"],
                                ["Attempts"],
                                inline=True,
                                style={
                                    "justify-content": "center",
                                    "display": "flex",
                                },
                                inputClassName="checkbox",
                                id="checkbox",
                            )
                        ),
                        style={"margin-top": "20px"},
                    ),
                    # filters based on checkbox selection
                    checklist_filter_components := html.Div(
                        # default slider which will be overwritten by callback
                        # still necessary to prevent:
                        # "A nonexistent object was used in an Input of a Dash callback"
                        dcc.RangeSlider(
                            tmp_df.Attempt.min(),
                            tmp_df.Attempt.max(),
                            1,
                            value=[tmp_df.Attempt.min(), tmp_df.Attempt.max()],
                            marks=None,
                            id="slider_dashboard",
                        ),
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
    Output(checklist, "options"),
    Output(checklist, "value"),
    Input(checklist, "value"),
    Input(key_figure, "value"),
)
def hide_attempts(checklist_elements, key_figures):
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
    Output(timerow, "children"), Input(checklist, "value")
)
def hide_time(checkbox):
    if "Date" in checkbox:
        return html.Div(
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
                    value=(datetime.now() + timedelta(hours=1, minutes=30)).strftime(
                        "%Y-%m-%dT%H:%M"
                    ),
                    type="datetime-local",
                ),
            ]
        )
    return html.Div(
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
    )


def generate_empty_response():
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
def update_exercise(daten, courses_dict):
    empty_list = []
    df = pd.read_json(daten)
    df = df[df["UserId"] != 0]

    courses = [
        {"value": course_id, "label": courses_dict.get(str(course_id)) or course_id}
        for course_id in df.CourseName.unique()
    ]
    return courses, empty_list


@callback(
    Output(checklist_filter_components, "children"),
    Input(checklist, "value"),
    Input("intermediate-value", "data"),
    Input(key_figure, "value"),
)
def checklist_filter_masks(checks, daten, key_figures):
    """
    This callback creates all required filter masks based on the checklist variable
    """
    filters = []
    df = pd.read_json(daten)
    df = df[df["UserId"] != 0]

    if "Attempts" in checks:
        if "Average Attempts" in key_figures:
            checks.remove("Attempts")
    for box in checks:
        if "Attempts" in box:
            filters.append(
                dbc.Row(
                    [
                        # slider_label := html.Label("Attempts"),
                        dbc.Col(
                            html.Label(df.Attempt.min()),
                            width={"size": 1, "offset": 0},
                            style={"text-align": "right"},
                        ),
                        dbc.Col(
                            [
                                dcc.RangeSlider(
                                    df.Attempt.min(),
                                    df.Attempt.max(),
                                    1,
                                    value=[df.Attempt.min(), df.Attempt.max()],
                                    marks=None,
                                    tooltip={
                                        "placement": "bottom",
                                        "always_visible": True,
                                    },
                                    id="slider_dashboard",
                                ),
                            ]
                        ),
                        dbc.Col(
                            html.Label(df.Attempt.max()),
                            width={"size": 1, "offset": 0},
                            style={"text-align": "left"},
                        ),
                    ],
                )
            )
        if box == "Date":
            filters.append(
                dbc.Row(
                    # [
                    #     dbc.Col("Attempts 1"),
                    #     dbc.Col("Attempts 2"),
                    #     dbc.Col("Attempts 3"),
                    # ]
                )
            )
        if box == "Semester Weeks":
            filters.append(
                dbc.Row(
                    # [
                    #     dbc.Col("Attempts 1"),
                    #     dbc.Col("Attempts 2"),
                    #     dbc.Col("Attempts 3"),
                    # ]
                )
            )

    if "Attempts" not in checks:
        # hidden slider which still can be accessed with the id "slider"
        filters.append(
            dbc.Row(
                dbc.Col(
                    html.Div(
                        dcc.RangeSlider(
                            df.Attempt.min(),
                            df.Attempt.max(),
                            id="slider_dashboard",
                        ),
                        style={"visibility": "hidden", "height": "0"},
                    )
                )
            )
        )
    return filters


# Update dropdown menu for exercises
@callback(
    Output(exercise, "options"),
    Input(course, "value"),
    Input("intermediate-value", "data"),
)
def update_exercises_dropdown_course(input_value, daten):
    df = pd.read_json(daten)
    df = df[df["UserId"] != 0]

    if not input_value:
        return list(df.UniqueName.unique())
    return list(df[df.CourseName.isin(input_value)].UniqueName.unique()) + [
        "Übersicht"
    ]


# Update date_time_to based on date_time_from
@callback(
    Output("date_time_to", "value"),
    Input("date_time_from", "value"),
    Input(checklist, "value"),
)
def update_date_time_to(input_value, check):
    if "Date" in check:
        try:
            date_time = datetime.strptime(input_value, "%Y-%m-%dT%H:%M")
            return date_time + timedelta(hours=1, minutes=30)
        except:
            return input_value
    else:
        date_time = datetime.now().strftime("%Y-%m-%dT%H:%M")
        return date_time


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
    Input(checklist, "value"),
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
    df = pd.read_json(data)
    df["Time"] = pd.to_datetime(df.Time)
    df = df[df["UserId"] != 0]

    date_time_from = dateutil.parser.parse(date_time_from)

    date_time_to = dateutil.parser.parse(date_time_to)


    display_style = {}

    if "Average Attempts" in key_figure_value:
        display_style = {"display": "block"}
    else:
        display_style = {"display": "none"}

    task_len = {}
    if "Date" in checklist_value:
        df = df[(df.Time >= date_time_from) & (df.Time < date_time_to)]
    if not course_value or df.empty:
        return generate_empty_response(), display_style

    if exercise_value is None or "Übersicht" in exercise_value:
        filtered_df = df
    else:
        filtered_df = df[df.UniqueName.isin(exercise_value)]

    for task in filtered_df.UniqueName.unique():
        local_df = filtered_df[filtered_df.UniqueName == task]

        avg_submissions = len(local_df) / len(local_df.UserId.unique())
        task_len[f"{task}"] = avg_submissions

    fig = px.bar(
        df,
        x=list(task_len.keys()),
        y=list(task_len.values()),
        labels={
            "x": "Excercise",
            "y": "Average Attempts",
        },
    )
    fig.update_layout(showlegend=False, height=600)

    return fig, display_style


# Update histogramm figure
@callback(
    Output(histogram, "figure"),
    Output(histogram_card, "style"),
    Input(course, "value"),
    Input(exercise, "value"),
    Input(key_figure, "value"),
    Input(checklist, "value"),
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
    display_style = {}

    if "Typical Mistakes" in key_figure_value:
        display_style = {"display": "block"}
    else:
        display_style = {"display": "none"}

    df = pd.read_json(daten)
    df["Time"] = pd.to_datetime(df.Time)
    df = df[df["UserId"] != 0]

    # Convert datetime string to datetime object
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

    slider_value = slider_value or [df.Attempt.min(), df.Attempt.max()]

    # if no excercise are choosen, use all excercises
    if not exercise_value:
        if course_value:
            exercise_value = list(
                df[df.CourseName.isin(course_value)].UniqueName.unique()
            )
        else:
            return generate_empty_response(), display_style

    # Filter dataframe
    filtered_df = df
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
        df = pd.DataFrame(data)

        values = df["values"].astype(float)
        df["values"] = (values * 100).astype(int)

        fig = px.bar(
            df,
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
        show_legend = True if row == 0 else False
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
                marker=dict(color=color),
                showlegend=show_legend,
            )
            traces.append(trace)

            # All traces build one subfigure
        for trace in traces:
            fig.append_trace(trace, row=row + 1, col=col + 1)

        # Figure styling
        fig.update_layout(
            height=400 * (row + 1),
            legend=dict(
                orientation="h", xanchor="left", yanchor="bottom", x=0.15, y=1.05
            ),
        )
        fig.update_xaxes(showticklabels=False)

        for i in range(0, row + 1):
            fig.update_yaxes(title_text="Students", row=i + 1, col=1)

    return fig, display_style
