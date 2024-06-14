package de.thm.ii.fbs.model.v2.checker.excel.configuration

data class ExcelTaskConfigurationCheck(
    val range: String,
    val hideInvalidFields: Boolean = false,
    val errorMsg: String = ""
)
