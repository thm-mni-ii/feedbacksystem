package de.thm.ii.fbs.model.v2

import com.fasterxml.jackson.annotation.JsonProperty
import org.apache.tika.mime.MimeTypes
import org.springframework.http.MediaType

/**
 * A Task for a course
 *
 * @param name Name of the task
 * @param deadline The deadline up to that a solution may be emitted
 * @param mediaType The media type occording to RFC 4288
 * @param description The description of that task
 * @param mediaInformation The mediaInformation of that task
 * @param id The id of the task, if 0,  then no id was assigned
 * @param isPrivate Is the Task visible for students
 */
data class Task(
    @JsonProperty("name") val name: String,
    @JsonProperty("deadline") val deadline: String?,
    @JsonProperty("mediaType") val mediaType: String,
    @JsonProperty("isPrivate") val isPrivate: Boolean = false,
    @JsonProperty("description") val description: String = "",
    @JsonProperty("mediaInformation") val mediaInformation: MediaInformation? = null,
    @JsonProperty("requirementType") val requirementType: String = TaskObj.defaultRequirement,
    @JsonProperty("id") val id: Int = 0,
    @JsonProperty("courseID") val courseID: Int = 0,
    @JsonProperty("attempts") val attempts: Int? = null,
    @JsonProperty("hideResult") val hideResult: Boolean = false,
) {
    fun getExtensionFromMimeType(mimeType: String): Pair<MediaType, String> {
        return when(mediaType) {
            "text/plain" -> Pair(MediaType.TEXT_PLAIN, ".txt")
            else -> Pair(MediaType.valueOf(mimeType), MimeTypes.getDefaultMimeTypes().forName(mimeType).extension)
        }
    }
}

object TaskObj {
    val requirementTypes: Array<String> = arrayOf("mandatory", "optional", "practice")
    val defaultRequirement: String = requirementTypes[0]
}
