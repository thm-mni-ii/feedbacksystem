package de.thm.ii.fbs.model.v2.checker.excel.handler.context

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import org.junit.Test

class ErrorAnalysisContextTest {

    @Test
    fun testAttributes() {
        val context = ErrorAnalysisContext(setOf(), setOf(), Cell(1, "A1"), Cell(1, "A1"))
        assert(context.errors.isEmpty())
        assert(context.perrors.isEmpty())
        assert(context.submissionCell != null)
        assert(context.submissionCell != null)
    }
}
