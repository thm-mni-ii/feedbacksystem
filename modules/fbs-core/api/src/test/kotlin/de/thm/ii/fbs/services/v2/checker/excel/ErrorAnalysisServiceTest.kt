@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetTestUtils.Companion.solutionMap
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetTestUtils.Companion.workbook
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

class ErrorAnalysisServiceTest {
    @Test
    fun originalErrorTest() {
        val c1 = Cell(0, "A1", formula = "B1")
        val c2 = BasicTestCase.c2
        val c3 = BasicTestCase.c3

        val service = ErrorAnalysisService(workbook(c1, c2, c3), BasicTestCase.sGraph, BasicTestCase.sMap)
        val res = service.findAllErrors(listOf(c1))

        assertEquals(setOf(c1), res)
    }

    @Test
    fun noErrorTest() {
        val c1 = Cell(0, "A1", formula = "SUM(B1:C1)")
        val c2 = BasicTestCase.c2
        val c3 = BasicTestCase.c3

        val service = ErrorAnalysisService(workbook(c1, c2, c3), BasicTestCase.sGraph, BasicTestCase.sMap)
        val res = service.findAllErrors(listOf(c1))

        assertEquals(setOf<Cell>(), res)
    }

    @Test
    fun propagatedErrorTest() {
        val c1 = Cell(0, "A1", formula = "B1 + C1")
        val c2 = SimpleTestCase.c2
        val c3 = Cell(0, "C1", formula = "D1 + E1 - 1")
        val c4 = SimpleTestCase.c4
        val c5 = SimpleTestCase.c5

        val service =
            ErrorAnalysisService(workbook(c1, c2, c3, c4, c5), SimpleTestCase.sGraph, SimpleTestCase.sMap)
        val res = service.findAllErrors(listOf(c1))

        assertEquals(setOf(c3), res)
    }

    @Test
    fun noErrorTest2() {
        val service =
            ErrorAnalysisService(
                workbook(
                    SimpleTestCase.c1,
                    SimpleTestCase.c2,
                    SimpleTestCase.c3,
                    SimpleTestCase.c4,
                    SimpleTestCase.c5
                ),
                SimpleTestCase.sGraph,
                SimpleTestCase.sMap
            )
        val res = service.findAllErrors(listOf(SimpleTestCase.c1))

        assertEquals(setOf<Cell>(), res)
    }

    @Test
    fun manyPropagatedErrorsTest() {
        val c1 = ComplexTestCase.c1
        val c2 = Cell(0, "B1", formula = "SUM(B2:B3)")
        val c3 = Cell(0, "C1", formula = "D1 + E1 - 1")
        val c4 = ComplexTestCase.c4
        val c5 = ComplexTestCase.c5
        val c6 = ComplexTestCase.c6
        val c7 = Cell(0, "B3", formula = "D3 - D4 + 7")
        val c8 = ComplexTestCase.c8
        val c9 = ComplexTestCase.c9
        val c10 = Cell(0, "D4", formula = "1 + 2")

        val service =
            ErrorAnalysisService(
                workbook(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10),
                ComplexTestCase.sGraph,
                ComplexTestCase.sMap
            )
        val res = service.findAllErrors(listOf(c1))

        assertEquals(setOf(c2, c3, c7), res)
    }

    @Test
    fun manyPropagatedErrorsTest2() {
        val c1 = Cell(0, "A1", formula = "B1 + C1 + 2")
        val c2 = Cell(0, "B1", formula = "SUM(B2:B4)") // ComplexTestCase.c2
        val c3 = Cell(0, "C1", formula = "D1 + E1 - 1")
        val c4 = ComplexTestCase.c4
        val c5 = ComplexTestCase.c5
        val c6 = ComplexTestCase.c6
        val c7 = Cell(0, "B3", formula = "D3 - D4 + 7")
        val c8 = ComplexTestCase.c8
        val c9 = ComplexTestCase.c9
        val c10 = ComplexTestCase.c10

        val service =
            ErrorAnalysisService(
                workbook(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10),
                ComplexTestCase.sGraph,
                ComplexTestCase.sMap
            )
        val res = service.findAllErrors(listOf(c1))

        assertEquals(setOf(c1, c3, c7), res)
    }

    @Test
    fun sumTest() {
        val c1 = Cell(0, "A1", formula = "SUM(B1:D1)")
        val c2 = SumTestCase.c2
        val c3 = SumTestCase.c3
        val c4 = SumTestCase.c4
        val c5 = SumTestCase.c5

        val service =
            ErrorAnalysisService(workbook(c1, c2, c3, c4, c5), SumTestCase.sGraph, SumTestCase.sMap)
        val res = service.findAllErrors(listOf(c1))

        assertEquals(setOf(c1), res)
    }

