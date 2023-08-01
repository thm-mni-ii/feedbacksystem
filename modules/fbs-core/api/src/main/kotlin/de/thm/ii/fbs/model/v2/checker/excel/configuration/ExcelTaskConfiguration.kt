package de.thm.ii.fbs.model.v2.checker.excel.configuration

data class ExcelTaskConfiguration(
    val sheetIdx: Int,
    val changeFields: List<ExcelTaskConfigurationChange> = emptyList(),
    val checkFields: List<ExcelTaskConfigurationCheck> = emptyList(),
    val name: String,
    val hideInvalidFields: Boolean = false
)
