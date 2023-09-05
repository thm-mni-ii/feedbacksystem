package de.thm.ii.fbs.model.v2.checker.excel.result

import de.thm.ii.fbs.model.v2.checker.excel.Cell

data class CellResult(val solutionCell: Cell, val isPropagated: Boolean = false) {
    private val feedback: StringBuilder = StringBuilder()

    fun addFeedback(value: String) {
        feedback.append(value)
    }

    fun getFeedback(): StringBuilder {
        return feedback
    }

    fun getFeedbackString(): String {
        if (feedback.isEmpty()) {
            return "Diese Zelle enthält nicht das richtige Ergebnis"
        }

        return feedback.toString()
    }
}