    @Test
    fun multipleOutputTest() {
        val c3 = Cell(0, "C1", formula = "D1 - E1")
        val c8 = Cell(0, "A2", formula = "C1 + C2 - 2")

        val service = ErrorAnalysisService(
            workbook(
                MultipleOutputTestCase.c1,
                MultipleOutputTestCase.c2,
                c3,
                MultipleOutputTestCase.c4,
                MultipleOutputTestCase.c5,
                MultipleOutputTestCase.c6,
                MultipleOutputTestCase.c7,
                c8,
                MultipleOutputTestCase.c9
            ),
            MultipleOutputTestCase.sGraph,
            MultipleOutputTestCase.sMap
        )
        val res = service.findAllErrors(listOf(MultipleOutputTestCase.c1, c8))

        assertEquals(setOf(MultipleOutputTestCase.c3, c8), res)
    }

    @Test
    fun wrongInputTest() {
        val c2 = Cell(0, "B1", "2")

        val service = ErrorAnalysisService(
            workbook(BasicTestCase.c1, c2, BasicTestCase.c3),
            BasicTestCase.sGraph,
            BasicTestCase.sMap
        )
        val res = service.findAllErrors(listOf(BasicTestCase.c1))

        assertEquals(setOf(c2), res)
    }

    @Test
    fun nullCellsTest() {
        val service = ErrorAnalysisService(
            workbook(BasicTestCase.c2, BasicTestCase.c3),
            BasicTestCase.sGraph,
            BasicTestCase.sMap
        )
        val res = service.findAllErrors(listOf(BasicTestCase.c1))

        assertEquals(setOf(BasicTestCase.c1), res)
    }

    @Test
    fun nullCellsPropagatedTest() {
        val service = ErrorAnalysisService(
            workbook(BasicTestCase.c1, BasicTestCase.c3),
            BasicTestCase.sGraph,
            BasicTestCase.sMap
        )
        val res = service.findAllErrors(listOf(BasicTestCase.c1))

        assertEquals(setOf(BasicTestCase.c2), res)
    }

    @Test
    fun nullCellsRowAndSheetTest() {
        val c1 = Cell(0, "A1", "3", "A2 + A3")
        val c2 = Cell(0, "A2", "1")
        val c3 = Cell(0, "A3", "2")
        val c4 = Cell(1, "B4", "4")

        val sGraph = ReferenceGraph(
            mapOf(
                0 to mapOf(
                    c1 to setOf(c2, c3),
                    c2 to setOf(),
                    c3 to setOf()
                ),
                1 to mapOf(
                    c4 to setOf()
                )
            )
        )

        val sMap = solutionMap(c1, c2, c3, c4)

        val service = ErrorAnalysisService(
            workbook(c1, c2),
            sGraph,
            sMap
        )
        val res = service.findAllErrors(listOf(c1, c4))

        assertEquals(setOf(c3, c4), res)
    }

    @Test
    fun errorsInOneBranchTest() {
        val a1 = SimpleTestCase2.a1 // propagated error
        val b1 = SimpleTestCase2.b1
        val c1 = Cell(0, "C1", formula = "D1 - E1") // error
        val d1 = SimpleTestCase2.d1
        val e1 = SimpleTestCase2.e1
        val b2 = SimpleTestCase2.b2
        val b3 = SimpleTestCase2.b3

        val service =
            ErrorAnalysisService(
                workbook(a1, b1, c1, d1, e1, b2, b3),
                SimpleTestCase2.sGraph,
                SimpleTestCase2.sMap
            )
        service.findAllErrors(listOf(a1))

        assertEquals(setOf(c1), service.errors)
        assertEquals(setOf(a1), service.perrors)
    }

    class BasicTestCase {
        companion object {
            val c1 = Cell(0, "A1", "3", "B1 + C1")
            val c2 = Cell(0, "B1", "1")
            val c3 = Cell(0, "C1", "2")

            val sGraph = ReferenceGraph(
                mapOf(
                    0 to mapOf(
                        c1 to setOf(c2, c3),
                        c2 to setOf(),
                        c3 to setOf()
                    )
                )
            )

            val sMap = solutionMap(c1, c2, c3)
        }
    }

