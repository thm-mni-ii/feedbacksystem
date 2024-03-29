package de.thm.ii.fbs.utils.v2.spreadsheet

import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.util.CellReference
import org.apache.poi.xssf.usermodel.XSSFCell
import org.apache.poi.xssf.usermodel.XSSFSheet
import java.text.NumberFormat
import java.util.*

class SpreadsheetValueParser {
    companion object {
        private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)

        @JvmStatic
        fun valueByCellRef(sheet: XSSFSheet, ref: String): String {
            val cellRef = CellReference(ref)
            val cell = sheet.getRow(cellRef.row)?.getCell(cellRef.col.toInt())

            return valueOfCell(cell)
        }

        @JvmStatic
        fun valueOfCell(cell: XSSFCell?): String {
            if (cell == null) {
                return ""
            }

            return when (cell.cellType) {
                CellType.FORMULA -> try {
                    germanFormat.format(cell.numericCellValue)
                } catch (e: IllegalStateException) {
                    try {
                        cell.stringCellValue
                    } catch (e: IllegalStateException) {
                        throw RuntimeException("SpreadsheetException@" + cell.address.formatAsString() + ": " + cell.errorCellValue)
                    }
                }

                CellType.NUMERIC -> germanFormat.format(cell.numericCellValue)
                CellType.STRING -> cell.stringCellValue
                else -> ""
            }
        }

        fun setValueOfCell(cell: XSSFCell, value: String?) {
            if (value == null) {
                return cell.setBlank()
            }

            value.toDoubleOrNull()?.let {
                cell.setCellValue(it)
                cell.cellType = CellType.NUMERIC
            } ?: value.toBooleanStrictOrNull()?.let {
                cell.setCellValue(it)
                cell.cellType = CellType.BOOLEAN
            } ?: run {
                cell.setCellValue(value)
                cell.cellType = CellType.STRING
            }
        }
    }
}
