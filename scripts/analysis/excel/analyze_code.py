from pathlib import Path
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter


def analyze(path):
    ua2_1 = 0
    ua2_2 = 0
    ua3 = 0
    ua3_anlage = 0
    ua4 = 0
    ua4_skala = 0
    ua5 = 0
    ua5_rabatt = 0
    ua6 = 0
    ua7 = 0
    ua8 = 0
    ua9_1_u = 0
    ua9_1_a = 0
    ua9_2 = 0
    sheet_error = 0
    
    path = Path(path)

    for i, input in enumerate(path.glob("*.xlsx*")): # rglob if directory includes subfolders and you want to access those aswell
        wb = load_workbook(filename=input, data_only=True)
        wb_sol = load_workbook("Path of solutionfile has to be entered here currently", data_only=True)
        print(i)

        if i < 270:
            j = 1
            if len(wb.worksheets) <= len(wb_sol.worksheets):
                while j < len(wb.worksheets):
                    ws = wb.worksheets[j]
                    ws_sol = wb_sol.worksheets[j]
                    
                    match j:
                        case 1: # GuV 01 
                            for row in range(1, 34):
                                for col in range(2, 16):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua2_1 += 1
                            j += 1

                        case 2: # GuV 02           
                            for row in range(1,37):
                                for col in range(2, 16):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua2_2 += 1            
                            j += 1

                        case 3: # Bilanzaufstellung
                            for row in range(1,57): 
                                for col in range(2, 5):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua3 += 1
                            j += 1

                        case 4: # Bilanzaufstellung (Anlage)
                            for row in range(1,89): 
                                for col in range(1, 3):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua3_anlage += 1
                            j += 1

                        case 5: # Notenliste
                            for row in range(1, 202): 
                                for col in range(1, 6):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua4 += 1
                            j += 1

                        case 6: # Notenliste (Skala)
                            for row in range(1, 37): 
                                for col in range(1, 6):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua4_skala += 1
                            j += 1
                        
                        case 7: # Rechnung
                            for row in range(1, 48): 
                                for col in range(1, 8):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua5 += 1
                            j += 1

                        case 8: # Rabattstaffel
                            for row in range(1, 10): 
                                for col in range(1, 5):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua5_rabatt += 1
                            j += 1

                        case 9: # Artikelliste
                            for row in range(1, 2323): 
                                for col in range(11, 13):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua6 += 1
                            j += 1

                        case 10: # Studentenbudget
                            for row in range(1, 27): 
                                for col in range(1, 8):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua7 += 1
                            j += 1

                        case 11: # Absatzliste
                            # ua8
                            j += 1 # Only Graph to compare, table was given

                        case 12: # Umsatzliste
                            # Graphcomparison not added
                            for row in range(1, 41): 
                                for col in range(5, 12):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        ua9_1_u += 1
                            j += 1 

                        case 13: # Absatzdiagramm
                            # ua9_1_a
                            j += 1 # Only Graph to compare

                        case 14: # Quartalsumsätze
                            # ua9_2
                            j += 1 # Only Graph to compare

                        case _: # Default
                            j += 1
            else:
                sheet_error += 1
                print("Studentenabgabe hat zu viele Sheets!")
        else:
            print(f"In Unteraufgabe 2.1 (GuV J01) wurden: {ua2_1} Fehler gemacht!")
            print(f"In Unteraufgabe 2.2 (GuV J02) wurden: {ua2_2} Fehler gemacht!")
            print(f"In Unteraufgabe 3 (Bilanzaufstellung) wurden: {ua3} Fehler gemacht!")
            print(f"In Unteraufgabe 3 (Bilanzaufstellung Anlage) wurden: {ua3_anlage} Fehler gemacht!")
            print(f"In Unteraufgabe 4 (Notenliste) wurden: {ua4} Fehler gemacht!")
            print(f"In Unteraufgabe 4 (Notenliste (Skala)) wurden: {ua4_skala} Fehler gemacht!")
            print(f"In Unteraufgabe 5 (Rechnung) wurden: {ua5} Fehler gemacht!")
            print(f"In Unteraufgabe 5 (Rechnung (Rabattstaffel)) wurden: {ua5_rabatt} Fehler gemacht!")
            print(f"In Unteraufgabe 6 (Artikelliste wurden): {ua6} Fehler gemacht!")
            print(f"In Unteraufgabe 7 (Studentenbudget) wurden: {ua7} Fehler gemacht!")
            print(f"In Unteraufgabe 8 (Abstatzliste) wurden: {ua8} Fehler gemacht!")
            print(f"In Unteraufgabe 9.1 (Umstatzliste) wurden: {ua9_1_u} Fehler gemacht!")
            print(f"In Unteraufgabe 9.1 (Absatzdiagramm) wurden: {ua9_1_a} Fehler gemacht!")
            print(f"In Unteraufgabe 9.2 (Quartalsumsätze) wurden: {ua9_2} Fehler gemacht!")
            print(f"Es wurden {sheet_error} Sheets nicht gewertet!")
            break