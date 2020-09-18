package de.thm.ii.fbs.model

/**
  * The course roles of a user
  */
object CourseRole extends Enumeration {
  /**
    * Admin of the course.
    */
  val DOCENT: CourseRole.Value = Value(0)
  /**
    * Moderator of the course
    */
  val TUTOR: CourseRole.Value = Value(1)
  /**
    * Participant in the course.
    */
  val STUDENT: CourseRole.Value = Value(2)

  /**
    * Parse an int to a course role.
    * @param roleId The role id
    * @return Course role, where the id is mapped to its assigned enum type, if no enum type
    *         is assigned to the roleId provided, then the STUDENT type is returned.
    */
  def parse(roleId: Int): CourseRole.Value = roleId match {
    case 0 => CourseRole.DOCENT
    case 1 => CourseRole.TUTOR
    case _ => CourseRole.STUDENT
  }
}
