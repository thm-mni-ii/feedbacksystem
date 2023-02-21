package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import de.thm.ii.fbs.model.v2.checker.excel.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.services.v2.handler.HandlerService
import de.thm.ii.fbs.utils.v2.handler.When
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.getCell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.setValueOfCell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.valueOfCell
import org.apache.poi.ss.usermodel.FormulaEvaluator
import org.apache.poi.ss.util.CellReference
import org.apache.poi.xssf.usermodel.XSSFCell
import org.apache.poi.xssf.usermodel.XSSFWorkbook


class ErrorAnalysisService(
    private val workbook: XSSFWorkbook,
    private val graph: ReferenceGraph,
    private val solution: Map<Cell, String?>, /* TODO maybe usa a kotlin set with indexing; */
    private val handleService: HandlerService<ErrorAnalysisContext, Unit>? = null
) {
    private val evaluator: FormulaEvaluator = workbook.creationHelper.createFormulaEvaluator()
    private val errors = HashSet<Cell>()
    private val perrors = HashSet<Cell>()
    private val visited = HashSet<Cell>()


    fun findAllErrors(outputCells: List<Cell>): Set<Cell> {
        handleService?.runHandlers(ErrorAnalysisContext(errors, perrors), When.BEFORE)
        for (outputCell in outputCells) {
            findErrors(outputCell)
        }
        handleService?.runHandlers(ErrorAnalysisContext(errors, perrors), When.AFTER)
        return errors
    }

    private fun findErrors(cell: Cell) {
        visited.add(cell)
        handleService?.runHandlers(ErrorAnalysisContext(errors, perrors, cell), When.ONVISIT)
        val workbookCell = getCellFromWorkbook(cell)

        // Base Case
        // return if cell is input and correct
        if (graph.isInput(cell) && cellEqualsSolution(cell, workbookCell)) {
            return
        }

        // Graph Construction - DFS
        val references = graph.successors(cell)
        for (reference in references) {
            if (!visited.contains(reference)) {
                findErrors(reference)
            }
        }

        // Graph Deconstruction
        // eval cell again and compare again with solution cell
        evaluator.evaluateInCell(workbookCell)
        if (!cellEqualsSolution(cell, workbookCell)) {
            errors.add(cell) // add to original errors set
            handleService?.runHandlers(ErrorAnalysisContext(errors, perrors, cell), When.ONERROR)
            setValueOfCell(workbookCell, solution[cell]) // substitute cell value with solution value
            evaluator.notifyUpdateCell(workbookCell)
        } else {
            perrors.add(cell)
            handleService?.runHandlers(ErrorAnalysisContext(errors, perrors, cell), When.ONPERROR)
        }
    }

    private fun getCellFromWorkbook(cell: Cell): XSSFCell {
        val cellRef = CellReference(cell.cell)
        return getCell(workbook, cell.sheet, cellRef.row, cellRef.col.toInt())
    }

    private fun cellEqualsSolution(cell: Cell, workbookCell: XSSFCell): Boolean {
        return solution[cell].equals(valueOfCell(workbookCell))
    }
}
