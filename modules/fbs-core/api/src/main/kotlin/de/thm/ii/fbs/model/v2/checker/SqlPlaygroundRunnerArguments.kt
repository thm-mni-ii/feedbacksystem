package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

class SqlPlaygroundRunnerArguments(
    @JsonProperty("executionId")
    val executionId: Int,
    @JsonProperty("user")
    val user: RunnerUser,
    @JsonProperty("statement")
    val statement: String,
    @JsonProperty("database")
    val database: RunnerDatabase,
    @JsonProperty("mode")
    val mode: RunnerMode
) : RunnerArguments()
