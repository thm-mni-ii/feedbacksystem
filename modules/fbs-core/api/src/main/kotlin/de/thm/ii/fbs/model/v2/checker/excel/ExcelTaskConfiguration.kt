package de.thm.ii.fbs.model.v2.checker.excel

data class ExcelTaskConfiguration(
    val sheetIdx: Int,
    val changeFields: List<ExcelTaskConfigurationChange> = emptyList(),
    val checkFields: List<ExcelTaskConfigurationCheck> = emptyList(),
    val name: String,
    val hideInvalidFields: Boolean = false
)

data class ExcelTaskConfigurationChange(val cell: String, val newValue: String, val sheetIdx: Int)

data class ExcelTaskConfigurationCheck(
    val range: String,
    val hideInvalidFields: Boolean = false,
    val errorMsg: String = ""
)