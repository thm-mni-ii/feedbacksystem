package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

data class DatabaseDumpArguments(
    @JsonProperty("id")
    val id: Int,
    @JsonProperty("name")
    val name: String
) : RunnerArguments()