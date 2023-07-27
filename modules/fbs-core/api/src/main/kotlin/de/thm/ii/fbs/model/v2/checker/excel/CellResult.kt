package de.thm.ii.fbs.model.v2.checker.excel

data class CellResult(val isPropagated: Boolean = false) {
    private val feedback: StringBuilder = StringBuilder()

    fun addFeedback(value: String) {
        feedback.append(value)
    }

    fun getFeedback(): StringBuilder {
        return feedback
    }

    fun getFeedbackString(): String {
        if (feedback.isEmpty()) {
            return "Invalid Value!" // TODO: Define actual default msg
        }

        return feedback.toString()
    }
}
