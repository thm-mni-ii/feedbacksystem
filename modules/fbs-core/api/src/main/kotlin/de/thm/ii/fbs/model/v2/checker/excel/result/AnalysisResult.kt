package de.thm.ii.fbs.model.v2.checker.excel.result

import de.thm.ii.fbs.model.v2.checker.excel.Cell

data class AnalysisResult(
    private val errorCellResults: HashMap<Cell, CellResult> = HashMap()
) {

    fun addCellResult(cell: Cell, solutionCell: Cell, isPropagated: Boolean = false) {
        val result = errorCellResults.getOrPut(cell) { CellResult() }
        result.solutionCell = solutionCell
        result.isPropagated = isPropagated
    }

    fun getCellResult(cell: Cell): CellResult {
        return errorCellResults.getOrPut(cell) { CellResult() }
    }

    fun getAllErrorCells(): Set<Cell> {
        return errorCellResults.keys
    }

    fun getErrorCells(): Set<Cell> {
        return errorCellResults.entries.filter { entry -> !entry.value.isPropagated }.map { entry -> entry.key }.toSet()
    }

    fun getPropagatedErrorCells(): Set<Cell> {
        return errorCellResults.entries.filter { entry -> entry.value.isPropagated }.map { entry -> entry.key }.toSet()
    }
}
