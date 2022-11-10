package de.thm.ii.fbs.common.types.checkerApi

data class SubmissionResult(val studentResult: View, val lecturerResult: View, val logs: View, val subTasks: List<SubTask>) {
    data class SubTask(val name: String, val maxPoints: Int, val points: Int)
}
