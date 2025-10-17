"""
utility functions for dashboard.py
"""

import math
import pandas as pd
import plotly.graph_objs as go
from plotly.subplots import make_subplots
import plotly.express as px


def hide_histogram(key_figure_value):
    """
    hides the histogramm if "Typical Mistakes is not selected"
    :param key_figure_value: the selcted Value
    :return: a display style that hides the graph
    """
    if "Typical Mistakes" in key_figure_value:
        display_style = {"display": "block"}
    else:
        display_style = {"display": "none"}
    return display_style


def create_course_bars(hist_df, fig, labels):
    """
    add the correct height to the previously generated bars
    :param hist_df: data
    :param fig: graph with all bars but incorrect heights
    :param labels: labels for each bar
    :return: complete graph
    """
    colors = [
        "#60a7ba",
        "#f0912d",
        "#357025",
        "#ba3622",
        "#8f33d6",
        "#6a4c4d",
        "#cf8af3",
    ]
    all_numbers = []
    for index, _ in enumerate(fig["layout"]["annotations"]):
        all_numbers.append(float(fig["layout"]["annotations"][index]["text"]))

    for _, idx in enumerate(hist_df.index.unique()):
        row = all_numbers.index(idx)
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

        # for i in range(0, row + 1):
        fig.update_yaxes(title_text="Students", row=i + 1, col=1)
    return fig


def create_figure_with_subfigure(exercise_value):
    """
    create the subfigures for every column
    :param exercise_value: chosen exercieses
    :return: all graph with columns for all attributes
    """
    fig = make_subplots(
        rows=math.ceil(len(exercise_value) / 2),
        cols=2,
        subplot_titles=exercise_value,
        shared_xaxes=True,
        shared_yaxes=True,
    )
    return fig


def reduce_data_to_necessary_columns(filtered_df):
    """
    remove unnecessary columns from the data
    :param filtered_df: filtered data with all columns
    :return: filtered data with only the necessary columns
    """
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
    return hist_df


def create_overview_bar(local_df):
    """
    create bars for the average attempt histogram
    :param local_df: data which the graphs are based on
    :return: figure with each task and its number of attempts
    """
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
    return fig


def get_values_from_data(result_df, labels):
    """
    lists the percentages of each mistake occurring
    :param result_df: the filtered data
    :param labels: the labels for each column(names of the attributes)
    :return: dataframe with the labels and the percentage of each of the mistakes occurring
    """
    values = []

    for _, column in enumerate(result_df.columns):
        values.append(result_df[column].Incorrect)

    data = {"labels": labels, "values": values}
    local_df = pd.DataFrame(data)

    # values = local_df["values"].astype(float)
    # local_df["values"] = (values * 100).astype(int)
    return local_df


def get_avg_att_time(local_df, exercise_value):
    """
    gets all times students takes for every task, that is the user is allowed to see and which are
    selected , and every
    student
    :param local_df: data
    :param exercise_value: exercises
    :return: list with times for each task
    """
    times = []
    for task in exercise_value:
        task_data = local_df[local_df["UniqueName"] == task]
        for user in task_data["UserId"].unique():
            user_task_data = task_data[task_data["UserId"] == user]
            single_info = []
            total_duration = 0
            last_date = 0
            for i in range(
                user_task_data["Attempt"].min(), user_task_data["Attempt"].max()
            ):
                datum = user_task_data[user_task_data["Attempt"] == i]
                if datum.empty:
                    continue
                if last_date == 0:
                    last_date = list(datum["Time"])[0]
                else:
                    short_duration = (
                        list(datum["Time"])[0] - last_date
                    ).total_seconds()
                    if 1200 > short_duration >= 0:
                        total_duration += short_duration
                    last_date = list(datum["Time"])[0]
                if (
                    list(user_task_data[user_task_data["Attempt"] == i]["Correct"])[0]
                    == "correct"
                ):
                    break
            single_info.append(task)
            single_info.append(total_duration)
            times.append(single_info)
    return times
