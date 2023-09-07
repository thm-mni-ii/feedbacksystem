package de.thm.ii.fbs.model.v2.checker.excel.result

import de.thm.ii.fbs.model.v2.checker.excel.Cell

data class CellResult(var solutionCell: Cell? = null, var isPropagated: Boolean = false) {
    private val feedback: MutableList<String> = mutableListOf()

    fun addFeedback(value: String) {
        feedback.add(value)
    }

    fun getFeedback(): String {
        if (feedback.isEmpty()) {
            return "Diese Zelle enthält nicht das richtige Ergebnis"
        }
        val showAsList = feedback.size > 1
        return feedback.joinToString("\n") { if (showAsList) "- $it" else it }
    }
}
