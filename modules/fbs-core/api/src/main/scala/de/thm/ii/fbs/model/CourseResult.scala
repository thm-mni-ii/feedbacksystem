package de.thm.ii.fbs.model

import de.thm.ii.fbs.model.task.TaskResult
import de.thm.ii.fbs.model.v2.security.authentication.User

/**
  * The summerized course results
  *
  * @param user    The user, i.e., student
  * @param passed  True if passed the course
  * @param results The taks results
  */
case class CourseResult(user: User, passed: Boolean, results: List[TaskResult])
