@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.handler.ErrorHandler
import de.thm.ii.fbs.model.v2.checker.excel.handler.PropagatedErrorHandler
import de.thm.ii.fbs.model.v2.checker.excel.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.model.v2.checker.excel.result.AnalysisResult
import de.thm.ii.fbs.services.v2.handler.HandlerService
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetTestUtils
import org.junit.Before
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

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
            ErrorAnalysisServiceTest.BasicTestCase.sGraph,
            ErrorAnalysisServiceTest.BasicTestCase.sMap,
            handlerService
        )
        service.findAllErrors(listOf(c1))

        assertEquals(setOf(c1), result.getErrorCells())
        assertEquals(setOf<Cell>(), result.getPropagatedErrorCells())
    }

    @Test
    fun notPropagatedErrorsTest() {
        val a1 = ErrorAnalysisServiceTest.SimpleTestCase2.a1
        val b1 = ErrorAnalysisServiceTest.SimpleTestCase2.b1
        val c1 = Cell(0, "C1", formula = "D1 + E1 - 1")
        val d1 = ErrorAnalysisServiceTest.SimpleTestCase2.d1
        val e1 = ErrorAnalysisServiceTest.SimpleTestCase2.e1
        val b2 = ErrorAnalysisServiceTest.SimpleTestCase2.b2
        val b3 = ErrorAnalysisServiceTest.SimpleTestCase2.b3

        val service =
            ErrorAnalysisService(
                SpreadsheetTestUtils.workbook(a1, b1, c1, d1, e1, b2, b3),
                ErrorAnalysisServiceTest.SimpleTestCase.sGraph,
                ErrorAnalysisServiceTest.SimpleTestCase.sMap,
                handlerService
            )
        service.findAllErrors(listOf(a1))

        assertEquals(setOf(c1), result.getErrorCells())
        assertEquals(setOf(a1), result.getPropagatedErrorCells())
        assertEquals(setOf(c1, a1), result.getAllErrorCells())
    }
}
