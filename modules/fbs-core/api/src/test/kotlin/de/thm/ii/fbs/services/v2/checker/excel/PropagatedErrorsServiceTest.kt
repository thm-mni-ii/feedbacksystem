package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetTestUtils.Companion.solutionMap
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetTestUtils.Companion.workbook
import org.junit.Test
import org.junit.jupiter.api.Assertions.*

class PropagatedErrorsServiceTest {
    @Test
    fun originalErrorTest() {
        val sc1 = Cell(0, "A1", "3")
        val sc2 = Cell(0, "B1", "1")
        val sc3 = Cell(0, "C1", "2")

        val sGraph = ReferenceGraph(
            mapOf(
                0 to mapOf(
                    sc1.cell to Pair(sc1.value!!, setOf(sc2, sc3)),
                    sc2.cell to Pair(sc2.value!!, setOf()),
                    sc3.cell to Pair(sc3.value!!, setOf())
                )
            )
        )


        val c1 = Cell(0, "A1", "1", "B1")
        val c2 = Cell(0, "B1", "1")
        val c3 = Cell(0, "C1", "2")

        val service = PropagatedErrorsService(workbook(c1, c2, c3), sGraph, solutionMap(listOf(sc1, sc2, sc3)))
        val res = service.findAllPropagatedErrors(listOf(c1))

        assertEquals(setOf(c1), res)
    }

    @Test
    fun propagatedErrorTest() {
        val sc1 = Cell(0, "A1", "3")
        val sc2 = Cell(0, "B1", "1")
        val sc3 = Cell(0, "C1", "2")
        val sc4 = Cell(0, "D1", "1")
        val sc5 = Cell(0, "E1", "1")

        val sGraph = ReferenceGraph(
            mapOf(
                0 to mapOf(
                    sc1.cell to Pair(sc1.value!!, setOf(sc2, sc3)),
                    sc2.cell to Pair(sc2.value!!, setOf()),
                    sc3.cell to Pair(sc3.value!!, setOf(sc4, sc5)),
                    sc4.cell to Pair(sc4.value!!, setOf()),
                    sc5.cell to Pair(sc5.value!!, setOf())
                )
            )
        )

        val c1 = Cell(0, "A1", "2", "B1 + C1")
        val c2 = Cell(0, "B1", "1")
        val c3 = Cell(0, "C1", "1", "D1 + E1 - 1")
        val c4 = Cell(0, "D1", "1")
        val c5 = Cell(0, "E1", "1")

        val service =
            PropagatedErrorsService(workbook(c1, c2, c3, c4, c5), sGraph, solutionMap(listOf(sc1, sc2, sc3, sc4, sc5)))
        val res = service.findAllPropagatedErrors(listOf(c1))

        assertEquals(setOf(c3), res)
    }

    @Test
    fun noErrorTest() {
        val sc1 = Cell(0, "A1", "3")
        val sc2 = Cell(0, "B1", "1")
        val sc3 = Cell(0, "C1", "2")
        val sc4 = Cell(0, "D1", "1")
        val sc5 = Cell(0, "E1", "1")

        val sGraph = ReferenceGraph(
            mapOf(
                0 to mapOf(
                    sc1.cell to Pair(sc1.value!!, setOf(sc2, sc3)),
                    sc2.cell to Pair(sc2.value!!, setOf()),
                    sc3.cell to Pair(sc3.value!!, setOf(sc4, sc5)),
                    sc4.cell to Pair(sc4.value!!, setOf()),
                    sc5.cell to Pair(sc5.value!!, setOf())
                )
            )
        )

        val c1 = Cell(0, "A1", "3", "B1 + C1")
        val c2 = Cell(0, "B1", "1")
        val c3 = Cell(0, "C1", "2", "D1 + E1")
        val c4 = Cell(0, "D1", "1")
        val c5 = Cell(0, "E1", "1")

        val service =
            PropagatedErrorsService(workbook(c1, c2, c3, c4, c5), sGraph, solutionMap(listOf(sc1, sc2, sc3, sc4, sc5)))
        val res = service.findAllPropagatedErrors(listOf(c1))

        assertEquals(setOf<Cell>(), res)
    }
}