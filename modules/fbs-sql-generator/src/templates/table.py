import logging

logger = logging.getLogger("name")


def generate_html_tables(data, tables):
    # Initialize the HTML variable
    int_dropdowns = [
        "ID",
        "PLZ",
        "Zufällige Zahl",
        "Gehalt",
        "Budget",
        "Hausnummer",
        "1-10",
        "1-100",
        "1-1.000",
        "100.000-1.000.000",
        "10.000-100.000",
        "1-10.000",
        "100.000-2.500.000",
    ]
    float_dropdowns = [
        "Gehalt",
        "Kosten",
        "Budget",
        "1-10",
        "1-100",
        "1-1.000",
        "100.000-1.000.000",
        "10.000-100.000",
        "1-10.000",
        "100.000-2.500.000",
    ]
    date_dropdowns = ["Datum", "Geburtstag"]
    varchar_dropdowns = [
        "Nachname",
        "Vorname",
        "Ortsname",
        "Abteilung",
        "Straße",
        "Email",
        "Land",
        "Arbeit",
        "Adresse",
        "PLZ",
        "Unternehmen",
        "Produkt",
    ]
    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dynamic Tables</title>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
<style>
    table {
        border-collapse: collapse;
        width: 80%;
        margin: 20px auto;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
    }
    H1{
        text-align: center;
    }
    H3, H5, p{
        width: 80%;
        margin: 20px auto;
        margin-left: 5%;
    }
    h4, h2{
        display:inline-block;
        margin: 20px auto;
        margin-left: 10%;
    }
    .collaps-button {
        display:inline-block;
    .counter {
        display:inline-block;
    }
    .left-margin-20 {
        margin-left: 100px;
    }
    .header-container {
        width: 80%;
        margin: 20px auto;
        margin-left: 100px;
    }
    .but {
        position: relative;
        left: 10px; /* Adjust the value as needed */
    }
</style>
</head>
<body>
<H1>Datenkonfigurator</H1>
<form id=dataForm>
<input type='submit' class=but value='Generieren'>
"""
    for table in tables:
        dropdown_options = []
        default_value = 100
        if table.upper() == "ABTEILUNG" or table.upper() == "DEPARTMENT":
            default_value = 5
        html += "<div class=header-container>"
        html += f"<H2>{table}</H2>"
        html += "</div>"
        html += "<div class=header-container>"
        html += f"<H4>Anzahl von Einträgen:</H4><input type=number value={default_value} class=counter min=1 step=1 max=1000 name={table}>"
        html += "</div>"
        html += "<table>"
        html += "<thead><tr>"
        html += "<th>Spaltenname</th>"
        html += "<th>Datenart</th>"
        html += "<th>Datentyp</th>"
        html += "</tr></thead><tbody>"
        for table_data in data:
            if table_data[0] != table:
                continue
            html += "<tr>"
            html += f"<td>{table_data[1]}</td>"
            if table_data[4]:
                html += (
                    f"<td><select name={table_data[0]}---{table_data[1]}---dp disabled>"
                )
            else:
                html += f"<td><select name={table_data[0]}---{table_data[1]}---dp >"
            if table_data[3] == "decimal":
                dropdown_options = float_dropdowns
            if table_data[3] == "int":
                dropdown_options = int_dropdowns
            if table_data[3] == "varchar":
                dropdown_options = varchar_dropdowns
            if table_data[3] == "date":
                dropdown_options = date_dropdowns
            for option in dropdown_options:
                if option == table_data[2]:
                    html += (
                        f"<option value='{option}' selected>{table_data[2]}</option>"
                    )
                else:
                    html += f"<option value='{option}'>{option}</option>"
            html += "</select></td>"
            html += f"<td>{table_data[3]}</td>"
            html += "</tr>"
        html += "</tbody></table>"
    html += "</form>"
    html += """
    <script>
        document.getElementById('dataForm').addEventListener('submit', function(event) {
            event.preventDefault();
            var formData = new FormData(this);
            console.log(formData);
            const token = localStorage.getItem('token');
            fetch('/changes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    return response.text();  // Assuming the response is the HTML content
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .then(htmlContent => {
                document.open();
                document.write(htmlContent);
                document.close();
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('output').innerText = 'Error: ' + error;
            });
        });
        document.addEventListener("DOMContentLoaded", function() {
            var coll = document.querySelectorAll(".collapsible");
            coll.forEach(function(button) {
                button.addEventListener("click", function() {
                    this.classList.toggle("active");
                    var content = this.nextElementSibling;
                    if (content.style.display === "block") {
                        content.style.display = "none";
                    } else {
                        content.style.display = "block";
                    }
                });
            });
        });
    </script>"""
    html += """</body>
</html>"""

    return html
