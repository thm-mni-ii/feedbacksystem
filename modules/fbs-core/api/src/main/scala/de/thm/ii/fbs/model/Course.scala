package de.thm.ii.fbs.model

/**
  * A course
  * @param semester_id semester in which the course is planed
  * @param name Name of the course
  * @param description The description of this course
  * @param visible The visibility of the course, false = invisible
  * @param id The id of the course, if 0, then none was assigned.
  */
case class Course(semester_id: Int = 0, name: String, description: String = "", visible: Boolean = true, id: Int = 0)
