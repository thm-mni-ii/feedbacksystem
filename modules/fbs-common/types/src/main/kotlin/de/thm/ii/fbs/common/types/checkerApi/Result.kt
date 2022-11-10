package de.thm.ii.fbs.common.types.checkerApi

data class Result(
    val result: SubmissionResult,
    val checkerID: Int,
    val submissionID: Int,
    val id: Int? = null
)
