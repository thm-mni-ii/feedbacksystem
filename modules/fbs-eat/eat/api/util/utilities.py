"""
some utility functions
"""
from datetime import timedelta, datetime
from dash import html, dcc
import dash_bootstrap_components as dbc
import pandas as pd

import dateutil.parser


IMAGE_PATH = "assets/x.webp"


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


def create_new_columns_buttons(columns):
    """
    create the buttons that display which columns are displayed
    :return: a list of all buttons
    """
    columnbuttons = []
    for _, column in enumerate(columns):
        newcolbutton = html.Button(
            id={"type": "delete-button-column", "index": column},
            className="delete-button-column",
            children=[
                column,
                html.Img(
                    src=IMAGE_PATH, width="12", height="12", style={"margin": "7px"}
                ),
            ],
        )
        columnbuttons.append(newcolbutton)
    return columnbuttons


def create_new_filter_buttons(correctfilters, incorrectfilters):
    """
    create the buttons that display which filters are active
    :return: a list of all buttons
    """
    correctfiltersbuttons = []
    for _, correct_filter in enumerate(correctfilters):
        newposbutton = html.Button(
            id={"type": "delete-button-active", "index": correct_filter},
            className="delete-button-active",
            children=[
                correct_filter,
                html.Img(
                    src=IMAGE_PATH, width="12", height="12", style={"margin": "7px"}
                ),
            ],
        )
        correctfiltersbuttons.append(newposbutton)
    for _, incorrect_filter in enumerate(incorrectfilters):
        newnegbutton = html.Button(
            id={"type": "delete-button-active", "index": incorrect_filter},
            className="delete-button-negative",
            children=[
                incorrect_filter,
                html.Img(
                    src=IMAGE_PATH, width="12", height="12", style={"margin": "7px"}
                ),
            ],
        )
        correctfiltersbuttons.append(newnegbutton)
    return correctfiltersbuttons


def prepare_data_for_graph(local_df, columns):
    """
    prepare the data to be used for making a graph
    :param local_df: filtered data
    :return: numbers for each attribute and their names
    """
    data = []
    names = []
    for i in range(0, 2 ** (len(columns))):
        num = bin(i)
        text = ""
        requirements = []
        length = len(columns)
        for j in range(0, length):
            binary_string = num[2:]
            if len(binary_string) < length - j:
                requirements.append("incorrect")
                text = text + " " + columns[j] + " " + "incorrect"
            else:
                if binary_string[j - length] == "1":
                    requirements.append("correct")
                    text = text + " " + columns[j] + " " + "correct"
                else:
                    requirements.append("incorrect")
                    text = text + " " + columns[j] + " " + "incorrect"
        names.append(text)
        tmplocal_df = local_df
        for k, single_column in enumerate(columns):
            tmplocal_df = tmplocal_df[
                tmplocal_df[single_column.replace(" ", "_")] == requirements[(int)(k)]
            ]
        data.append(len(tmplocal_df.index))
    return data, names


def create_marks_for_slider(local_df, all_filters):
    """
    calculate how many attempts have all filters correct and incorrect
    :param local_df: the filtered data
    :return: the marks to add on the sliders
    """
    sliders = []
    for row in all_filters:
        tmprow = row.replace(" ", "_")
        tmp_local_df = local_df
        tmpdf_correct = tmp_local_df[tmp_local_df[tmprow] == "correct"]
        tmp_local_df = local_df
        tmpdf_incorrect = tmp_local_df[tmp_local_df[tmprow] == "incorrect"]
        marks = {
            0: str(len(tmpdf_correct.index)),
            1: "",
            2: str(len(tmpdf_incorrect.index)),
        }
        sliders.append(marks)
    return sliders


def update_button(button, trigger, all_filters):
    """
    update the buttons after they were selected or a slider was changed
    :param button: current buttons
    :param trigger: trigger for the callback
    :return: new buttons
    """
    if "add-button" in trigger:
        for counter, all_buttons in enumerate(all_filters):
            if all_buttons in trigger:
                if button[counter] == "+":
                    button[counter] = "-"
                else:
                    button[counter] = "+"

    if "delete-button-column" in trigger:
        for counter, active_filter in enumerate(all_filters):
            if active_filter in trigger:
                button[counter] = "+"
    if "slider" in trigger:
        for count, filtername in enumerate(all_filters):
            if filtername in trigger:
                button[count] = "+"
    return button


def update_slider(slider, trigger, all_filters):
    """
    update the sliders if an attribute was selected
    :param slider: current sliders
    :param trigger: trigger for the callback
    :return: new sliders
    """
    if "add-button" in trigger:
        for count, filtername in enumerate(all_filters):
            if filtername in trigger:
                slider[count] = 1

    if "delete-button-active" in trigger:
        for counter, active_columns in enumerate(all_filters):
            if active_columns in trigger:
                slider[counter] = 1
    return slider


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


def convert_time(date_time_from, date_time_to):
    """
    converts the format of two given times
    :param date_time_from: time to be converted
    :param date_time_to: time to be converted
    :return: times with converted format
    """
    date_time_from = dateutil.parser.parse(date_time_from)
    date_time_to = dateutil.parser.parse(date_time_to)
    return date_time_from, date_time_to
