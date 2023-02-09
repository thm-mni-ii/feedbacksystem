package de.thm.ii.fbs.handler

import de.thm.ii.fbs.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.model.v2.checker.excel.AnalysisResult
import de.thm.ii.fbs.utils.v2.handler.Handle
import de.thm.ii.fbs.utils.v2.handler.When

@Handle(When.ONVISIT)
class SubtaskHandler(result: AnalysisResult) : ResultHandler(result) {
    override fun handle(input: ErrorAnalysisContext) {
        result.addCellToSubtask(-1, input.currentCell!!) // TODO get subtask id
    }
}