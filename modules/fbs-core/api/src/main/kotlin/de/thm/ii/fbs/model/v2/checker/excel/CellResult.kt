package de.thm.ii.fbs.model.v2.checker.excel

data class CellResult(val isPropagated: Boolean) {
    private val feedback: StringBuilder = StringBuilder()

    fun addFeedback(value: String) {
        feedback.append(value)
    }
}