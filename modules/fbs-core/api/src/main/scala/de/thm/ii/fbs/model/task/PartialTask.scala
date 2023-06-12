package de.thm.ii.fbs.model.task

import com.fasterxml.jackson.annotation.JsonProperty
import de.thm.ii.fbs.model.MediaInformation

/**
  * A Task for a course
  *
  * @param name             Name of the task
  * @param deadline         The deadline up to that a solution may be emitted
  * @param mediaType        The media type occording to RFC 4288
  * @param isPrivate        Is the Task visible for students
  * @param description      The description of that task
  * @param mediaInformation The mediaInformation of that task
  * @param updateAttempts   If the property attempts should be updated
  */
case class PartialTask(@JsonProperty("name") name: String,
                       @JsonProperty("deadline") deadline: String,
                       @JsonProperty("mediaType") mediaType: String,
                       @JsonProperty("isPrivate") isPrivate: Option[Boolean],
                       @JsonProperty("description") description: String,
                       @JsonProperty("mediaInformation") mediaInformation: MediaInformation,
                       @JsonProperty("requirementType") requirementType: String,
                       @JsonProperty("attempts") attempts: Option[Int],
                       @JsonProperty("hideResult") hideResult: Option[Boolean],
                       @JsonProperty("updateAttempts") updateAttempts: Boolean = false)
