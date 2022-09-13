from pathlib import Path
from openpyxl import load_workbook

i = 1

# Directory of Excel-files, that you want to anonymize
path = Path("Enter directory here")
for input in list(path.glob("*.xlsx*")): # rglob if directory includes subfolders and you want to access those aswell
    wb = load_workbook(filename=input)
    ws = wb.active

    # Cells which include personal data and the values they're replaced with
    ws["B5"] = f"Benutzerkennung Anonym {i}"
    ws["B6"] = f"Nachname Anonym {i}"
    ws["B7"] = f"Vorname Anonym {i}"
    ws["B8"] = f"Geburtsdatum Anonym {i}"
    ws["B10"].hyperlink = None
    ws["B10"] = f"E-Mail Anonym {i}"

    i += 1
    # Saving the changes in workbook 
    wb.save(input)