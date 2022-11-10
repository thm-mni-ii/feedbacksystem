package de.thm.ii.fbs.common.types.checkerApi

abstract class PollResponse {
    abstract val id: Long
    abstract val type: String

    class SubmissionFormPollResponse(override val id: Long, val taskConfiguration: List<FormField<Any>>) : PollResponse() {
        override val type: String = "SubmissionFormPollResponse"
    }

    class SubmissionPollResponse(override val id: Long, val taskConfiguration: List<FormField<Any>>, val userID: String, val submission: List<FormField<Any>>) : PollResponse() {
        override val type: String = "SubmissionPollResponse"
    }
}
