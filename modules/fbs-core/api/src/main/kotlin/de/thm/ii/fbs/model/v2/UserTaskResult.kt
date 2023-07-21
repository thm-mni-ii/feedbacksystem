package de.thm.ii.fbs.model.v2

data class UserTaskResult(val taskID: Int, val points: Int, val maxPoints: Int, val passed: Boolean, val submission: Boolean, val isPrivate: Boolean)
