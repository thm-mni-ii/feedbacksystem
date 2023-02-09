package de.thm.ii.fbs.model.v2.checker.excel.handler.context

import de.thm.ii.fbs.model.v2.checker.excel.Cell

data class ErrorAnalysisContext(
    val errors: Set<Cell>,
    val perrors: Set<Cell>,
    val currentCell: Cell? = null
)