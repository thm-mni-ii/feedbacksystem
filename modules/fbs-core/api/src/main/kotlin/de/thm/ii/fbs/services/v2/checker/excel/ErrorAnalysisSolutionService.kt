package de.thm.ii.fbs.services.v2.checker.excel

import com.fasterxml.jackson.core.JsonProcessingException
import de.thm.ii.fbs.model.v2.checker.excel.ErrorAnalysisSolution
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import de.thm.ii.fbs.services.v2.checker.storage.CheckerStorageService
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetReferenceParser
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.springframework.stereotype.Service

@Service
class ErrorAnalysisSolutionService(private val checkerStorageService: CheckerStorageService) {
    companion object {
        private const val STORAGE_KEY = "solution"
    }

    fun storeSolution(configurationId: Int, workbook: XSSFWorkbook) {
        val references = SpreadsheetReferenceParser(workbook).references
        val graph = ReferenceGraph(references)
        val solution =
            graph.data.vertexSet().associate { c -> c!! to c.value!! } // TODO: Check if it breaks sometimes

        checkerStorageService.storeValue(configurationId, STORAGE_KEY, ErrorAnalysisSolution(graph, solution))
    }

    fun getSolution(configurationId: Int): ErrorAnalysisSolution? {
        return try {
            checkerStorageService.getValue<ErrorAnalysisSolution>(configurationId, STORAGE_KEY)
        } catch (_: JsonProcessingException) {
            null
        }
    }
}