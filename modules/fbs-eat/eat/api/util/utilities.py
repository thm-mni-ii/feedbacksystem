"""
some utility functions
"""
from datetime import timedelta, datetime
from dash import html, dcc
import dash_bootstrap_components as dbc
import pandas as pd


import dateutil.parser


def update_date_time(input_value, difference):
    """
    set the time of the to-input 1 hour and 30 minutes after the from date,
    after the from date was changed
    :param input_value: datetime to which 90 minutes need to be added
    :param check: checklist to check if date was selected
    :param difference: the time in minutes you want to be added
    :return: datetime with updated time
    """
    date_time = dateutil.parser.parse(input_value)
    return date_time + timedelta(minutes=difference)


def filter_checklist(checks, local_df, slider_id):
    """
    build the initial checklist
    :param checks: what has checks of the checklist have been checked
    :param local_df: data to be displayed
    :param slider_id: id the slider is supposed to have
    :return: all filters
    """
    filters = []

    for box in checks:
        if "Attempts" in box:
            filters.append(
                dbc.Row(
                    [
                        # slider_label := html.Label("Attempts"),
                        dbc.Col(
                            html.Label(local_df.Attempt.min()),
                            width={"size": 1, "offset": 0},
                            style={"text-align": "right"},
                        ),
                        dbc.Col(
                            [
                                dcc.RangeSlider(
                                    local_df.Attempt.min(),
                                    local_df.Attempt.max(),
                                    1,
                                    value=[
                                        local_df.Attempt.min(),
                                        local_df.Attempt.max(),
                                    ],
                                    marks=None,
                                    tooltip={
                                        "placement": "bottom",
                                        "always_visible": True,
                                    },
                                    id=slider_id,
                                ),
                            ]
                        ),
                        dbc.Col(
                            html.Label(local_df.Attempt.max()),
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
                            local_df.Attempt.min(),
                            local_df.Attempt.max(),
                            id=slider_id,
                        ),
                        style={"visibility": "hidden", "height": "0"},
                    )
                )
            )
        )
    return filters


def update_course(daten, courses_dict):
    """
    change the name shown for the courses to their name instead of their id
    :param daten: all data
    :param courses_dict: dictionary of all the course names
    :return: courses with their real names
    """
    empty_list = []
    local_df = pd.read_json(daten)
    local_df = local_df[local_df["UserId"] != 0]
    courses = [
        {"value": course_id, "label": courses_dict.get(str(course_id)) or course_id}
        for course_id in local_df.CourseName.unique()
    ]
    return courses, empty_list


def add_checklist(checklist_id, all_options, values):
    """
    add list of checkboxes
    :param checklist_id: id the list is supposed to get so callbacks can access it
    :return: list of checkboxes
    """
    return dbc.Row(
        html.Div(  ## Filter Checkboxes
            dcc.Checklist(
                options=all_options,
                value=values,
                inline=True,
                style={
                    "justify-content": "center",
                    "display": "flex",
                },
                inputClassName="checkbox",
                id=checklist_id,
            )
        ),
        style={"margin-top": "20px"},
    )


def add_slider(tmp_df, slider_id, div_id):
    """
    default slider which will be
    overwritten by callback
    still necessary to prevent:
    "A nonexistent object was used
    in an Input of a Dash callback"
    """
    return html.Div(
        id=div_id,
        children=[
            dcc.RangeSlider(
                tmp_df.Attempt.min(),
                tmp_df.Attempt.max(),
                1,
                value=[
                    tmp_df.Attempt.min(),
                    tmp_df.Attempt.max(),
                ],
                marks=None,
                id=slider_id,
            ),
        ],
    )


