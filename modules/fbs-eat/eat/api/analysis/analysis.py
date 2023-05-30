'''
Display data while making it possible to filter in background
'''
from datetime import datetime, timedelta

import dash
import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
from dash import ALL, Input, Output, callback, dcc, html
from api.connect.data_service import get_data
import logging
import dateutil.parser


logger = logging.getLogger("name")


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
IMAGE_PATH = "assets/x.webp"

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
                                                    html.Div(
                                                        [
                                                            "Course",
                                                            course := dcc.Dropdown(
                                                                tmp_df.CourseName.unique(),
                                                                tmp_df.CourseName.unique(),
                                                                multi=True,
                                                                placeholder=
                                                                "Select one or more courses",
                                                                style={
                                                                    "background-color": "#e9e7e9"
                                                                },
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
                                                                placeholder=
                                                                "Select one or more exercise",
                                                                style={
                                                                    "background-color": "#e9e7e9"
                                                                },
                                                            ),
                                                        ]
                                                    )
                                                ),
                                                dbc.Col(
                                                    timerow := html.Div(
                                                        [
                                                            "Date/Time From",
                                                            dcc.Input(
                                                                id="date_time_from2",
                                                                value=datetime.now().strftime(
                                                                    "%Y-%m-%dT%H:%M"
                                                                ),
                                                                type="datetime-local",
                                                            ),
                                                            "Date/Time To",
                                                            dcc.Input(
                                                                id="date_time_to2",
                                                                value=(
                                                                    datetime.now()
                                                                    + timedelta(
                                                                        hours=1,
                                                                        minutes=30,
                                                                    )
                                                                ).strftime(
                                                                    "%Y-%m-%dT%H:%M"
                                                                ),
                                                                type="datetime-local",
                                                            ),
                                                        ]
                                                    ),
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
                                                            id="checkbox_analysis",
                                                        )
                                                    ),
                                                    style={"margin-top": "20px"},
                                                ),
                                                checklist_filter_components := html.Div(
                                                    # default slider which will be
                                                    # overwritten by callback
                                                    # still necessary to prevent:
                                                    # "A nonexistent object was used
                                                    # in an Input of a Dash callback"
                                                    dcc.RangeSlider(
                                                        tmp_df.Attempt.min(),
                                                        tmp_df.Attempt.max(),
                                                        1,
                                                        value=[
                                                            tmp_df.Attempt.min(),
                                                            tmp_df.Attempt.max(),
                                                        ],
                                                        marks=None,
                                                        id="slider_attempt_analysis",
                                                    ),
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
                                                                    "type":
                                                                        "slider_background_filter",
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


@callback(
    Output(timerow, "children"), Input(checklist, "value"),
)
def hide_time(checkbox):
    '''
    hide the time-input when the time checkbox is not selected
    :param checkbox: all checkboxes
    :return: the checkbox but with the inputs hidden
    '''
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
        return test
    return html.Div(
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
    )


@callback(
    Output(course, "options"),
    Output(course, "value"),
    Input("intermediate-value", "data"),
    Input("courses_dict", "data"),
)
def update_exercise(daten, courses_dict):
    '''
    replace the ids of the courses with their actual name when displayed
    :param daten: all data to display
    :param courses_dict: list of the real names of all courses
    :return: all courses that are selecteable
    '''
    empty_list = []
    local_df = pd.read_json(daten)
    local_df = local_df[local_df["UserId"] != 0]
    courses = [
        {"value": course_id, "label": courses_dict.get(str(course_id)) or course_id}
        for course_id in local_df.CourseName.unique()
    ]
    return courses, empty_list


@callback(
    Output(exercise, "options"),
    Input(course, "value"),
    Input("intermediate-value", "data"),
)
def update_dropdown(input_value, daten):
    '''
    Update dropdown menu for exercises when course selection changes
    :param input_value: selected courses
    :param daten: all data
    :return: all exercises that can be selected
    '''
    local_df = pd.read_json(daten)
    local_df = local_df[local_df["UserId"] != 0]

    if not input_value:
        return local_df.UniqueName.unique()
    return local_df[local_df.CourseName.isin(input_value)].UniqueName.unique()


@callback(
    Output("date_time_to2", "value"),
    Input("date_time_from2", "value"),
    Input(checklist, "value"),
)
def update_date_time_to(input_value, check):
    '''
    set the time of the to-input 1 hour and 30 minutes after the from date,
    after the from date was changed
    :param input_value: datetime to which 90 minutes need to be added
    :param check: checklist to check if date was selected
    :return: datetime with updated time
    '''
    date_time = dateutil.parser.parse(input_value)
    if "Date" in check:
        return date_time + timedelta(hours=1, minutes=30)
    return date_time


@callback(
    Output(checklist_filter_components, "children"),
    Input(checklist, "value"),
    Input("intermediate-value", "data"),
)
def checklist_filter_masks(checks, daten):
    """
    This callback creates all required filter masks based on the checklist variable
    """
    filters = []
    local_df = pd.read_json(daten)
    local_df = local_df[local_df["UserId"] != 0]

    for box in checks:
        if box == "Attempts":
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
                                    value=[local_df.Attempt.min(), local_df.Attempt.max()],
                                    marks=None,
                                    tooltip={
                                        "placement": "bottom",
                                        "always_visible": True,
                                    },
                                    id="slider_attempt_analysis",
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
                            id="slider_attempt_analysis",
                        ),
                        style={"visibility": "hidden", "height": "0"},
                    )
                )
            )
        )
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
        Input(exercise, "value"),
        Input("slider_attempt_analysis", "value"),
        Input(course, "value"),
        Input(exercise, "options"),
        Input({"type": "delete-button-active", "index": ALL}, "n_clicks"),
        Input({"type": "delete-button-column", "index": ALL}, "n_clicks"),
        Input("date_time_from2", "value"),
        Input("date_time_to2", "value"),
        Input("intermediate-value", "data"),
        Input(checklist, "value"),
    ],
)
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
    '''
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
    '''
    trigger = dash.callback_context.triggered[0]["prop_id"].split(".")[0]
    fig = {}
    local_df = pd.read_json(daten)
    local_df["Time"] = pd.to_datetime(local_df.Time)
    local_df = local_df[local_df["UserId"] != 0]

    date_time_from = dateutil.parser.parse(date_time_from)

    date_time_to = dateutil.parser.parse(date_time_to)

    if not exercises:
        exercises = exercise_options
    # Reduce the data to the data of the selected exercises and the selected limits of attempts
    local_df = local_df[local_df.UniqueName.isin(exercises)]
    limits = limits or [local_df.Attempt.min(), local_df.Attempt.max()]
    local_df = local_df[(local_df.Attempt.ge(limits[0])) & (local_df.Attempt.le(limits[1]))]

    sliders = create_marks_for_slider(local_df)
    # abort rest of the function in the initial callback
    if trigger == "":
        return button, columns, correctfilters, incorrectfilters, fig, sliders, slider
    # reset slider if the button belonging to it was changed
    slider = update_slider(slider, trigger)
    button = update_button(button,trigger)

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
            local_df = local_df[local_df[all_filters[counter].replace(" ", "_")] == "correct"]
        if singleslider == 2:
            incorrectfilters.append(all_filters[counter])
            local_df = local_df[local_df[all_filters[counter].replace(" ", "_")] == "incorrect"]

    # get the data according to selected courses, columns and filters
    tmpdf = local_df[local_df.CourseName.isin(courses)]
    for _, correct_filter in enumerate(correctfilters):
        tmpsave = correct_filter
        tmpdf = tmpdf[tmpdf[tmpsave.replace(" ", "_")] == "correct"]
    for _, incorrect_filter  in enumerate(incorrectfilters):
        tmpsave = incorrect_filter
        tmpdf = tmpdf[tmpdf[tmpsave.replace(" ", "_")] == "incorrect"]

    columnbuttons = create_new_columns_buttons()
    correctfiltersbuttons = create_new_filter_buttons()

    if "Date" in check_list:
        local_df = local_df[(local_df.Time >= date_time_from) & (local_df.Time < date_time_to)]
    if tmpdf is not None:
        data, names = prepare_data_for_graph(local_df)
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

