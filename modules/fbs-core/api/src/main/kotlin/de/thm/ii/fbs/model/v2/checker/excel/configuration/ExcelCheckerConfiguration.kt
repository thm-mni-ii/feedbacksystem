package de.thm.ii.fbs.model.v2.checker.excel.configuration

data class ExcelCheckerConfiguration(
    val tasks: List<ExcelTaskConfiguration>,
    val enableExperimentalFeatures: Boolean = false
)
