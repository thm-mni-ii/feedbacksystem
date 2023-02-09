package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.handler.ErrorHandler
import de.thm.ii.fbs.handler.PropagatedErrorHandler
import de.thm.ii.fbs.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.model.v2.checker.excel.AnalysisResult
import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.services.v2.handler.HandlerService
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetTestUtils
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions

class AnalysisResultHandlerTest {
    private lateinit var result: AnalysisResult
    private lateinit var handlerService: HandlerService<ErrorAnalysisContext, Unit>

    @Before
    fun resetResult() {
      result = AnalysisResult()
      handlerService = HandlerService(ErrorHandler(result), PropagatedErrorHandler(result))
    }

    @Test
    fun originalErrorTest() {
        val c1 = Cell(0, "A1", formula = "B1")
        val c2 = ErrorAnalysisServiceTest.BasicTestCase.c2
        val c3 = ErrorAnalysisServiceTest.BasicTestCase.c3

        val service = ErrorAnalysisService(
            SpreadsheetTestUtils.workbook(c1, c2, c3),
            ErrorAnalysisServiceTest.BasicTestCase.sGraph, ErrorAnalysisServiceTest.BasicTestCase.sMap,
            handlerService
        )
        service.findAllErrors(listOf(c1))

        Assertions.assertEquals(setOf(c1), result.getErrorCells())
        Assertions.assertEquals(setOf<Cell>(), result.getPropagatedErrorCells())
    }

    @Test
    fun manyPropagatedErrorsTest2() {
        val c1 = ErrorAnalysisServiceTest.ComplexTestCase.c1
        val c2 = ErrorAnalysisServiceTest.ComplexTestCase.c2
        val c3 = ErrorAnalysisServiceTest.ComplexTestCase.c3
        val c4 = Cell(0, "D1", "5")
        val c5 = ErrorAnalysisServiceTest.ComplexTestCase.c5
        val c6 = ErrorAnalysisServiceTest.ComplexTestCase.c6
        val c7 = ErrorAnalysisServiceTest.ComplexTestCase.c7
        val c8 = ErrorAnalysisServiceTest.ComplexTestCase.c8
        val c9 = ErrorAnalysisServiceTest.ComplexTestCase.c9
        val c10 =  Cell(0, "D4", "6")

        val service =
            ErrorAnalysisService(
                SpreadsheetTestUtils.workbook(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10),
                ErrorAnalysisServiceTest.ComplexTestCase.sGraph,
                ErrorAnalysisServiceTest.ComplexTestCase.sMap,
                        handlerService
            )
        service.findAllErrors(listOf(c1))

        Assertions.assertEquals(setOf(c4, c10), result.getErrorCells())
        Assertions.assertEquals(setOf(c1, c2, c3, c7), result.getPropagatedErrorCells())
        Assertions.assertEquals(setOf(c1, c2, c3, c7, c4, c10), result.getAllErrorCells())
    }
}