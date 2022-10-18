import os
from pathlib import Path
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

def analyze(path, path_sol):
    ua1 = 0

    ua2_1 = 0
    ua2_1_f = 0
    ua2_1_n = 0
    ua2_1_style = 0

    ua2_2 = 0
    ua2_2_f = 0
    ua2_2_n = 0
    ua2_2_style = 0

    ua3 = 0
    ua3_f = 0
    ua3_n = 0
    ua3_style = 0

    ua3_anlage = 0
    ua3_anlage_f = 0
    ua3_anlage_n = 0
    ua3_anlage_style = 0

    ua4 = 0
    ua4_f = 0
    ua4_n = 0
    ua4_style = 0

    ua4_skala = 0
    ua4_skala_f = 0
    ua4_skala_n = 0
    ua4_skala_style = 0

    ua5 = 0
    ua5_f = 0
    ua5_n = 0
    ua5_style = 0

    ua5_rabatt = 0
    ua5_rabatt_f = 0
    ua5_rabatt_n = 0
    ua5_rabatt_style = 0

    ua6 = 0
    ua6_f = 0
    ua6_n = 0
    ua6_style = 0

    ua7 = 0
    ua7_f = 0
    ua7_n = 0
    ua7_style = 0

    ua8 = 0
    ua8_f = 0
    ua8_n = 0
    ua8_style = 0

    ua9_1_u = 0
    ua9_1_u_f = 0
    ua9_1_u_n = 0
    ua9_1_u_style = 0

    ua9_1_a = 0
    ua9_1_a_f = 0
    ua9_1_a_n = 0
    ua9_1_a_style = 0

    ua9_2 = 0
    ua9_2_f = 0
    ua9_2_n = 0
    ua9_2_style = 0

    sheet_error = 0
    file_count = 0

    path = Path(path)
    path_sol = Path(path_sol)

    # counts ".xlsx"-files in directory, thats supposed to be analyzed
    for file in os.listdir(path):
        if (file.endswith("xlsx")):
            file_count += 1
    print('File count:', file_count)


    wb_sol = load_workbook(path_sol)
    wb_sol2 = load_workbook(path_sol, data_only=True)
    for i, input in enumerate(path.glob("*.xlsx*")): # rglob if directory includes subfolders and you want to access those aswell
        wb = load_workbook(filename=input)
        wb2 = load_workbook(filename=input, data_only=True)
        print(i)

        if  i < file_count:
            j = 0
            if len(wb.worksheets) <= len(wb_sol.worksheets):
                while j < len(wb.worksheets):
                    ws = wb.worksheets[j]
                    ws_sol = wb_sol.worksheets[j]
                    ws2 = wb2.worksheets[j]
                    ws_sol2 = wb_sol2.worksheets[j]
                    
                    match j:
                        case 0:
                            for row in range(1, 28): 
                                for col in range(1, 7):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua1 += 1
                            j += 1
                        case 1: # GuV 01 
                            for row in range(1, 34): 
                                for col in range(2, 16):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua2_1 += 1
                                            ua2_1_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua2_1 += 1
                                            ua2_1_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua2_1 += 1
                                        ua2_1_style += 1
                            j += 1

                        case 2: # GuV 02           
                            for row in range(1,37):
                                for col in range(2, 16):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua2_2 += 1
                                            ua2_2_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua2_2 += 1
                                            ua2_2_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua2_2 += 1
                                        ua2_2_style += 1            
                            j += 1

                        case 3: # Bilanzaufstellung
                            for row in range(1,57): 
                                for col in range(2, 5):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua3 += 1
                                            ua3_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua3 += 1
                                            ua3_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua3 += 1
                                        ua3_style += 1
                            j += 1

                        case 4: # Bilanzaufstellung (Anlage)
                            for row in range(1,89): 
                                for col in range(1, 3):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua3_anlage += 1
                                            ua3_anlage_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua3_anlage += 1
                                            ua3_anlage_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua3_anlage += 1
                                        ua3_anlage_style += 1
                            j += 1

                        case 5: # Notenliste
                            for row in range(1, 202): 
                                for col in range(1, 6):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua4 += 1
                                            ua4_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua4 += 1
                                            ua4_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua4 += 1
                                        ua4_style += 1
                            j += 1

                        case 6: # Notenliste (Skala)
                            for row in range(1, 37): 
                                for col in range(1, 6):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua4_skala += 1
                                            ua4_skala_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua4_skala += 1
                                            ua4_skala_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua4_skala += 1
                                        ua4_skala_style += 1
                            j += 1
                        
                        case 7: # Rechnung
                            for row in range(1, 48): 
                                for col in range(1, 8):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua5 += 1
                                            ua5_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua5 += 1
                                            ua5_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua5 += 1
                                        ua5_style += 1
                            j += 1

                        case 8: # Rabattstaffel
                            for row in range(1, 10): 
                                for col in range(1, 5):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua5_rabatt += 1
                                            ua5_rabatt_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua5_rabatt += 1
                                            ua5_rabatt_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua5_rabatt += 1
                                        ua5_rabatt_style += 1
                            j += 1

                        case 9: # Artikelliste
                            for row in range(1, 2323): 
                                for col in range(11, 13):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua6 += 1
                                            ua6_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua6 += 1
                                            ua6_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua6 += 1
                                        ua6_style += 1
                            j += 1

                        case 10: # Studentenbudget
                            for row in range(1, 27): 
                                for col in range(1, 8):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua7 += 1
                                            ua7_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua7 += 1
                                            ua7_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua7 += 1
                                        ua7_style += 1
                            j += 1

                        case 11: # Absatzliste
                            # ua8
                            j += 1 # Only graph to compare, table was given

                        case 12: # Umsatzliste
                            # Graphcomparison not added.
                            for row in range(1, 41): 
                                for col in range(5, 12):
                                    char = get_column_letter(col)
                                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua9_1_u += 1
                                            ua9_1_u_f += 1
                                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                                            ua9_1_u += 1
                                            ua9_1_u_n += 1
                                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                                        ua9_1_u += 1
                                        ua9_1_u_style += 1
                            j += 1 

                        case 13: # Absatzdiagramm
                            # ua9_1_a
                            j += 1 # Only Graph to compare

                        case 14: # Quartalsumsätze
                            # ua9_2
                            j += 1 # Only graph to compare

                        case _: # Default
                            print("default case was triggered")
                            j += 1
            else:
                sheet_error += 1
                print("Studentenabgabe hat zu viele Sheets!")


    print(f"In Unteraufgabe 1 (Stammblatt) wurden: {ua1} (Style-)Fehler gemacht!")

    print(f"In Unteraufgabe 2.1 (GuV J01) wurden: {ua2_1} Fehler gemacht!")
    print(f"Davon waren {ua2_1_f} Formel-, {ua2_1_n} Werte- & {ua2_1_style} Stylefehler!")

    print(f"In Unteraufgabe 2.2 (GuV J02) wurden: {ua2_2} Fehler gemacht!")
    print(f"Davon waren {ua2_2_f} Formel-, {ua2_2_n} Werte- & {ua2_2_style} Stylefehler!")

    print(f"In Unteraufgabe 3 (Bilanzaufstellung) wurden: {ua3} Fehler gemacht!")
    print(f"Davon waren {ua3_f} Formel-, {ua3_n} Werte- & {ua3_style} Stylefehler!")

    print(f"In Unteraufgabe 3 (Bilanzaufstellung Anlage) wurden: {ua3_anlage} Fehler gemacht!")
    print(f"Davon waren {ua3_anlage_f} Formel-, {ua3_anlage_n} Werte- & {ua3_anlage_style} Stylefehler!")

    print(f"In Unteraufgabe 4 (Notenliste) wurden: {ua4} Fehler gemacht!")
    print(f"Davon waren {ua4_f} Formel-, {ua4_n} Werte- & {ua4_style} Stylefehler!")

    print(f"In Unteraufgabe 4 (Notenliste (Skala)) wurden: {ua4_skala} Fehler gemacht!")
    print(f"Davon waren {ua4_skala_f} Formel-, {ua4_skala_n} Werte- & {ua4_skala_style} Stylefehler!")

    print(f"In Unteraufgabe 5 (Rechnung) wurden: {ua5} Fehler gemacht!")
    print(f"Davon waren {ua5_f} Formel-, {ua5_n} Werte- & {ua5_style} Stylefehler!")

    print(f"In Unteraufgabe 5 (Rechnung (Rabattstaffel)) wurden: {ua5_rabatt} Fehler gemacht!")
    print(f"Davon waren {ua5_rabatt_f} Formel-, {ua5_rabatt_n} Werte- & {ua5_rabatt_style} Stylefehler!")

    print(f"In Unteraufgabe 6 (Artikelliste wurden): {ua6} Fehler gemacht!")
    print(f"Davon waren {ua6_f} Formel-, {ua6_n} Werte- & {ua6_style} Stylefehler!")

    print(f"In Unteraufgabe 7 (Studentenbudget) wurden: {ua7} Fehler gemacht!")
    print(f"Davon waren {ua7_f} Formel-, {ua7_n} Werte- & {ua7_style} Stylefehler!")

    print(f"In Unteraufgabe 8 (Abstatzliste) wurden: {ua8} Fehler gemacht!")
    print(f"Davon waren {ua8_f} Formel-, {ua8_n} Werte- & {ua8_style} Stylefehler!")

    print(f"In Unteraufgabe 9.1 (Umstatzliste) wurden: {ua9_1_u} Fehler gemacht!")
    print(f"Davon waren {ua9_1_u_f} Formel-, {ua9_1_u_n} Werte- & {ua9_1_u_style} Stylefehler!")

    print(f"In Unteraufgabe 9.1 (Absatzdiagramm) wurden: {ua9_1_a} Fehler gemacht!")
    # print(f"Davon waren {} Formel-, {} Werte- & {} Stylefehler!")

    print(f"In Unteraufgabe 9.2 (Quartalsumsätze) wurden: {ua9_2} Fehler gemacht!")
    # print(f"Davon waren {} Formel-, {} Werte- & {} Stylefehler!")

    print(f"Es wurden {sheet_error} Abgaben nicht ausgewertet!")