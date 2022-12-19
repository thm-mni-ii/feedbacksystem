package de.thm.ii.fbs.utils.v2.spreadsheet

import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.util.CellRangeAddress
import org.apache.poi.xssf.usermodel.XSSFWorkbook

class SpreadsheetReferenceParser(workbook: XSSFWorkbook) {
    companion object {
        private val cellStringsRegex = "\"[^\"]*\"".toRegex()
        private val cellRefsRegex = "$?[A-Z]+\$?[1-9][0-9]*".toRegex()
        private val rangeRefsRegex = "(\$?[A-Z]+\$?[1-9][0-9]*\\s*:\\s*\$?[A-Z]+\$?[1-9][0-9]*)".toRegex()
    }

    val references: Map<Int, Map<String, Set<String>>>


    init {
        val refs: MutableMap<Int, Map<String, Set<String>>> = HashMap()
        for (sheet in workbook.sheetIterator()) {
            val sheetRefs: MutableMap<String, Set<String>> = HashMap()
            for (row in sheet.rowIterator()) {
                for (cell in row.cellIterator()) {
                    if (cell.cellType == CellType.FORMULA) {
                        sheetRefs[cell.address.formatAsString()] = getCells(cell.cellFormula)
                    }
                }
            }
            refs[workbook.getSheetIndex(sheet)] = sheetRefs.toMap()
        }
        references = refs.toMap()
    }

    private fun getCells(orgFormula: String): MutableSet<String> {
        // TODO do the regex' work in any case?
        val formula: String = orgFormula.replace(cellStringsRegex, "")
        val cellRefs: MutableSet<String> =
            cellRefsRegex.findAll(formula).map { mr -> mr.value }.toMutableSet()
        rangeRefsRegex.findAll(formula)
            .forEach { mr -> getRangeCells(mr.value, cellRefs) }
        return cellRefs
    }

    private fun getRangeCells(range: String, cellRefs: MutableSet<String>) {
        CellRangeAddress.valueOf(range).forEach { cell -> cellRefs.add(cell.toString()) }
    }
}