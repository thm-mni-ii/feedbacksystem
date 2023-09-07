package de.thm.ii.fbs.utils.v2.spreadsheet

import org.apache.poi.ss.usermodel.Cell
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.usermodel.FormulaEvaluator
import org.apache.poi.ss.usermodel.Workbook

class SpreadsheetEvaluator(private val workbook: Workbook) {
    val evaluator: FormulaEvaluator = workbook.creationHelper.createFormulaEvaluator()


    fun evaluateAll() {
        for (sheet in workbook.sheetIterator()) {
            for (row in sheet.rowIterator()) {
                for (cell in row.cellIterator()) {
                    if (cell.cellType == CellType.FORMULA) {
                        evaluateFormulaCell(cell)
                    }
                }
            }
        }
    }

    fun evaluateFormulaCell(cell: Cell) {
        try {
            evaluator.evaluateFormulaCell(cell)
        } catch (e: Exception) {
            // Ignore Evaluation errors
        }
    }

    fun notifyUpdateCell(cell: Cell) {
        evaluator.notifyUpdateCell(cell)
    }
}
