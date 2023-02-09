package de.thm.ii.fbs.model.v2.checker.excel

data class AnalysisResult(
    private val cellResults: HashMap<Cell, CellResult> = HashMap(),
    private val subtasks: HashMap<Int, MutableSet<Cell>> = HashMap()
) {

    fun addCellResult(cell: Cell, isPropagated: Boolean) {
        cellResults[cell] = CellResult(isPropagated)
    }

    fun addCellToSubtask(id: Int, cell: Cell) {
        (subtasks[id] ?: HashSet()).add(cell)
    }

    fun getAllErrorCells(): Collection<Cell> {
        return cellResults.keys
    }

    fun getErrorCells(): Collection<Cell> {
        return cellResults.entries.filter { entry -> !entry.value.isPropagated }.map { entry -> entry.key }.toSet()
    }

    fun getPropagatedErrorCells(): Collection<Cell> {
        return cellResults.entries.filter { entry -> entry.value.isPropagated }.map { entry -> entry.key }.toSet()
    }
}