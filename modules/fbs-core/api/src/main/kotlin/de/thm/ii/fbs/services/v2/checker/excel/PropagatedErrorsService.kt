package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.setValueOfCell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.valueOfCell
import org.apache.poi.ss.usermodel.FormulaEvaluator
import org.apache.poi.ss.util.CellReference
import org.apache.poi.xssf.usermodel.XSSFCell
import org.apache.poi.xssf.usermodel.XSSFWorkbook


class PropagatedErrorsService(
    private val workbook: XSSFWorkbook,
    private val graph: ReferenceGraph, /* TODO get dependency graph from solution entry in db */
    private val solution: Map<Cell, String> /* TODO maybe usa a kotlin set with indexing; get solution values from solution entry in db */
) {
    private val evaluator: FormulaEvaluator = workbook.creationHelper.createFormulaEvaluator()

    fun findAllPropagatedErrors(outputCells: List<Cell>): Set<Cell> {
        val errors = HashSet<Cell>()
        val visited = HashSet<Cell>()
        for (outputCell in outputCells) {
            findPropagatedErrors(outputCell, errors, visited)
        }
        return errors
    }

    private fun findPropagatedErrors(cell: Cell, errors: MutableSet<Cell>, visited: MutableSet<Cell>) {
        visited.add(cell)
        val workbookCell = getCellFromWorkbook(cell)

        // Base Case
        // compare cell with solution cell (or it is an input)
        if (graph.isInput(cell) && cellEqualsSolution(cell, workbookCell)) {
            return
        }

        // Graph Construction - DFS
        val references = graph.successors(cell)
        for (reference in references) {
            if (!visited.contains(reference)) {
                findPropagatedErrors(reference, errors, visited)
            }
        }

        // Graph Deconstruction
        // eval cell again and compare again with solution cell
        evaluator.evaluateInCell(workbookCell)
        if (!cellEqualsSolution(cell, workbookCell)) {
            errors.add(cell) // add to original errors set
            setValueOfCell(workbookCell, solution[cell]!!) // substitute cell value with solution value
            evaluator.notifyUpdateCell(workbookCell)
        }
    }

    private fun getCellFromWorkbook(cell: Cell): XSSFCell {
        val cellRef = CellReference(cell.cell)
        return workbook.getSheetAt(cell.sheet).getRow(cellRef.row).getCell(cellRef.col.toInt())
    }

    private fun cellEqualsSolution(cell: Cell, workbookCell: XSSFCell): Boolean {
        return solution[cell].equals(valueOfCell(workbookCell))
    }
}
