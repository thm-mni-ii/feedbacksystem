import pandas as pd
import dash
import dash_bootstrap_components as dbc
from dash import dcc, html, ALL, Dash, html, Input, Output, MATCH, callback
from dash.dependencies import Input, Output
import plotly.express as px
import plotly.graph_objects as go


df = pd.read_csv("data/cleaned_data_with_names.csv")

filter = [
    "Projection Attributes",
    "Selection Attributes",
    "Strings",
    "Joins",
    "Tables",
    "Correct",
    "GroupBy",
    "OrderBy"
]
columns = []
correctfilters = []
incorrectfilters = []
n_clicks = 0
image_path = 'assets/x.webp'

layout = html.Div([
    html.H3("Flexible Analyses", style={"text-align": "left", "margin-left": "407px"}),
    dbc.Container(
        dbc.Card(
            html.Div(
                id="analysis_box",
                children= [
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
                                                            df.UniqueName.unique(),
                                                            [
                                                                df[
                                                                    df.CourseName == course
                                                                    ].UniqueName.iloc[0]
                                                                for course in df.CourseName.unique()
                                                            ],
                                                            multi=True,
                                                            placeholder="Select one or more exercise",
                                                            style={"background-color": "#e9e7e9"},
                                                        ),
                                                    ]
                                                )
                                            ),
                                            dbc.Row(
                                                html.Div(  ## Filter Checkboxes
                                                    checklist := dcc.Checklist(
                                                        ["Attempts", "Date", "Semester Weeks"],
                                                        ["Attempts"],
                                                        inline=True,
                                                        style={
                                                            "justify-content": "center",
                                                            "display": "flex",
                                                        },
                                                        inputClassName="checkbox-labels",
                                                        id="checkbox2",
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
                                                value=[df.Attempt.min(), df.Attempt.max()],
                                                marks=None,
                                                id="slider2",
                                            ),
                                        ),
                                        ]
                                    )
                                ],
                                style={"padding": "10px"},
                            ),
                        ]
                    ),
                    dcc.Graph(
                        id='line-graph',
                        figure={}
                    ),
                    html.Div(
                        id="aktiv",
                        style={
                            "margin-left": "20%",
                            "margin-bottom": "40px",
                            "margin-top":"20px"
                        },
                        children = [
                            html.Table(
                                style={
                                    'border-collapse': 'separate',
                                    'border-spacing': '100px 25px'
                                },
                                children = [
                                    html.Tr(
                                        [
                                        html.Td('Active filters',style={"font-size":"18px"}),
                                        html.Td(id="filter",style={"height":"40px"})
                                    ]),
                                    html.Tr([
                                        html.Td('Active Columns',style={"font-size":"18px"}),
                                        html.Td(id="zeilen",style={"height":"40px"})
                                    ])
                                ]
                            )
                        ]
                    ),
                    html.Div(
                        id="filter_block",
                        children=[
                            html.Table(
                                style={
                                    'borderCollapse': 'collapse',
                                    'width': '100%'
                                },
                                id="tabelle",
                                children = [
                                html.Thead([
                                    html.Tr([
                                        html.Th('Key figure', style={"text-align": "center"}),
                                        html.Th('Background filter',style={"text-align": "center"}),
                                        html.Th('Columns',style={"text-align": "center"})
                                    ]),
                                    html.Tr([
                                        html.Td(),
                                        html.Td(
                                            children=[
                                                html.Label('True', style={"color": "lightgreen", "float": "left"}),
                                                html.Label('False', style={"color": "red", "float": "right"}),
                                            ],
                                            style={"text-align": "center"}
                                        ),
                                        html.Td()
                                    ]),
                                ]),
                                html.Tbody(
                                    id = "body",
                                    children = [
                                        html.Tr([
                                            html.Td(row, id={"type": "name", "index": row},style={'textAlign': 'center'}),
                                            html.Td(dcc.Slider(id={"type": "slider3", "index": row}, min=0, max=2,step = 1,value = 1, included = False),style={'textAlign': 'center'}),
                                            html.Td(html.Button('+',id={"type": "add-button", "index": row},className="add-button"),style={'textAlign': 'center'})
                                        ])
                                        for row in filter
                                    ]
                                )
                            ])
                        ]
                    )
                ]
            ),
        )
    )
])

# Update dropdown menu for exercises
@callback(Output(exercise, "options"), Input(course, "value"))
def update_dropdown(input_value):
    if not input_value:
        return df.UniqueName.unique()
    else:
        return df[df.CourseName.isin(input_value)].UniqueName.unique()



@callback(Output(checklist_filter_components, "children"), Input(checklist, "value"))
def checklist_filter_masks(checks):
    """
    This callback creates all required filter masks based on the checklist variable
    """
    filters = []
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
                                    id="slider2",
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
                            id="slider2",
                        ),
                        style={"visibility": "hidden", "height": "0"},
                    )
                )
            )
        )
    return filters