    class SimpleTestCase {
        companion object {
            val c1 = Cell(0, "A1", "3", "B1 + C1")
            val c2 = Cell(0, "B1", "1")
            val c3 = Cell(0, "C1", "2", "D1 + E1")
            val c4 = Cell(0, "D1", "1")
            val c5 = Cell(0, "E1", "1")

            val sGraph = ReferenceGraph(
                mapOf(
                    0 to mapOf(
                        c1 to setOf(c2, c3),
                        c2 to setOf(),
                        c3 to setOf(c4, c5),
                        c4 to setOf(),
                        c5 to setOf()
                    )
                )
            )

            val sMap = solutionMap(c1, c2, c3, c4, c5)
        }
    }

    class SimpleTestCase2 {
        companion object {
            val a1 = Cell(0, "A1", "3", "B1 + C1")
            val b1 = Cell(0, "B1", "1", "B2 + B3")
            val c1 = Cell(0, "C1", "2", "D1 + E1")
            val d1 = Cell(0, "D1", "1")
            val e1 = Cell(0, "E1", "1")
            val b2 = Cell(0, "B2", "-1")
            val b3 = Cell(0, "B3", "2")

            val sGraph = ReferenceGraph(
                mapOf(
                    0 to mapOf(
                        a1 to setOf(b1, c1),
                        b1 to setOf(b2, b3),
                        c1 to setOf(d1, e1),
                        d1 to setOf(),
                        e1 to setOf(),
                        b2 to setOf(),
                        b3 to setOf()
                    )
                )
            )

            val sMap = solutionMap(a1, b1, c1, d1, e1, b2, b3)
        }
    }

    class ComplexTestCase {
        companion object {
            val c1 = Cell(0, "A1", "13", "B1 + C1")
            val c2 = Cell(0, "B1", "11", "SUM(B2:B4)")
            val c3 = Cell(0, "C1", "2", "D1 + E1")
            val c4 = Cell(0, "D1", "1")
            val c5 = Cell(0, "E1", "1")
            val c6 = Cell(0, "B2", "1")
            val c7 = Cell(0, "B3", "9", "D3 - D4 + 5")
            val c8 = Cell(0, "B4", "1")
            val c9 = Cell(0, "D3", "7")
            val c10 = Cell(0, "D4", "3")

            val sGraph = ReferenceGraph(
                mapOf(
                    0 to mapOf(
                        c1 to setOf(c2, c3),
                        c2 to setOf(c6, c7, c8),
                        c3 to setOf(c4, c5),
                        c4 to setOf(),
                        c5 to setOf(),
                        c6 to setOf(),
                        c7 to setOf(c9, c10),
                        c8 to setOf(),
                        c9 to setOf(),
                        c10 to setOf()
                    )
                )
            )

            val sMap = solutionMap(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10)
        }
    }

    class SumTestCase {
        companion object {
            val c1 = Cell(0, "A1", "10", "SUM(B1:E1)")
            val c2 = Cell(0, "B1", "1")
            val c3 = Cell(0, "C1", "2")
            val c4 = Cell(0, "D1", "3")
            val c5 = Cell(0, "E1", "4")

            val sGraph = ReferenceGraph(
                mapOf(
                    0 to mapOf(
                        c1 to setOf(c2, c3, c4, c5),
                        c2 to setOf(),
                        c3 to setOf(),
                        c4 to setOf(),
                        c5 to setOf()
                    )
                )
            )

            val sMap = solutionMap(c1, c2, c3, c4, c5)
        }
    }

    class MultipleOutputTestCase {
        companion object {
            val c1 = Cell(0, "A1", "12", "B1 + C1")
            val c2 = Cell(0, "B1", "10", "SUM(B2:B3)")
            val c3 = Cell(0, "C1", "2", "D1 + E1")
            val c4 = Cell(0, "D1", "1")
            val c5 = Cell(0, "E1", "1")
            val c6 = Cell(0, "B2", "1")
            val c7 = Cell(0, "B3", "9")
            val c8 = Cell(0, "A2", "42", "C1 + C2")
            val c9 = Cell(0, "C2", "40")

            val sGraph = ReferenceGraph(
                mapOf(
                    0 to mapOf(
                        c1 to setOf(c2, c3),
                        c2 to setOf(c6, c7),
                        c3 to setOf(c4, c5),
                        c4 to setOf(),
                        c5 to setOf(),
                        c6 to setOf(),
                        c7 to setOf(),
                        c8 to setOf(c3, c9),
                        c9 to setOf()
                    )
                )
            )

            val sMap = solutionMap(c1, c2, c3, c4, c5, c6, c7, c8, c9)
        }
    }
}
