package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.configuration.ExcelCheckerConfiguration
import de.thm.ii.fbs.model.v2.checker.excel.graph.ErrorAnalysisSolution
import de.thm.ii.fbs.model.v2.checker.excel.handler.ErrorHandler
import de.thm.ii.fbs.model.v2.checker.excel.handler.ManualFeedbackHandler
import de.thm.ii.fbs.model.v2.checker.excel.handler.PropagatedErrorHandler
import de.thm.ii.fbs.model.v2.checker.excel.result.AnalysisResult
import de.thm.ii.fbs.model.v2.checker.excel.result.ExcelCheckerResultData
import de.thm.ii.fbs.services.v2.handler.HandlerService
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.springframework.stereotype.Service

@Service
class ExcelCheckerServiceV2(private val errorAnalysisSolutionService: ErrorAnalysisSolutionService) {
    fun check(
        configurationId: Int,
        configuration: ExcelCheckerConfiguration, // TODO: get from db
        solutionSheet: XSSFWorkbook,
        submissionSheet: XSSFWorkbook
    ): ExcelCheckerResultData? {
        val solution = errorAnalysisSolutionService.getSolution(configurationId, solutionSheet) ?: return null
        val result = AnalysisResult()
        val handlerService = HandlerService(
            ErrorHandler(result),
            PropagatedErrorHandler(result),
            ManualFeedbackHandler(result, configuration)
        )

        val errorAnalysisService = ErrorAnalysisService(
            submissionSheet,
            solution.graph,
            getSolutionMap(solution),
            handlerService
        )
        errorAnalysisService.findAllErrors(solution.graph.outputFields) // TODO: only check sheets that are used in the configuration

        return ExcelCheckerResultData(result, configuration, submissionSheet)
    }

    private fun getSolutionMap(solution: ErrorAnalysisSolution): Map<Cell, String?> {
        return solution.graph.data.vertexSet().associate { c -> c!! to c.value }
    }
}
