package de.thm.ii.fbs.model.v2

import java.util.Date

/**
 * Submission state
 *
 * @param submissionTime The submission time
 * @param done           True if submission was already checked
 * @param id             Submission id
 * @param results        The submission results
 */
data class Submission(
    val submissionTime: Date,
    val taskID: Int,
    val done: Boolean,
    val id: Int,
    val results: Array<CheckResult> = arrayOf(),
    val userID: Int? = null,
    val isInBlockStorage: Boolean = false,
    val isHidden: Boolean = false
)
