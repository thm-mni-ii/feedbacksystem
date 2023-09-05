package de.thm.ii.fbs.model.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.result.CellResult
import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

class CellResultTest {

    @Test
    fun feedbackTest() {
        val cr = CellResult(Cell(0, "A1"))
        val f1 = "The value of this cell is wrong.\n"
        val f2 = "Please try again."

        cr.addFeedback(f1)
        assertEquals(f1, cr.getFeedback().toString())

        cr.addFeedback(f2)
        assertEquals(f1 + f2, cr.getFeedback().toString())
    }

    @Test
    fun isPropagatedTest() {
        assert(!CellResult(Cell(0, "A1")).isPropagated)
        assert(!CellResult(Cell(0, "A1"), false).isPropagated)
        assert(CellResult(Cell(0, "A1"), true).isPropagated)
    }
}
