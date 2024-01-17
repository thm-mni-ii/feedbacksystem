package de.thm.ii.fbs.model.task

import com.fasterxml.jackson.annotation.JsonProperty
import de.thm.ii.fbs.model.MediaInformation
import de.thm.ii.fbs.util.ExtensionUtils
import org.springframework.http.MediaType

/**
  * A Task for a course
  *
  * @param name             Name of the task
  * @param deadline         The deadline up to that a solution may be emitted
  * @param mediaType        The media type occording to RFC 4288
  * @param description      The description of that task
  * @param mediaInformation The mediaInformation of that task
  * @param id               The id of the task, if 0,  then no id was assigned
  * @param isPrivate        Is the Task visible for students
  * @param hideResult       Should the result be shown to the user
  * @param attempts         Number of Attempts
  * @param requirementType  The requirement type of the Task
  */
case class Task(@JsonProperty("name") name: String,
                @JsonProperty("deadline") deadline: Option[String],
                @JsonProperty("mediaType") mediaType: String,
                @JsonProperty("isPrivate") isPrivate: Boolean = false,
                @JsonProperty("description") description: String = "",
                @JsonProperty("mediaInformation") mediaInformation: Option[MediaInformation] = None,
                @JsonProperty("requirementType") requirementType: String = Task.defaultRequirement,
                @JsonProperty("id") id: Int = 0,
                @JsonProperty("courseID") courseID: Int = 0,
                @JsonProperty("attempts") attempts: Option[Int] = None,
                @JsonProperty("hideResult") hideResult: Boolean = false,
               ) {
  def getExtensionForSubmissions(mimeType: String): (MediaType, String) = {
    mediaType match {
      case "text/plain" => (MediaType.TEXT_PLAIN, ".txt")
      case _ => ExtensionUtils.getExtensionFromMimeType(mimeType)
    }
  }
}

object Task {
  val requirementTypes: Array[String] = Array("mandatory", "optional", "practice")
  val defaultRequirement: String = requirementTypes(0)
}
