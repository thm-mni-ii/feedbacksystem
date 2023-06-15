package de.thm.ii.fbs.utils.v2.spreadsheet

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetTestUtils.Companion.workbook
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.getCell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.getRow
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.getSheet
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows

class SpreadsheetUtilsTest {
    private val sheet = 0
    private val row = 0
    private val col = 0
    lateinit var workbook: XSSFWorkbook

    @Before
    fun initWorkbook() {
        workbook = workbook(Cell(sheet, "A1"))
    }

    @Test
    fun getSheetTest() {
        // test existing sheet
        assertEquals(workbook.getSheetAt(sheet), getSheet(workbook, sheet))
        assert(workbook.numberOfSheets == sheet + 1)
        // test if sheets get created if not existing
        val j = sheet + 4
        assertThrows<IllegalArgumentException> { workbook.getSheetAt(j) }
        assertDoesNotThrow { getSheet(workbook, j) }
        assertEquals(workbook.getSheetAt(j), getSheet(workbook, j))
        assert(workbook.numberOfSheets == j + 1)
    }

    @Test
    fun getRowTest() {
        // test existing row
        val rowSheet = workbook.getSheetAt(sheet)
        val expected = rowSheet.getRow(row)
        assert(expected !== null)
        assertEquals(expected, getRow(workbook, sheet, row))
        assert(rowSheet.lastRowNum == row)
        // test if row gets created if not existing
        val j = row + 3
        assert(rowSheet.getRow(j) == null)
        getRow(workbook, sheet, j)
        assert(rowSheet.lastRowNum == j)
        assert(rowSheet.getRow(j) !== null)
    }

    @Test
    fun getCellTest() {
        // test existing cell
        val cellRow = workbook.getSheetAt(sheet).getRow(row)
        assertEquals(cellRow.getCell(col), getCell(workbook, sheet, row, col))
        assert(cellRow.lastCellNum.toInt() == col + 1)
        // test if cell gets created as blank cell
        val j = col + 5
        assert(cellRow.getCell(j) == null)
        val actual = getCell(workbook, sheet, row, j)
        assert(actual.cellType == CellType.BLANK)
        // test if created cell is now part of the spreadsheet
        assertEquals(actual, cellRow.getCell(j))
    }
}
