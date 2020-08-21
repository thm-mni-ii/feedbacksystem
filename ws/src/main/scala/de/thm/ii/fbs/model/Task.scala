package de.thm.ii.fbs.model

import java.util.Date

/**
  * A Task for a course
  * @param name Name of the task
  * @param deadline The deadline up to that a solution may be emitted
  * @param description The desciption of that task
  * @param id The id of the task, if 0,  then no id was assigned
  */
case class Task(name: String, deadline: Date, description: String = "", id: Int = 0)
