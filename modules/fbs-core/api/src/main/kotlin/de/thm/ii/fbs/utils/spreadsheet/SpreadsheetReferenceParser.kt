package de.thm.ii.fbs.utils.spreadsheet

import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.util.CellRangeAddress
import org.apache.poi.xssf.usermodel.XSSFWorkbook

class SpreadsheetReferenceParser(workbook: XSSFWorkbook) {
    val references: Map<String, Map<String, Set<String>>>


    init {
        val refs: MutableMap<String, Map<String, Set<String>>> = HashMap()
        for (sheet in workbook.sheetIterator()) {
            val sheetRefs: MutableMap<String, Set<String>> = HashMap()
            for (row in sheet.rowIterator()) {
                for (cell in row.cellIterator()) {
                    if (cell.cellType == CellType.FORMULA) {
                        sheetRefs[cell.toString()] = getCells(cell.cellFormula)
                    }
                }
            }
            refs[sheet.sheetName] = sheetRefs.toMap()
        }
        references = refs.toMap()
    }

    private fun getCells(orgFormula: String): MutableSet<String> {
        // TODO do the regex' work in any case?
        val formula: String = orgFormula.replace("\"[^\"]*\"".toRegex(), "")
        val cellRefs: MutableSet<String> =
            "$?[A-Z]+\$?[1-9][0-9]*".toRegex().findAll(formula).map { mr -> mr.value }.toMutableSet()
        "(\$?[A-Z]+\$?[1-9][0-9]*\\s*:\\s*\$?[A-Z]+\$?[1-9][0-9]*)".toRegex().findAll(formula)
            .forEach { mr -> getRangeCells(mr.value, cellRefs) }
        return cellRefs
    }

    private fun getRangeCells(range: String, cellRefs: MutableSet<String>) {
        CellRangeAddress.valueOf(range).forEach { cell -> cellRefs.add(cell.toString()) }
    }
}