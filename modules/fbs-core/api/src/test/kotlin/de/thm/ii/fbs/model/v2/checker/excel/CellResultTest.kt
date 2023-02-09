package de.thm.ii.fbs.model.v2.checker.excel

import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

class CellResultTest {

    @Test
    fun feedbackTest() {
        val cr = CellResult()
        val f1 = "The value of this cell is wrong.\n"
        val f2 = "Please try again."

        cr.addFeedback(f1)
        assertEquals(f1, cr.getFeedback().toString())

        cr.addFeedback(f2)
        assertEquals(f1+f2, cr.getFeedback().toString())
    }

    @Test
    fun isPropagatedTest() {
        assert(!CellResult().isPropagated)
        assert(!CellResult(false).isPropagated)
        assert(CellResult(true).isPropagated)
    }
}