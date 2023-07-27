package de.thm.ii.fbs.model.v2.checker.excel

class ExcelCheckerResultData(result: AnalysisResult) {
    val exercises: List<ExcelExercise>
    val passed: Boolean

    init {
        val cellResults = result.getAllErrorCells().map { CellResultData(it, result.getCellResult(it)) }
        val exercise = ExcelExercise("", cellResults, "", cellResults.isEmpty()) // TODO: get exercises from Config
        exercises = listOf(exercise)
        passed = exercises.all { it.passed }
    }
}

data class ExcelExercise(
    val name: String,
    val errorCell: List<CellResultData>,
    val sheet: String,
    /**TODO: also store index?**/
    val passed: Boolean
)

data class CellResultData(
    val cellName: String,
    val errorHint: String,
    val propagatedErrorCell: List<CellResultData>,
    val isPropagated: Boolean
) {
    constructor(cell: Cell, cellResult: CellResult?) : this(
        cell.cell,
        cellResult?.getFeedbackString() ?: "",
        emptyList(),
        cellResult?.isPropagated ?: false
    )
}