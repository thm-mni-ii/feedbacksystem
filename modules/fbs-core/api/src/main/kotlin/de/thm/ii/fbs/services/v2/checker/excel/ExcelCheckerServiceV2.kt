package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.AnalysisResult
import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.ErrorAnalysisSolution
import de.thm.ii.fbs.model.v2.checker.excel.handler.ErrorHandler
import de.thm.ii.fbs.model.v2.checker.excel.handler.PropagatedErrorHandler
import de.thm.ii.fbs.services.v2.handler.HandlerService
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.springframework.stereotype.Service

@Service
class ExcelCheckerServiceV2(private val errorAnalysisSolutionService: ErrorAnalysisSolutionService) {
    fun check(configurationId: Int, submission: XSSFWorkbook): AnalysisResult? {
        errorAnalysisSolutionService.storeSolution(configurationId, submission)
        val solution = errorAnalysisSolutionService.getSolution(configurationId) ?: return null
        val result = AnalysisResult()
        val handlerService = HandlerService(ErrorHandler(result), PropagatedErrorHandler(result))

        val errorAnalysisService = ErrorAnalysisService(
            submission,
            solution.graph,
            getSolutionMap(solution),
            handlerService
        )
        errorAnalysisService.findAllErrors(getOutputCells(solution))

        return result
    }

    private fun getOutputCells(solution: ErrorAnalysisSolution): List<Cell> {
        return solution.graph.data.vertexSet().filter { c -> solution.graph.isOutput(c) } // TODO: Improve
    }

    private fun getSolutionMap(solution: ErrorAnalysisSolution): Map<Cell, String?> {
        return solution.graph.data.vertexSet().associate { c -> c!! to c.value }
    }
}