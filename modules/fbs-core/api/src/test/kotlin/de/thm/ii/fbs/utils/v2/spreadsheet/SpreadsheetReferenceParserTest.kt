package de.thm.ii.fbs.utils.v2.spreadsheet

import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.junit.Assert
import org.junit.Test

class SpreadsheetReferenceParserTest {
    private fun createTestSheet(formular: String): XSSFWorkbook {
        val book = XSSFWorkbook()
        book.createSheet("test")
        val sheet = book.getSheet("test")
        val row = sheet.createRow(0)
        val cell = row.createCell(0)
        cell.cellFormula = formular
        return book
    }

    @Test
    fun testGetCells() {
        val references = SpreadsheetReferenceParser(createTestSheet("A1 + B1"))
        val expected = mapOf((0 to mapOf("A1" to setOf("A1", "B1"))))
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetRangeCells() {
        val references = SpreadsheetReferenceParser(createTestSheet("SUM(A1:B2)"))
        val expected = mapOf((0 to mapOf("A1" to setOf("A1", "B2", "B1", "A2"))))
        Assert.assertEquals(expected, references.references)
    }

    // TODO: Add more tests
}