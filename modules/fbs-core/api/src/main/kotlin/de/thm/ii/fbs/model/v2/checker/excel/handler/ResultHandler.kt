package de.thm.ii.fbs.model.v2.checker.excel.handler

import de.thm.ii.fbs.model.v2.checker.excel.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.model.v2.checker.excel.result.AnalysisResult
import de.thm.ii.fbs.utils.v2.handler.Handler

abstract class ResultHandler(val result: AnalysisResult) : Handler<ErrorAnalysisContext, Unit>
