import os
from pathlib import Path
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

class Subtask:
    def __init__(self, sum=0, formula=0, number=0, format=0):
        self.sum = sum
        self.formula = formula
        self.number = number
        self.format = format

    def classify_error(self, start_row, end_row, start_col, end_col, wb, wb2, wb_sol, wb_sol2, j): 
            ws = wb.worksheets[j]
            ws_sol = wb_sol.worksheets[j]
            ws2 = wb2.worksheets[j]
            ws_sol2 = wb_sol2.worksheets[j]
            for row in range(start_row, end_row):
                for col in range(start_col, end_col):
                    char = get_column_letter(col)
                    if ws[char + str(row)].value != ws_sol[char + str(row)].value:
                        if ws_sol[char + str(row)].value != ws_sol2[char + str(row)].value:
                            self.sum += 1
                            self.formula += 1
                        if ws_sol[char + str(row)].value == ws_sol2[char + str(row)].value and ws2[char + str(row)].value != ws_sol2[char + str(row)].value:
                            self.sum += 1
                            self.number += 1
                    if ws[char + str(row)].font != ws_sol[char + str(row)].font:
                        self.sum += 1
                        self.format += 1
                    j += 1
            
            return self.sum, self.formula, self.number, self.format
        



def analyze(path, path_sol):
    res = []
    path = Path(path)
    path_sol = Path(path_sol)
    file_count = 0
    total_sum = total_formula = total_number = total_format = 0
   
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
        if len(wb.worksheets) <= len(wb_sol.worksheets):
            j = 1
            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask2_1 = Subtask() # GuV 01
                subtask2_1.classify_error(1, 34, 2, 16, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask2_1)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask2_2 = Subtask() #GuV 02
                subtask2_2.classify_error(1, 37, 2, 16, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask2_2)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask3 = Subtask() # Bilanzaufstellung
                subtask3.classify_error(1, 57, 2, 5, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask3)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):    
                subtask3_anlage = Subtask() # Bilanzaufstellung (Anlage)
                subtask3_anlage.classify_error(1, 89, 1, 3, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask3_anlage)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask4 = Subtask() # Notenliste
                subtask4.classify_error(1, 202, 1, 6, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask4)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask4_skala = Subtask() # Notenliste (Skala)
                subtask4_skala.classify_error(1, 37, 1, 6, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask4_skala)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):    
                subtask5 = Subtask() # Rechnung
                subtask5.classify_error(1, 48, 1, 8, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask5)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask5_rabatt = Subtask() # Rabattstaffel
                subtask5_rabatt.classify_error(1, 10, 1, 5, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask5_rabatt)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask6 = Subtask() # Artikelliste
                subtask6.classify_error(1, 2323, 11, 13, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask6)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask7 = Subtask() # Studentenbudget
                subtask7.classify_error(1, 27, 1, 8, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask7)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask8 = Subtask() # Absatzliste
                # subtask8.classify_error(1, 37, 2, 16, ws, ws2, ws_sol, ws_sol2, j)
                # res.append(subtask8)
                # Only graph to compare, table was given
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask9_1u = Subtask() # Umsatzliste (graphcomparison not added)
                subtask9_1u.classify_error(1, 41, 5, 12, wb, wb2, wb_sol, wb_sol2, j)
                res.append(subtask9_1u)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask9_1a = Subtask() # Absatzdiagramm (only graph to compare)
                # subtask9_1a.classify_error(1, 57, 2, 5, ws, ws2, ws_sol, ws_sol2, j)
                # res.append(subtask9_1a)
                j += 1

            if (j < len(wb.worksheets) and j < len(wb_sol.worksheets)):
                subtask9_2 = Subtask() # Quartalsumsätze (only graph to compare)
                # subtask9_2.classify_error(1, 57, 2, 5, ws, ws2, ws_sol, ws_sol2, j)
                # res.append(subtask9_2)
                j += 1
        
        else:
            print("Studentenabgabe hat zu viele Sheets!")


    for entry in res:
        total_sum += entry.sum
        total_formula += entry.formula
        total_number += entry.number
        total_format += entry.format


    print(f"In allen Abgaben wurden insgesamt {total_sum} Fehler gemacht!") 
    print(f"Davon waren {total_formula} Formel-, {total_number} Nummern- & {total_format} Formatfehler!")
