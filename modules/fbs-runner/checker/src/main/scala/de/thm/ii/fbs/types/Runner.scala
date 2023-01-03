package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.{JsonIgnore, JsonProperty}

import java.nio.file.Path

/**
  * Class that stores the Runner Configuration
  *
  * @param id    the Runner configuration id
  * @param rType the Runner type
  * @param files the Runner files
  */
class Runner(@JsonProperty("id") val id: Int,
             @JsonProperty("type") val rType: String,
             @JsonProperty("files") var files: RunnerFiles,
             @JsonIgnore @JsonProperty("paths") var paths: RunnerPaths)

case class RunnerFiles(@JsonProperty("type") typ: String,
                       @JsonProperty("hasMainFile") hasMainFile: Boolean,
                       @JsonProperty("mainFile") mainFile: String,
                       @JsonProperty("hasSecondaryFile") hasSecondaryFile: Boolean,
                       @JsonProperty("secondaryFile") secondaryFile: String)

case class RunnerPaths(var mainFile: Path, var secondaryFile: Option[Path])
