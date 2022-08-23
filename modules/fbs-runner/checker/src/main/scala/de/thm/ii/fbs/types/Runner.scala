package de.thm.ii.fbs.types

import java.nio.file.Path

import com.fasterxml.jackson.annotation.JsonProperty

/**
  * Class that stores the Runner Configuration
  *
  * @param id               the Runner configuration id
  * @param rType            the Runner type
  * @param mainFile         the Runner main-file
  * @param secondaryFile    the Runner secondary-file
  * @param hasSecondaryFile if secondary-file is present
  */
class Runner(@JsonProperty("id") val id: Int,
             @JsonProperty("type") val rType: String,
             @JsonProperty("mainFileLocation") var mainFile: Path,
             @JsonProperty("secondaryFileLocation") var secondaryFile: Path,
             @JsonProperty("hasSecondaryFile") val hasSecondaryFile: Boolean)
