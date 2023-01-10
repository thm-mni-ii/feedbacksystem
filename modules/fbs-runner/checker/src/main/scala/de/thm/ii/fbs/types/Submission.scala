package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.{JsonIgnore, JsonProperty}

import java.nio.file.Path

/**
  * class that stores the Submission config
  *
  * @param id                   the Submission id
  * @param solutionFileLocation the Solution File Path
  * @param user                 the User that submitted the files
  */
class Submission(@JsonProperty("id") val id: Int,
                 @JsonIgnore @JsonProperty("solutionFileLocation") var solutionFileLocation: Path,
                 @JsonProperty("solutionFileUrl") var solutionFileUrl: String,
                 @JsonProperty("user") val user: User,
                 @JsonProperty("apiUrl") val apiUrl: String,
                 @JsonProperty("mongodbUrl") val mongodbUrl: String,
                )
