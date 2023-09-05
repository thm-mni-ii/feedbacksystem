package de.thm.ii.fbs.model.v2.checker.excel.handler

import de.thm.ii.fbs.model.v2.checker.excel.configuration.ExcelCheckerConfiguration
import de.thm.ii.fbs.model.v2.checker.excel.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.model.v2.checker.excel.result.AnalysisResult
import de.thm.ii.fbs.utils.v2.handler.Handle
import de.thm.ii.fbs.utils.v2.handler.When
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.rangeToCells

@Handle(When.ONERROR)
@Handle(When.ONPERROR)
class ManualFeedbackHandler(result: AnalysisResult, val config: ExcelCheckerConfiguration) : ResultHandler(result) {
    val cellToFeedback: HashMap<String, String> = hashMapOf()

    init {
        config.tasks.forEach {
            it.checkFields.forEach { check ->
                rangeToCells(check.range).forEach {
                    cellToFeedback[it.formatAsString()] = check.errorMsg
                }
            }
        }
    }

    override fun handle(input: ErrorAnalysisContext) {
        val feedback = cellToFeedback[input.submissionCell?.cell]

        if (!feedback.isNullOrBlank()) {
            result.getCellResult(input.submissionCell!!)?.addFeedback(feedback)
        }
    }
}
