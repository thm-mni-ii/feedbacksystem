# import io
from datetime import datetime, timedelta

import dash
import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px
from api.connect.data_service import data
from dash import ALL, Input, Output, callback, dcc, html
from dash.dependencies import Input, Output

df = data(-1)

filter = [
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
n_clicks = 0
image_path = "assets/x.webp"

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
                                                                df.CourseName.unique(),
                                                                df.CourseName.unique(),
                                                                multi=True,
                                                                placeholder="Select one or more courses",
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
                                                                df.UniqueName.unique(),
                                                                # [
                                                                #    df[
                                                                #        df.CourseName == course
                                                                #        ].UniqueName.iloc[0]
                                                                #    for course in df.CourseName.unique()
                                                                # ],
                                                                multi=True,
                                                                placeholder="Select one or more exercise",
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
                                                                value=datetime.now().strftime("%Y-%m-%dT%H:%M"),
                                                                type="datetime-local",
                                                            ),
                                                            "Date/Time To",
                                                            dcc.Input(
                                                                id="date_time_to2",
                                                                value=(
                                                                        datetime.now()
                                                                        + timedelta(hours=1, minutes=30)
                                                                ).strftime("%Y-%m-%dT%H:%M"),
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
                                                    # default slider which will be overwritten by callback
                                                    # still necessary to prevent:
                                                    # "A nonexistent object was used in an Input of a Dash callback"
                                                    dcc.RangeSlider(
                                                        df.Attempt.min(),
                                                        df.Attempt.max(),
                                                        1,
                                                        value=[
                                                            df.Attempt.min(),
                                                            df.Attempt.max(),
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
                                                for row in filter
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

@callback(Output(timerow,"children"),Input(checklist,"value"),Input(timerow,"children"))
def hide_time(checkbox,reihe):
    if "Date" in checkbox:
        test =  html.Div(
            [
                "Date/Time From",
                dcc.Input(
                    id = "date_time_from2",
                    value = datetime.now().strftime("%Y-%m-%dT%H:%M"),
                    type="datetime-local",
                ),
                "Date/Time To",
                dcc.Input(
                    id = "date_time_to2",
                    value =  (
                        datetime.now()
                        + timedelta(hours=1, minutes=30)
                    ).strftime("%Y-%m-%dT%H:%M"),
                    type="datetime-local",
                ),
            ]
        )
        return test
    else:
        return html.Div(
            children =
            [
                "Date/Time From",
                dcc.Input(
                    id = "date_time_from2",
                    value = (datetime.now() - timedelta(hours=500000)).strftime("%Y-%m-%dT%H:%M"),
                    type="datetime-local",
                ),
                "Date/Time To",
                dcc.Input(
                    id = "date_time_to2",
                    value = datetime.now().strftime("%Y-%m-%dT%H:%M"),
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
    emptyList = []
    df = pd.read_json(daten)
    df = df[df['UserId'] != 0]
    courses = [{"value": course_id, "label": courses_dict.get(str(course_id)) or course_id} for course_id in df.CourseName.unique()]
    return courses, emptyList


# Update dropdown menu for exercises
@callback(
    Output(exercise, "options"),
    Input(course, "value"),
    Input("intermediate-value", "data"),
)
def update_dropdown(input_value, daten):
    df = pd.read_json(daten)
    df = df[df['UserId'] != 0]

    if not input_value:
        return df.UniqueName.unique()
    else:
        return df[df.CourseName.isin(input_value)].UniqueName.unique()


# Update date_time_to based on date_time_from
@callback(Output("date_time_to2", "value"), Input("date_time_from2", "value"),Input(checklist,"value"))
def update_date_time_to(input_value,check):
    if "Date" in check:
        try:
            date_time = datetime.strptime(input_value, "%Y-%m-%dT%H:%M")
            return date_time + timedelta(hours=1, minutes=30)
        except:
            return input_value
    else:
        date_time = datetime.now().strftime("%Y-%m-%dT%H:%M")
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
    df = pd.read_json(daten)
    df = df[df['UserId'] != 0]

    for box in checks:
        if box == "Attempts":
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
                                    id="slider_attempt_analysis",
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
        Input("body", "children"),
        Input({"type": "name", "index": ALL}, "children"),
        Input({"type": "slider_background_filter", "index": ALL}, "value"),
        Input({"type": "add-button", "index": ALL}, "children"),
        Input({"type": "add-button", "index": ALL}, "n_clicks"),
        Input("line-graph", "figure"),
        Input(exercise, "value"),
        Input("slider_attempt_analysis", "value"),
        Input(course, "value"),
        Input(exercise, "options"),
        Input({"type": "delete-button-active", "index": ALL}, "n_clicks"),
        Input({"type": "delete-button-column", "index": ALL}, "n_clicks"),
        Input("date_time_from2", "value"),
        Input("date_time_to2", "value"),
        Input("intermediate-value", "data"),
        Input(checklist,"value")
    ],
)
def update(
    tabelle,
    name,
    slider,
    button,
    clicks,
    graph,
    exercises,
    limits,
    courses,
    exercise_options,
    deletebuttons,
    columnbuttons,
    date_time_from,
    date_time_to,
    daten,
    check_list
):
    trigger = dash.callback_context.triggered[0]["prop_id"].split(".")[0]
    sliders = []
    df = pd.read_json(daten)
    df["Time"] = pd.to_datetime(df.Time)
    df = df[df['UserId'] != 0]

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
    if not exercises:
        exercises = exercise_options
    # Reduce the data to the data of the selected exercises and the selected limits of attempts
    dff = df[df.UniqueName.isin(exercises)]
    limits = limits or [dff.Attempt.min(), dff.Attempt.max()]
    dff = dff[(dff.Attempt.ge(limits[0])) & (dff.Attempt.le(limits[1]))]

    # calculate the numbers displayed in the slider
    for row in filter:
        tmprow = row.replace(" ", "_")
        tmp = dff
        tmpdf = tmp[tmp[tmprow] == "correct"]
        tmp = dff
        tmpdf2 = tmp[tmp[tmprow] == "incorrect"]
        marks = {0: str(len(tmpdf.index)), 1: "", 2: str(len(tmpdf2.index))}
        sliders.append(marks)
    # abort rest of the function in the initial callback
    if trigger == "":
        return button, columns, correctfilters, incorrectfilters, graph, sliders, slider
    else:
        # reset slider if the button belonging to it was changed
        if "add-button" in trigger:
            count = 0
            for filtername in filter:
                if filtername in trigger:
                    slider[count] = 1
                count = count + 1

            # change the display of a button after it was pressed
            for counter in range(0, len(filter)):
                if filter[counter] in trigger:
                    if button[counter] == "+":
                        button[counter] = "-"
                    else:
                        button[counter] = "+"

        if "delete-button-column" in trigger:
            for counter in range(0, len(filter)):
                if filter[counter] in trigger:
                    button[counter] = "+"

        if "delete-button-active" in trigger:
            for counter in range(0, len(filter)):
                if filter[counter] in trigger:
                    slider[counter] = 1

        # reset a button after the slider belonging to it was changed
        counter = 0
        columns.clear()
        if "slider" in trigger:
            count = 0
            for filtername in filter:
                if filtername in trigger:
                    button[count] = "+"
                count = count + 1

        # save which columns were selected
        for counter in range(0, len(clicks)):
            if button[counter] == "-":
                columns.append(filter[counter])

        # save which filters were selected
        correctfilters.clear()
        incorrectfilters.clear()
        counter = 0
        for singleslider in slider:
            if singleslider == 0:
                correctfilters.append(filter[counter])
                dff = dff[dff[filter[counter].replace(" ", "_")] == "correct"]
            if singleslider == 2:
                incorrectfilters.append(filter[counter])
                dff = dff[dff[filter[counter].replace(" ", "_")] == "incorrect"]
            counter = counter + 1

    # get the data according to selected courses, columns and filters
    tmpdf = dff[dff.CourseName.isin(courses)]
    for i in range(0, len(correctfilters)):
        tmpsave = correctfilters[i]
        tmpdf = tmpdf[tmpdf[tmpsave.replace(" ", "_")] == "correct"]
    for i in range(0, len(incorrectfilters)):
        tmpsave = incorrectfilters[i]
        tmpdf = tmpdf[tmpdf[tmpsave.replace(" ", "_")] == "incorrect"]
    correctfiltersbuttons = []
    columnbuttons = []
    # create buttons to display which filters and which columns are shown and to disable said options
    for i in range(0, len(correctfilters)):
        newposbutton = html.Button(
            id={"type": "delete-button-active", "index": correctfilters[i]},
            className="delete-button-active",
            children=[
                correctfilters[i],
                html.Img(
                    src=image_path, width="12", height="12", style={"margin": "7px"}
                ),
            ],
        )
        correctfiltersbuttons.append(newposbutton)
    for j in range(0, len(incorrectfilters)):
        newnegbutton = html.Button(
            id={"type": "delete-button-active", "index": incorrectfilters[j]},
            className="delete-button-negative",
            children=[
                incorrectfilters[j],
                html.Img(
                    src=image_path, width="12", height="12", style={"margin": "7px"}
                ),
            ],
        )
        correctfiltersbuttons.append(newnegbutton)
    for k in range(0, len(columns)):
        newcolbutton = html.Button(
            id={"type": "delete-button-column", "index": columns[k]},
            className="delete-button-column",
            children=[
                columns[k],
                html.Img(
                    src=image_path, width="12", height="12", style={"margin": "7px"}
                ),
            ],
        )
        columnbuttons.append(newcolbutton)
    # prepare the data to create a graph
    data = []
    names = []
    if "Date" in check_list:
        dff = dff[(dff.Time >= date_time_from) & (dff.Time < date_time_to)]
    if tmpdf is not None:
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
            tmpdff = dff
            for k in range(0, len(columns)):
                tmpdff = tmpdff[
                    tmpdff[columns[k].replace(" ", "_")] == requirements[(int)(k)]
                ]
            data.append(len(tmpdff.index))

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
    """
    potentially to change orientation of the legend
    fig.update_layout(
        xaxis=go.layout.XAxis(
            tickangle=90)
    )
    """
    return button, columnbuttons, correctfiltersbuttons, fig, sliders, slider
