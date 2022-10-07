package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.JsonProperty

/**
  * A Task for a course
  *
  * @param name Name of the task
  * @param deadline The deadline up to that a solution may be emitted
  * @param mediaType The media type occording to RFC 4288
  * @param description The description of that task
  * @param mediaInformation The mediaInformation of that task
  * @param id The id of the task, if 0,  then no id was assigned
  * @param isPublic Is the Task visible for students
  */
case class Task(@JsonProperty("name") name: String,
                @JsonProperty("deadline") deadline: Option[String],
                @JsonProperty("mediaType") mediaType: String,
                @JsonProperty("isPrivate") isPrivate: Boolean = false,
                @JsonProperty("description") description: String = "",
                @JsonProperty("mediaInformation") mediaInformation: Option[MediaInformation] = None,
                @JsonProperty("requirementType") requirementType: String = Task.defaultRequirement,
                @JsonProperty("id") id: Int = 0,
                @JsonProperty("courseID") courseID: Int = 0
               )

object Task {
  val requirementTypes: Array[String] = Array("mandatory", "optional")
  val defaultRequirement: String = requirementTypes(0)
}
