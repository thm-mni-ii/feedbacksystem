package de.thm.ii.fbs.handler

import de.thm.ii.fbs.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.model.v2.checker.excel.AnalysisResult
import de.thm.ii.fbs.utils.v2.handler.Handle
import de.thm.ii.fbs.utils.v2.handler.When

@Handle(When.ONERROR)
class ErrorHandler(result: AnalysisResult) : ResultHandler(result) {
    override fun handle(input: ErrorAnalysisContext) {
        result.addCellResult(input.currentCell!!, false)
    }
}