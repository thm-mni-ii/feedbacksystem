package de.thm.ii.fbs.utils.v2.spreadsheet

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.setValueOfCell
import org.apache.poi.ss.util.CellReference
import org.apache.poi.xssf.usermodel.XSSFWorkbook

class SpreadsheetTestUtils {
    companion object {
        private fun sheet(workbook: XSSFWorkbook, cells: Collection<Cell>, name: String? = "test") {
            val sheet = workbook.getSheet(name) ?: workbook.createSheet(name)
            for (cellInfo in cells) {
                val ref = CellReference(cellInfo.cell)
                val row = sheet.getRow(ref.row) ?: sheet.createRow(ref.row)
                val cell = row.createCell(ref.col.toInt())
                cellInfo.formula?.let { cell.cellFormula = cellInfo.formula }
                    ?: cellInfo.value?.let { setValueOfCell(cell, cellInfo.value!!) }
            }
        }

        fun workbookWithSheets(sheets: List<Collection<Cell>>): XSSFWorkbook {
            val book = XSSFWorkbook()
            sheets.forEachIndexed { i, cells -> sheet(book, cells, "test$i") }
            return book
        }

        fun workbook(vararg sheet: Cell): XSSFWorkbook {
            val book = XSSFWorkbook()
            sheet(book, sheet.asList())
            return book
        }

        fun solutionMap(cells: Collection<Cell>): Map<Cell, String> {
            val sMap = HashMap<Cell, String>()
            cells.forEach { cell -> sMap[cell] = cell.value!! }
            return sMap
        }
    }
}