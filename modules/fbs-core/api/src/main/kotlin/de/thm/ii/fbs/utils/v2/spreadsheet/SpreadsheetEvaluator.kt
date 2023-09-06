package de.thm.ii.fbs.utils.v2.spreadsheet

import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.usermodel.FormulaEvaluator
import org.apache.poi.ss.usermodel.Workbook
import org.slf4j.LoggerFactory

class SpreadsheetEvaluator {
    companion object {
        private val logger = LoggerFactory.getLogger(SpreadsheetEvaluator::class.java)

        fun evaluateAll(workbook: Workbook, evaluator: FormulaEvaluator) {
            for (sheet in workbook.sheetIterator()) {
                for (row in sheet.rowIterator()) {
                    for (cell in row.cellIterator()) {
                        if (cell.cellType == CellType.FORMULA) {
                            try {
                                evaluator.evaluateFormulaCell(cell)
                            } catch (e: Exception) {
                                // Ignore Evaluation errors
                            }
                        }
                    }
                }
            }
        }
    }
}
