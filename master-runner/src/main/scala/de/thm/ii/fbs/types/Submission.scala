package de.thm.ii.fbs.types

import java.nio.file.Path

import com.fasterxml.jackson.annotation.JsonProperty

/**
  * class that stores the Submission config
  *
  * @param id                   the Submission id
  * @param solutionFileLocation the Solution File Path
  * @param user                 the User that submitted the files
  */
class Submission(@JsonProperty("id") val id: Int,
                 @JsonProperty("solutionFileLocation") var solutionFileLocation: Path,
                 @JsonProperty("user") val user: User)
