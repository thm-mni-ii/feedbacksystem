import dominate
import logging

logger = logging.getLogger("name")
from dominate.tags import *


def download_file(data, jwt_token):
    doc = dominate.document(title="Downlad")
    with doc.head:
        title("Download")
        script(type="text/javascript").add_raw_string(
            """
           window.onload = function() {
                var token = "%s";
                fetch('/download', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                })
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    } else {
                        throw new Error('Failed to download file');
                    }
                })
                .then(blob => {
                    // Create a URL for the blob and set it as the href attribute of an anchor element
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'sql-dump.sql'; // Set the desired file name and extension
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }"""
            % jwt_token
        )
    with doc.body:
        doc.body.add(h2("Die folgenden Tabellen wurden an diesen Stellen angepasst:"))
        for table in data:
            if len(table) == 0:
                continue
            doc.body.add(h3(table[0][0]))
            ul_list = ul()
            for element in table:
                if len(element) == 2:
                    ul_list += li(
                        f"Die Spalte: {element[1]} hat vier Variationen des Namens Schmitt"
                    )
                else:
                    ul_list += li(
                        f'Die Spalte "{element[1]}" hat Nachbarn um folgenden Wert: {element[2]}'
                    )
                    ul_list += li(
                        f'Die Spalte "{element[1]}" hat doppelte Maxima und Minima'
                    )
            doc.body.add(ul_list)
    return doc.render()
