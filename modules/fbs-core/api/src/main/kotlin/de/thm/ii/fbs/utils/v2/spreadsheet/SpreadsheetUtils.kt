package de.thm.ii.fbs.utils.v2.spreadsheet

import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.valueOfCell
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.usermodel.Row
import org.apache.poi.ss.util.CellRangeAddress
import org.apache.poi.ss.util.CellReference
import org.apache.poi.xssf.usermodel.XSSFCell
import org.apache.poi.xssf.usermodel.XSSFRow
import org.apache.poi.xssf.usermodel.XSSFSheet
import org.apache.poi.xssf.usermodel.XSSFWorkbook

class SpreadsheetUtils {
    companion object {
        /**
         * Get an indexed sheet from a workbook and create as many sheets as needed if the indexed sheet doesn't exist yet.
         *
         * @param workbook The workbook that the sheet is part of
         * @param sheet The 0-based index of the sheet
         * @return The sheet at the given index
         */
        fun getSheet(workbook: XSSFWorkbook, sheet: Int): XSSFSheet {
            return try {
                workbook.getSheetAt(sheet)
            } catch (e: IllegalArgumentException) {
                for (i in workbook.numberOfSheets..sheet) {
                    workbook.createSheet()
                }
                workbook.getSheetAt(sheet)
            }
        }

        /**
         * Get a row from a sheet and create it if the row doesn't exist yet.
         *
         * @param workbook The workbook that the row is part of
         * @param sheet The 0-based index of the sheet
         * @param row The 0-based index of the row
         * @return The row at the given index
         */
        fun getRow(workbook: XSSFWorkbook, sheet: Int, row: Int): XSSFRow =
            getSheet(workbook, sheet).let { it.getRow(row) ?: it.createRow(row) }

        /**
         * Get a cell from a row and create it as a blank cell if it doesn't exist yet.
         *
         * @param workbook The workbook that the row is part of
         * @param sheet The 0-based index of the sheet
         * @param row The 0-based index of the row
         * @param col The 0-based index of the column
         * @return The cell at the given index
         */
        fun getCell(workbook: XSSFWorkbook, sheet: Int, row: Int, col: Int): XSSFCell =
            getRow(workbook, sheet, row).getCell(col, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK)

        fun rangeToCells(range: String): CellRangeAddress = CellRangeAddress.valueOf(range)

        fun formulaByCellRef(sheet: XSSFSheet, ref: String): String {
            val cellRef = CellReference(ref)
            val cell = sheet.getRow(cellRef.row)?.getCell(cellRef.col.toInt())

            return formulaOfCell(cell)
        }

        fun formulaOfCell(cell: XSSFCell?): String {
            return when (cell?.cellType) {
                CellType.FORMULA -> cell.cellFormula.toString()
                else -> valueOfCell(cell)
            }
        }

        fun sheetIdxOfCell(cell: XSSFCell): Int {
            return cell.sheet.workbook.getSheetIndex(cell.sheet)
        }
    }
}
