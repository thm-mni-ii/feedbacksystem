package de.thm.ii.fbs.model.v2.checker.excel

data class AnalysisResult(
    private val errorCellResults: HashMap<Cell, CellResult> = HashMap()
) {

    // should only be once if it shall be consistent
    fun addCellResult(cell: Cell, isPropagated: Boolean = false) {
        errorCellResults[cell] = CellResult(isPropagated)
    }

    fun getCellResult(cell: Cell): CellResult? {
        return errorCellResults[cell]
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
