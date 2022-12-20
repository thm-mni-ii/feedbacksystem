package de.thm.ii.fbs.utils.v2.spreadsheet

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.junit.Assert
import org.junit.Test

class SpreadsheetReferenceParserTest {
    private fun createTestSheet(formular: String, createSecondSheet: Boolean = false): XSSFWorkbook {
        val book = XSSFWorkbook()
        book.createSheet("test")
        val sheet = book.getSheet("test")
        val row = sheet.createRow(0)
        val cell = row.createCell(0)
        cell.cellFormula = formular

        if (createSecondSheet) book.createSheet("test1")
        return book
    }

    @Test
    fun testGetCells() {
        val references = SpreadsheetReferenceParser(createTestSheet("A1 + B1"))
        val expected = mapOf((0 to mapOf("A1" to setOf(Cell(0, "A1"), Cell(0, "B1")))))
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetRangeCells() {
        val references = SpreadsheetReferenceParser(createTestSheet("SUM(A1:B2)"))
        val expected = mapOf((0 to mapOf("A1" to setOf(Cell(0, "A1"), Cell(0, "B2"), Cell(0, "B1"), Cell(0, "A2")))))
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetAndRangeCells() {
        val references = SpreadsheetReferenceParser(createTestSheet("A1 + B1 + SUM(A3:A5)"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to setOf(
                    Cell(0, "A1"),
                    Cell(0, "B1"),
                    Cell(0, "A3"),
                    Cell(0, "A4"),
                    Cell(0, "A5")
                )
            ))
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetAndRangeOverlapCells() {
        val references = SpreadsheetReferenceParser(createTestSheet("A1 + B1 + SUM(A1:A5)"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to setOf(
                    Cell(0, "A1"),
                    Cell(0, "B1"),
                    Cell(0, "A2"),
                    Cell(0, "A3"),
                    Cell(0, "A4"),
                    Cell(0, "A5")
                )
            ))
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetCellsOtherSheet() {
        val references = SpreadsheetReferenceParser(createTestSheet("test1!A1 + B1", true))
        val expected = mapOf((0 to mapOf("A1" to setOf(Cell(1, "A1"), Cell(0, "B1")))), 1 to mapOf())
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetRangeCellsOtherSheet() {
        val references = SpreadsheetReferenceParser(createTestSheet("SUM(test1!A1:test1!B2)", true))
        val expected =
            mapOf((0 to mapOf("A1" to setOf(Cell(1, "A1"), Cell(1, "B2"), Cell(1, "B1"), Cell(1, "A2")))), 1 to mapOf())
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetRangeCellsOtherSheetOnlyFirstRef() {
        val references = SpreadsheetReferenceParser(createTestSheet("SUM(test1!A1:B2)", true))
        val expected =
            mapOf((0 to mapOf("A1" to setOf(Cell(1, "A1"), Cell(1, "B2"), Cell(1, "B1"), Cell(1, "A2")))), 1 to mapOf())
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetAndRangeCellsMultiSheet() {
        val references = SpreadsheetReferenceParser(createTestSheet("A1 + test1!B1 + SUM(test1!A3:test1!A5)", true))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to setOf(
                    Cell(0, "A1"),
                    Cell(1, "B1"),
                    Cell(1, "A3"),
                    Cell(1, "A4"),
                    Cell(1, "A5")
                )
            )), 1 to mapOf()
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetAndRangeOverlapCellsMultiSheet() {
        val references = SpreadsheetReferenceParser(createTestSheet("A1 + test1!B1 + SUM(test1!A1:test1!A5)", true))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to setOf(
                    Cell(0, "A1"),
                    Cell(1, "B1"),
                    Cell(1, "A1"),
                    Cell(1, "A2"),
                    Cell(1, "A3"),
                    Cell(1, "A4"),
                    Cell(1, "A5")
                )
            )), 1 to mapOf()
        )
        Assert.assertEquals(expected, references.references)
    }

    // TODO: Add more tests
}