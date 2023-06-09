package de.thm.ii.fbs.model.v2

import java.util.Date
import java.util.Optional

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
    val results: Array<CheckResult> = Array(),
    val userID: Optional<Int> = None,
    val isInBlockStorage: Boolean = false,
    val isHidden: Boolean = false
)
