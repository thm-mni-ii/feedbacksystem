package de.thm.ii.fbs.services.v2.checker.excel

import com.fasterxml.jackson.core.JsonProcessingException
import de.thm.ii.fbs.model.v2.checker.excel.graph.ErrorAnalysisSolution
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph
import de.thm.ii.fbs.services.v2.checker.storage.CheckerStorageService
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetReferenceParser
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class ErrorAnalysisSolutionService(private val checkerStorageService: CheckerStorageService) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        private const val STORAGE_KEY = "solution"
    }

    fun storeSolution(configurationId: Int, workbook: XSSFWorkbook) {
        checkerStorageService.storeValue(configurationId, STORAGE_KEY, generateSolution(workbook))
    }

    fun getSolution(configurationId: Int, workbook: XSSFWorkbook): ErrorAnalysisSolution? {
        return try {
            checkerStorageService.getOrStoreValue(
                configurationId,
                STORAGE_KEY
            ) { generateSolution(workbook) }
        } catch (e: JsonProcessingException) {
            logger.error("Get Solution for Configuration Id '$configurationId' failed: ", e)
            return null
        }
    }

    fun deleteSolution(configurationId: Int) {
        checkerStorageService.deleteValue(configurationId, STORAGE_KEY)
    }

    private fun generateSolution(workbook: XSSFWorkbook): ErrorAnalysisSolution {
        val references =
            SpreadsheetReferenceParser(workbook).references // TODO: Only store needed cells or fix error on to large graphs elsewhere
        val graph = ReferenceGraph(references) // TODO: support none formular cells

        return ErrorAnalysisSolution(graph)
    }
}
