package de.thm.ii.fbs.utils.v2.spreadsheet

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.junit.Assert
import org.junit.Test

class SpreadsheetReferenceParserTest {
    private fun createTestSheet(workbook: XSSFWorkbook, sheetName: String, formular: String?) {
        workbook.createSheet(sheetName)
        val sheet = workbook.getSheet(sheetName)
        val row = sheet.createRow(0)
        val cell = row.createCell(0)
        formular?.let { cell.cellFormula = formular }
    }

    private fun createTestWorkbook(sheets: List<Pair<String, String?>>): XSSFWorkbook {
        val book = XSSFWorkbook()
        sheets.forEach { (sheet, formular) -> createTestSheet(book, sheet, formular) }
        return book
    }

    private fun createSingeTestWorkbook(formular: String): XSSFWorkbook {
        return createTestWorkbook(listOf(Pair("test", formular)))
    }

    private fun createTwoTestWorkbook(formular: String, formular2: String?): XSSFWorkbook {
        return createTestWorkbook(listOf(Pair("test", formular), Pair("test1", formular2)))
    }

    @Test
    fun testGetCells() {
        val references = SpreadsheetReferenceParser(createSingeTestWorkbook("A1 + B1"))
        val expected = mapOf((0 to mapOf("A1" to Pair("0", setOf(Cell(0, "A1"), Cell(0, "B1"))))))
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetRangeCells() {
        val references = SpreadsheetReferenceParser(createSingeTestWorkbook("SUM(A1:B2)"))
        val expected = mapOf((0 to mapOf("A1" to Pair("0", setOf(Cell(0, "A1"), Cell(0, "B2"), Cell(0, "B1"), Cell(0, "A2"))))))
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetAndRangeCells() {
        val references = SpreadsheetReferenceParser(createSingeTestWorkbook("A1 + B1 + SUM(A3:A5)"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A1"),
                    Cell(0, "B1"),
                    Cell(0, "A3"),
                    Cell(0, "A4"),
                    Cell(0, "A5")
                ))
            ))
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetAndRangeOverlapCells() {
        val references = SpreadsheetReferenceParser(createSingeTestWorkbook("A1 + B1 + SUM(A1:A5)"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A1"),
                    Cell(0, "B1"),
                    Cell(0, "A2"),
                    Cell(0, "A3"),
                    Cell(0, "A4"),
                    Cell(0, "A5")
                ))
            ))
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetCellsOtherSheet() {
        val references = SpreadsheetReferenceParser(createTwoTestWorkbook("test1!A1 + B1", null))
        val expected = mapOf((0 to mapOf("A1" to Pair("0", setOf(Cell(1, "A1"), Cell(0, "B1"))))), 1 to mapOf())
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetRangeCellsOtherSheet() {
        val references = SpreadsheetReferenceParser(createTwoTestWorkbook("SUM(test1!A1:test1!B2)", null))
        val expected =
            mapOf((0 to mapOf("A1" to Pair("0", setOf(Cell(1, "A1"), Cell(1, "B2"), Cell(1, "B1"), Cell(1, "A2"))))), 1 to mapOf())
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetRangeCellsOtherSheetOnlyFirstRef() {
        val references = SpreadsheetReferenceParser(createTwoTestWorkbook("SUM(test1!A1:B2)", null))
        val expected =
            mapOf((0 to mapOf("A1" to Pair("0", setOf(Cell(1, "A1"), Cell(1, "B2"), Cell(1, "B1"), Cell(1, "A2"))))), 1 to mapOf())
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetAndRangeCellsMultiSheet() {
        val references =
            SpreadsheetReferenceParser(createTwoTestWorkbook("A1 + test1!B1 + SUM(test1!A3:test1!A5)", null))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A1"),
                    Cell(1, "B1"),
                    Cell(1, "A3"),
                    Cell(1, "A4"),
                    Cell(1, "A5")
                ))
            )), 1 to mapOf()
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testGetAndRangeOverlapCellsMultiSheet() {
        val references =
            SpreadsheetReferenceParser(createTwoTestWorkbook("A1 + test1!B1 + SUM(test1!A1:test1!A5)", null))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A1"),
                    Cell(1, "B1"),
                    Cell(1, "A1"),
                    Cell(1, "A2"),
                    Cell(1, "A3"),
                    Cell(1, "A4"),
                    Cell(1, "A5")
                ))
            )), 1 to mapOf()
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testMultipleSheets() {
        val references = SpreadsheetReferenceParser(createTwoTestWorkbook("A1 + B1", "A1 + B1"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A1"),
                    Cell(0, "B1"),
                ))
            )), 1 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(1, "A1"),
                    Cell(1, "B1"),
                ))
            )
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testMultipleSheetsRange() {
        val references = SpreadsheetReferenceParser(createTwoTestWorkbook("SUM(A1:A3)", "A1 + B1"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A1"),
                    Cell(0, "A2"),
                    Cell(0, "A3"),
                ))
            )), 1 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(1, "A1"),
                    Cell(1, "B1"),
                ))
            )
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testFieldWithMultipleLetters() {
        val references =
            SpreadsheetReferenceParser(createSingeTestWorkbook("IJM2 + JQZ3"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "IJM2"),
                    Cell(0, "JQZ3"),
                ))
            ))
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testFieldWithHighNumber() {
        val references =
            SpreadsheetReferenceParser(createSingeTestWorkbook("A999999 + B999999"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A999999"),
                    Cell(0, "B999999"),
                ))
            ))
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testStringInFormular() {
        val references =
            SpreadsheetReferenceParser(createSingeTestWorkbook("A2&\" A1 B2 C2\""))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A2"),
                ))
            ))
        )
        Assert.assertEquals(expected, references.references)
    }

    @Test
    fun testLargeFormular() {
        val references =
            SpreadsheetReferenceParser(createSingeTestWorkbook("SUM(A1:A3) + SUM(A1:A3) + A3 - A56 * F39 / F1 + IJM2"))
        val expected = mapOf(
            (0 to mapOf(
                "A1" to Pair("0", setOf(
                    Cell(0, "A1"),
                    Cell(0, "A2"),
                    Cell(0, "A3"),
                    Cell(0, "A56"),
                    Cell(0, "F39"),
                    Cell(0, "F1"),
                    Cell(0, "IJM2")
                ))
            ))
        )
        Assert.assertEquals(expected, references.references)
    }
}
