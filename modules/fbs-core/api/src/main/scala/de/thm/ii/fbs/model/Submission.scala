package de.thm.ii.fbs.model

import java.util.Date

/**
  * Submission state
  *
  * @param submissionTime The submission time
  * @param done           True if submission was already checked
  * @param id             Submission id
  * @param results        The submission results
  */
case class Submission(submissionTime: Date,
                      done: Boolean, id: Int,
                      results: Array[CheckResult] = Array(),
                      userID: Option[Int] = None,
                      isInBlockStorage: Boolean = false)
