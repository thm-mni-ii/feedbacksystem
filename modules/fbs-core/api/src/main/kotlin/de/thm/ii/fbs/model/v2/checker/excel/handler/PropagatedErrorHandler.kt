package de.thm.ii.fbs.model.v2.checker.excel.handler

import de.thm.ii.fbs.model.v2.checker.excel.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.model.v2.checker.excel.result.AnalysisResult
import de.thm.ii.fbs.utils.v2.handler.Handle
import de.thm.ii.fbs.utils.v2.handler.When

@Handle(When.ONPERROR)
class PropagatedErrorHandler(result: AnalysisResult) : ResultHandler(result) {
    override fun handle(input: ErrorAnalysisContext) {
        result.addCellResult(input.submissionCell!!, input.solutionCell!!, true)
    }
}
