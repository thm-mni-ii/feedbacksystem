package de.thm.ii.fbs.model

import java.util.Date

/**
  * A Task for a course
  * @param name Name of the task
  * @param deadline The deadline up to that a solution may be emitted
  * @param mediaType The media type occording to RFC 4288
  * @param description The description of that task
  * @param id The id of the task, if 0,  then no id was assigned
  */
case class Task(name: String, deadline: Date, mediaType: String, description: String = "", id: Int = 0)
