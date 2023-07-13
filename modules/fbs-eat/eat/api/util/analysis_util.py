"""
utility function for analysis.py
"""

from dash import html
from api.util.utilities import select_all_exercises_in_course


IMAGE_PATH = "assets/x.webp"


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


def save_selected_columns(button, all_filters):
    """
    go through all buttons where columns can be selected and save them in a list
    :param button: the list of buttons and their values
    :param all_filters: all filters
    :return: list with columns selected
    """
    columns = []
    for counter, _ in enumerate(button):
        if button[counter] == "-":
            columns.append(all_filters[counter])
    return columns


def set_new_filters(local_df, slider, all_filters):
    """
    Saves the values of the background sliders in two list. One with correct values and
    one with incorrect values also filters the data accordingly
    :param local_df: filtered data
    :param slider: values of all background sliders
    :param all_filters: names of all filters
    :return: two list of background filters and filtered data
    """
    correct_filters = []
    incorrect_filters = []

    for counter, singleslider in enumerate(slider):
        if singleslider == 0:
            correct_filters.append(all_filters[counter])
            local_df = local_df[
                local_df[all_filters[counter].replace(" ", "_")] == "correct"
            ]
        if singleslider == 2:
            incorrect_filters.append(all_filters[counter])
            local_df = local_df[
                local_df[all_filters[counter].replace(" ", "_")] == "incorrect"
            ]
    return correct_filters, incorrect_filters, local_df


def filter_exercises(course_value, local_df, exercise_value):
    """
    filters the data according to the selected courses and exercises
    :param course_value: all selected courses
    :param local_df: currend data frame
    :param exercise_value: all selected exercises
    :return: filtered data, with only selected exercises and courses
    """
    if not exercise_value:
        if course_value:
            exercise_value = select_all_exercises_in_course(local_df, course_value)
        else:
            exercise_value = list(local_df.UniqueName.unique())
    local_df = local_df[local_df.UniqueName.isin(exercise_value)]
    return local_df
