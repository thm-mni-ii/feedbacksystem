package de.thm.ii.fbs.model.v2.checker.excel.result

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonTypeInfo
import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.configuration.ExcelCheckerConfiguration
import de.thm.ii.fbs.model.v2.checker.excel.configuration.ExcelTaskConfiguration
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.getSheet
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.rangeToCells
import org.apache.poi.xssf.usermodel.XSSFWorkbook

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
class ExcelCheckerResultData(
    private val result: AnalysisResult,
    configuration: ExcelCheckerConfiguration,
    private val submissionSheet: XSSFWorkbook
) {
    val exercises: List<ExcelExercise>
    val passed: Boolean

    init {
        val errorCells = result.getAllErrorCells()
        exercises = configuration.tasks.map { config ->
            val cellResults = getCellResults(config, errorCells)

            ExcelExercise(
                config.name,
                cellResults,
                config.sheetIdx,
                getSheetName(config.sheetIdx),
                cellResults.isEmpty()
            )
        }
        passed = exercises.all { it.passed }
    }

    private fun getSheetName(sheet: Int): String =
        "${getSheet(submissionSheet, sheet).sheetName} ($sheet)"

    private fun getCellResults(config: ExcelTaskConfiguration, errorCells: Set<Cell>) =
        if (config.hideInvalidFields) {
            emptyList()
        } else {
            errorCells.filter { cell ->
                // Only cells specified in a config sheet and range
                cell.sheet == config.sheetIdx && config.checkFields.filterNot { it.hideInvalidFields }
                    .map { rangeToCells(it.range) }
                    .any { it.contains(cell.cellAddress()) }
            }.map {
                CellResultData(it, result.getCellResult(it))
            }
        }
}

data class ExcelExercise(
    val name: String,
    val errorCell: List<CellResultData>,
    val sheetIndex: Int,
    val sheet: String,
    val passed: Boolean
)

data class CellResultData(
    val cellName: String,
    val errorHint: String,
    val propagatedErrorCell: List<CellResultData>,
    val isPropagated: Boolean,
    @get:JsonIgnore // Not return this information to the user
    val value: String?,
    @get:JsonIgnore // Not return this information to the user
    val formula: String?,
    @get:JsonIgnore // Not return this information to the user
    val solution: Cell?
) {
    constructor(cell: Cell, cellResult: CellResult?) : this(
        cell.cell,
        cellResult?.getFeedbackString() ?: "",
        emptyList(),
        cellResult?.isPropagated ?: false,
        cell.value,
        cell.formula,
        cellResult?.solutionCell
    )
}