def create_time_row(timerow_id, date_from_id, date_to_id):
    """
    create a an html div that has both date inputs
    :param timerow_id: id for the div so callbacks can change it
    :param date_from_id: id for the date from input so callbacks can change it
    :param date_to_id: id for date to input so callbacks can change it
    :return: html div with both date inputs
    """
    return (
        html.Div(
            id=timerow_id,
            children=[
                "Date/Time From",
                dcc.Input(
                    id=date_from_id,
                    value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                    type="datetime-local",
                ),
                "Date/Time To",
                dcc.Input(
                    id=date_to_id,
                    value=(
                        datetime.now()
                        + timedelta(
                            hours=1,
                            minutes=30,
                        )
                    ).strftime("%Y-%m-%dT%H:%M"),
                    type="datetime-local",
                ),
            ],
        ),
    )


def create_invisible_time_row(date_from_id, date_to_id):
    """
    creates two in invisible time inputs so they can still be accessed by callbacks
    :param date_from_id: id the date_time_from attribute is supposed to get
    :param date_to_id: id the date_time_to attribute is supposed to get
    :return: two invisble time inputs
    """
    return html.Div(
        children=[
            "Date/Time From",
            dcc.Input(
                id=date_from_id,
                value=(datetime.now() - timedelta(hours=500000)).strftime(
                    "%Y-%m-%dT%H:%M"
                ),
                type="datetime-local",
            ),
            "Date/Time To",
            dcc.Input(
                id=date_to_id,
                value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                type="datetime-local",
            ),
        ],
        style={"visibility": "hidden", "height": "0"},
    )


def add_exercise_dropdown(exercise_id, dropdown_name, option_list):
    """
    creates a dropdown containing all exercises
    :param tmp_df: data the user is allowed to see
    :param exercise_id: id for the dropdown so callbacks can access it
    :return: a dropdown with all exercises that are in the courses selected
    """
    return html.Div(
        [
            dropdown_name,
            dcc.Dropdown(
                option_list,
                multi=True,
                placeholder="Select one or more exercise",
                style={"background-color": "#e9e7e9"},
                id=exercise_id,
            ),
        ]
    )


def filter_data(data):
    """
    transform the data from json to a pandas dataframe, changes timefromat and
    removes the solution
    :param data: all data in JSON format
    :return: filtered list as a pandas dataframe
    """
    local_df = pd.read_json(data)
    local_df["Time"] = pd.to_datetime(local_df["Time"])
    local_df = local_df[local_df["UserId"] != 0]
    return local_df


def filter_attempt_limits(local_df, limits):
    """
    filter data to all entries within the attempt limit
    :param data: all data
    :param limits: the minimum and maximum amout of attempts
    :return: data without entreis that have too many or to few attempt numbers
    """
    limits = limits or [local_df.Attempt.min(), local_df.Attempt.max()]
    local_df = local_df[
        (local_df.Attempt.ge(limits[0])) & (local_df.Attempt.le(limits[1]))
    ]
    return local_df


def select_all_exercises_in_course(local_df, course_value):
    """
    select all exercises from a course if no exercises are selected
    :param local_df: current filtered data
    :param course_value: selected courses
    :return: all exercises in the selected courses as a list
    """
    exercise_value = list(
        local_df[local_df.CourseName.isin(course_value)].UniqueName.unique()
    )
    return exercise_value


def select_all_courses(local_df):
    """

    :param local_df:
    :param course_value:
    :return:
    """
    course_value = list(local_df.CourseName.unique())
    return course_value


def convert_time(date_time):
    """
    converts the format of two given times
    :param date_time_from: time to be converted
    :param date_time_to: time to be converted
    :return: times with converted format
    """
    date_time = dateutil.parser.parse(date_time)
    return date_time


def filter_time(data_frame, date_time_from, date_time_to):
    """
    filter the data for entries in a given timeframe
    :param data_frame: data not yet filtered for time
    :param date_time_from: start date for the timeframe
    :param date_time_to: end date for the timeframe
    :return: data filtered for time frame
    """
    data_frame = data_frame[
        (data_frame.Time >= date_time_from) & (data_frame.Time < date_time_to)
    ]
    return data_frame
