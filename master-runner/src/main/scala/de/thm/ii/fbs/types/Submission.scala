package de.thm.ii.fbs.types

import java.nio.file.Path

import com.fasterxml.jackson.annotation.JsonProperty

/**
  * class that stores the Submission config
  *
  * @param id                   the Submission id
  * @param solutionFileLocation the Solution File Path
  * @param isInfo               define if the submission is an information
  * @param user                 the User that submitted the files
  */
class Submission(@JsonProperty("id") val id: Int,
                 @JsonProperty("solutionFileLocation") var solutionFileLocation: Path,
                 @JsonProperty("isInfo") val isInfo: Boolean,
                 @JsonProperty("user") val user: User)
