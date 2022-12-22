package de.thm.ii.fbs.utils.v2.spreadsheet

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.usermodel.Sheet
import org.apache.poi.ss.util.CellRangeAddress
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import java.text.NumberFormat
import java.util.*
import kotlin.collections.HashMap
import org.apache.poi.xssf.usermodel.XSSFCell

class SpreadsheetReferenceParser(val workbook: XSSFWorkbook) {
    companion object {
        private val cellStringsRegex = "\"[^\"]*\"".toRegex()
        private val cellRefsRegex = "([A-Za-z0-9]+!)?$?[A-Z]+$?[1-9][0-9]*".toRegex()
        private val rangeRefsRegex =
                "(([A-Za-z0-9]+!)?\$?[A-Z]+\$?[1-9][0-9]*\\s*:\\s*([A-Za-z0-9]+!)?\$?[A-Z]+\$?[1-9][0-9]*)".toRegex()
        private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)

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
    }

    val references: Map<Int, Map<String, Pair<String, Set<Cell>>>>


    init {
        val refs: MutableMap<Int, Map<String, Pair<String, Set<Cell>>>> = HashMap()
        for (sheet in workbook.sheetIterator()) {
            val sheetRefs: MutableMap<String, Pair<String, Set<Cell>>> = HashMap()
            for (row in sheet.rowIterator()) {
                for (cell in row.cellIterator()) {
                    if (cell.cellType == CellType.FORMULA) {
                        sheetRefs[cell.address.formatAsString()] = Pair(valueOfCell(cell as XSSFCell), getCells(cell.cellFormula, sheet))
                    }
                }
            }
            refs[workbook.getSheetIndex(sheet)] = sheetRefs.toMap()
        }
        references = refs.toMap()
    }

    private fun getCells(orgFormula: String, sheet: Sheet): MutableSet<Cell> {
        // TODO do the regex' work in any case?
        var formula: String = orgFormula.replace(cellStringsRegex, "")
        val cellRefs = mutableSetOf<Cell>()
        formula = formula.replace(rangeRefsRegex) { mr -> getRangeCells(mr.value, cellRefs, sheet); "" }
        cellRefs += cellRefsRegex.findAll(formula).map { mr -> refToCell(mr.value, sheet.sheetName) }.toMutableSet()
        return cellRefs
    }

    private fun getRangeCells(range: String, cellRefs: MutableSet<Cell>, sheet: Sheet) {
        val (sheetName, _) = getRefAndSheet(cellRefsRegex.find(range)!!.value, sheet.sheetName)
        CellRangeAddress.valueOf(range).forEach { cell -> cellRefs.add(refToCell(cell.toString(), sheetName)) }
    }

    private fun refToCell(ref: String, sheet: String): Cell {
        val (sheetName, cellRef) = getRefAndSheet(ref, sheet)

        return Cell(workbook.getSheetIndex(sheetName), cellRef)
    }

    private fun getRefAndSheet(ref: String, defaultSheetName: String): Pair<String, String> {
        var sheetName = defaultSheetName
        var cellRef = ref

        // If the reference targets another sheet -> get and use the correct sheet name
        val externalReference = ref.split(Cell.SHEET_DELIMITER)
        if (externalReference.size == 2) {
            sheetName = externalReference[0]
            cellRef = externalReference[1]
        }

        return Pair(sheetName, cellRef)
    }
}
