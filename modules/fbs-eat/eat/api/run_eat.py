import dash_bootstrap_components as dbc
from api.analysis.analysis import layout as analysis_layout
from api.connect.connecttominio import data
from api.dashboard.dashboard import layout as dashboard_layout
from api.dataPreProcessing.chooseTaskType import layout as chooseTaskType_layout
from api.dataTable.table import layout as table_layout
from dash import Dash, dcc, html
from dash.dependencies import Input, Output

# debug = False if os.environ["DASH_DEBUG_MODE"] == "False" else True
debug = True
external_stylesheets = [dbc.themes.BOOTSTRAP, "./assets/style.css"]
app = Dash(
    __name__,
    external_stylesheets=external_stylesheets,
    suppress_callback_exceptions=True,
)

server = app.server
app.title = "Dashboard"

app.layout = html.Div(
    [
        dcc.Location(id="url", refresh=False),
        dcc.Store(id="intermediate-value"),
        html.Div(id="container"),
    ]
)


@app.callback(
    Output("container", "children"),
    Output("intermediate-value", "data"),
    Input("url", "pathname"),
)
def getDatas(url):
    return addComponents(), data(url)


def addComponents():
    container = []
    container.append(html.Br())
    container.append(
        html.H1("E-Learning Analytics Tool", style={"text-align": "center"})
    )
    container.append(html.Br())
    container.append(html.Br())
    container.append(chooseTaskType_layout)
    container.append(html.Br())
    container.append(html.Br())
    container.append(dashboard_layout)
    container.append(html.Br())
    container.append(html.Br())
    container.append(table_layout)
    container.append(html.Br())
    container.append(html.Br())
    container.append(analysis_layout)
    container.append(html.Br())
    container.append(html.Br())
    return container


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="8050", debug=debug, dev_tools_props_check=False)
