package de.thm.ii.fbs.utils.v2.spreadsheet

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetTestUtils.Companion.workbook
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.setValueOfCell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.valueByCellRef
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.valueOfCell
import org.apache.poi.ss.usermodel.CellType
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.Test

class SpreadsheetValueParserTest {

    @Test
    fun testValueByCellRef() {
        val refValue = "123"
        val workbook = workbook(Cell(0, "A1", refValue))
        assertEquals(valueByCellRef(workbook.getSheetAt(0), "A1"), refValue)
    }

    @Test
    fun testValueOfCell() {
        val workbook = workbook(Cell(0, "A1", "123"), Cell(0, "B1", formula = "A1 + 1"), Cell(0, "C1", "Test"))
        workbook.creationHelper.createFormulaEvaluator().evaluateAll() // evaluate values of cells (using formulas)
        assertEquals("123", valueOfCell(workbook.getSheetAt(0).getRow(0).getCell(0)))
        assertEquals("124", valueOfCell(workbook.getSheetAt(0).getRow(0).getCell(1)))
        assertEquals("Test", valueOfCell(workbook.getSheetAt(0).getRow(0).getCell(2)))

    }

    @Test
    fun testSetValueOfCell() {
        val workbook = workbook(Cell(0, "A1"), Cell(0, "B1"), Cell(0, "C1"))

        val a1 = workbook.getSheetAt(0).getRow(0).getCell(0)
        setValueOfCell(a1, "123.4")
        assertEquals(CellType.NUMERIC, a1.cellType)
        assertEquals(123.4, a1.numericCellValue)

        val b1 = workbook.getSheetAt(0).getRow(0).getCell(1)
        setValueOfCell(b1, "true")
        assertEquals(CellType.BOOLEAN, b1.cellType)
        assertEquals(true, b1.booleanCellValue)

        val c1 = workbook.getSheetAt(0).getRow(0).getCell(2)
        setValueOfCell(c1, "Test 123")
        assertEquals(CellType.STRING, c1.cellType)
        assertEquals("Test 123", c1.stringCellValue)
    }
}