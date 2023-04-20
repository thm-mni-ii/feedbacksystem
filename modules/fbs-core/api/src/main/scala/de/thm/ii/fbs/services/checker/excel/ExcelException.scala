package de.thm.ii.fbs.services.checker.excel

class ExcelCheckerException(message: String = "") extends RuntimeException(message)

class ExcelSheetNotFoundException(sheetIdx: Int) extends ExcelCheckerException(f"Das Tabellenblatt mit dem Index '$sheetIdx' wurde nicht gefunden!")