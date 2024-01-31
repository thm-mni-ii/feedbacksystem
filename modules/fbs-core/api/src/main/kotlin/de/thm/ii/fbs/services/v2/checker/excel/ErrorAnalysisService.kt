package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph
import de.thm.ii.fbs.model.v2.checker.excel.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.services.v2.handler.HandlerService
import de.thm.ii.fbs.utils.v2.handler.When
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.formulaOfCell
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
    val errors = HashSet<Cell>()
    val perrors = HashSet<Cell>()
    private val visited = HashSet<Cell>()

    fun findAllErrors(outputCells: List<Cell>): Set<Cell> {
        handleService?.runHandlers(ErrorAnalysisContext(errors, perrors), When.BEFORE)
        evaluator.evaluateAll()
        for (outputCell in outputCells) {
            findErrors(outputCell)
        }
        handleService?.runHandlers(ErrorAnalysisContext(errors, perrors), When.AFTER)
        return errors
    }

    private fun findErrors(cell: Cell) {
        visited.add(cell)
        handleService?.runHandlers(ErrorAnalysisContext(errors, perrors, cell), When.ONVISIT)
        val (submissionCell, workbookCell) = getSubmissionCell(cell)

        if (!cellEqualsSolution(cell, workbookCell)) {
            // found a value error
            perrors.add(cell)
        } else if (graph.isInput(cell)) {
            // Base Case
            // return if cell is input and correct
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
        evaluator.evaluateFormulaCell(workbookCell)
        if (!cellEqualsSolution(cell, workbookCell)) {
            errors.add(cell) // add to original errors set
            perrors.remove(cell) // remove from propagated errors
            handleService?.runHandlers(ErrorAnalysisContext(errors, perrors, submissionCell, cell), When.ONERROR)
            setValueOfCell(workbookCell, solution[cell]) // substitute cell value with solution value
            evaluator.notifyUpdateCell(workbookCell)
        } else if (perrors.contains(cell)) {
            handleService?.runHandlers(ErrorAnalysisContext(errors, perrors, submissionCell, cell), When.ONPERROR)
        }
    }

    private fun getSubmissionCell(cell: Cell): Pair<Cell, XSSFCell> {
        val workbookCell = getCellFromWorkbook(cell)
        val submissionCell = cell.copy()

        // Store value + formula from the submission
        submissionCell.value = valueOfCell(workbookCell)
        submissionCell.formula = formulaOfCell(workbookCell)

        return Pair(submissionCell, workbookCell)
    }

    private fun getCellFromWorkbook(cell: Cell): XSSFCell {
        val cellRef = CellReference(cell.cell)
        return getCell(workbook, cell.sheet, cellRef.row, cellRef.col.toInt())
    }

    private fun cellEqualsSolution(cell: Cell, workbookCell: XSSFCell): Boolean {
        return solution[cell].equals(valueOfCell(workbookCell))
    }
}
