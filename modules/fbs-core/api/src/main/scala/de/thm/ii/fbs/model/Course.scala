package de.thm.ii.fbs.model

/**
  * A course
  * @param semesterId semester in which the course is planed
  * @param name Name of the course
  * @param description The description of this course
  * @param visible The visibility of the course, false = invisible
  * @param id The id of the course, if 0, then none was assigned.
  */
case class Course(name: String, description: String = "", visible: Boolean = true, id: Int = 0, semesterId: Option[Int] = None, password: Option[String] = None)