@callback(
    [
    Output({"type": "add-button", "index": ALL}, 'children'),
    Output("zeilen", 'children'),
    Output("filter", 'children'),
    Output("line-graph","figure"),
    Output({"type": "slider3", "index": ALL}, 'marks'),
    Output({"type": "slider3", "index": ALL}, 'value'),
    ],
    [
    Input("body","children"),
    Input({"type": "name", "index": ALL},'children'),
    Input({"type": "slider3", "index": ALL}, 'value'),
    Input({"type": "add-button", "index": ALL},'children'),
    Input({"type": "add-button", "index": ALL}, 'n_clicks'),
    Input("line-graph","figure"),
    Input(exercise,"value"),
    Input("slider2","value"),
    Input(course, "value"),
    Input(exercise,"options"),
    Input({"type": "delete-button-active", "index": ALL}, 'n_clicks'),
    Input({"type": "delete-button-column", "index": ALL}, 'n_clicks')
    ]
)
def update(tabelle,name,slider,button,clicks,graph,exercises,limits,courses,exercise_options,deletebuttons,columnbuttons):
    trigger = dash.callback_context.triggered[0]["prop_id"].split(".")[0]
    sliders = []
    if not exercises:
        exercises = exercise_options
    #Reduce the data to the data of the selected exercises and the selected limits of attempts
    dff = df[df.UniqueName.isin(exercises)]
    limits = limits or [dff.Attempt.min(), dff.Attempt.max()]
    dff = dff[
        (dff.Attempt.ge(limits[0]))
        & (dff.Attempt.le(limits[1]))
    ]
    #calculate the numbers displayed in the slider
    for row in filter:
        tmprow = row.replace(" ", "_")
        tmp = dff
        tmpdf = tmp[tmp[tmprow] == "correct"]
        tmp = dff
        tmpdf2 = tmp[tmp[tmprow] == "incorrect"]
        marks = {
            0: str(len(tmpdf.index)),
            1: "",
            2: str(len(tmpdf2.index))
        }
        sliders.append(marks)
    #abort rest of the function in the initial callback
    if trigger == "":
        return button,columns,correctfilters,incorrectfilters, graph, sliders,slider
    else:
        #reset slider if the button belonging to it was changed
        if "add-button" in trigger:
            count = 0
            for filtername in filter:
                if filtername in trigger:
                    slider[count] = 1
                count = count + 1

            #change the display of a button after it was pressed
            for counter in range(0,len(filter)):
                if filter[counter] in trigger:
                    if button[counter] == '+':
                        button[counter] = '-'
                    else:
                        button[counter] = '+'

        if "delete-button-column" in trigger:
            for counter in range(0,len(filter)):
                if filter[counter] in trigger:
                    button[counter] = '+'


        if "delete-button-active" in trigger:
            for counter in range(0,len(filter)):
                if filter[counter] in trigger:
                    slider[counter] = 1


        #reset a button after the slider belonging to it was changed
        counter = 0
        columns.clear()
        if "slider" in trigger:
            count = 0
            for filtername in filter:
                if filtername in trigger:
                    button[count] = '+'
                count = count + 1

        #save which columns were selected
        for counter in range(0,len(clicks)):
            if button[counter] == '-':
                columns.append(filter[counter])

        #save which filters were selected
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
    for i in range(0,len(correctfilters)):
        tmpsave = correctfilters[i]
        tmpdf = tmpdf[tmpdf[tmpsave.replace(" ", "_")] == "correct"]
    for i in range(0,len(incorrectfilters)):
        tmpsave = incorrectfilters[i]
        tmpdf = tmpdf[tmpdf[tmpsave.replace(" ", "_")] == "incorrect"]
    correctfiltersbuttons = []
    columnbuttons = []
    #create buttons to display which filters and which columns are shown and to disable said options
    for i in range(0, len(correctfilters)):
        newposbutton = html.Button(id={"type": "delete-button-active", "index": correctfilters[i]},
                                   className="delete-button-active",children=[correctfilters[i],
                                   html.Img(src=image_path,width="12",height="12",style={"margin":"7px"})])
        correctfiltersbuttons.append(newposbutton)
    for j in range(0, len(incorrectfilters)):
        newnegbutton = html.Button(id={"type": "delete-button-active", "index": incorrectfilters[j]},
                                   className="delete-button-negative",children=[incorrectfilters[j],
                                    html.Img(src=image_path,width="12",height="12",style={"margin":"7px"})])
        correctfiltersbuttons.append(newnegbutton)
    for k in range(0,len(columns)):
        newcolbutton = html.Button(id={"type": "delete-button-column", "index": columns[k]},
                                   className="delete-button-column",children=[columns[k],
                                    html.Img(src=image_path,width="12",height="12",style={"margin":"7px"})])
        columnbuttons.append(newcolbutton)
    #prepare the data to create a graph
    data = []
    names = []
    if tmpdf is not None:
        for i in range(0,2**(len(columns))):
            num = bin(i)
            text = ""
            requirements = []
            length = len(columns)
            for j in range(0,length):
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
            for k in range(0,len(columns)):
                tmpdff = tmpdff[tmpdff[columns[k].replace(" ", "_")] == requirements[(int)(k)]]
            data.append(len(tmpdff.index))

    #create graph
    figdf = pd.DataFrame(list(zip(names, data)),
                      columns=['names', 'data'])
    fig = px.bar(figdf,x='names',y='data',labels={
        "names":"",
        "data":"Count"},
        text = 'data',
        color = 'names'
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