def update_slider(slider, trigger):
    '''
    update the sliders if an attribute was selected
    :param slider: current sliders
    :param trigger: trigger for the callback
    :return: new sliders
    '''
    if "add-button" in trigger:
        for count, filtername in enumerate(all_filters):
            if filtername in trigger:
                slider[count] = 1

    if "delete-button-active" in trigger:
        for counter, active_columns  in enumerate(all_filters):
            if active_columns in trigger:
                slider[counter] = 1
    return slider

def update_button(button, trigger):
    '''
    update the buttons after they were selected or a slider was changed
    :param button: current buttons
    :param trigger: trigger for the callback
    :return: new buttons
    '''
    if "add-button" in trigger:
        for counter, all_buttons in enumerate(all_filters):
            if all_buttons in trigger:
                if button[counter] == "+":
                    button[counter] = "-"
                else:
                    button[counter] = "+"

    if "delete-button-column" in trigger:
        for counter, active_filter  in enumerate(all_filters):
            if active_filter in trigger:
                button[counter] = "+"
    if "slider" in trigger:
        for count, filtername in enumerate(all_filters):
            if filtername in trigger:
                button[count] = "+"
    return button

def create_marks_for_slider(local_df):
    '''
    calculate how many attempts have all filters correct and incorrect
    :param local_df: the filtered data
    :return: the marks to add on the sliders
    '''
    sliders = []
    for row in all_filters:
        tmprow = row.replace(" ", "_")
        tmp_local_df = local_df
        tmpdf_correct = tmp_local_df[tmp_local_df[tmprow] == "correct"]
        tmp_local_df = local_df
        tmpdf_incorrect = tmp_local_df[tmp_local_df[tmprow] == "incorrect"]
        marks = {0: str(len(tmpdf_correct.index)), 1: "", 2: str(len(tmpdf_incorrect.index))}
        sliders.append(marks)
    return sliders

def create_new_filter_buttons():
    '''
    create the buttons that display which filters are active
    :return: a list of all buttons
    '''
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

def create_new_columns_buttons():
    '''
    create the buttons that display which columns are displayed
    :return: a list of all buttons
    '''
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

def prepare_data_for_graph(local_df):
    '''
    prepare the data to be used for making a graph
    :param local_df: filtered data
    :return: numbers for each attribute and their names
    '''
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
