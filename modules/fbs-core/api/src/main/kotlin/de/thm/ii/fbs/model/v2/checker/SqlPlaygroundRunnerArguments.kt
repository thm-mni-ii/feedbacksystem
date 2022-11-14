package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

data class SqlPlaygroundRunnerArguments(
    @JsonProperty("executionId")
    val executionId: Int,
    @JsonProperty("user")
    val user: RunnerUser,
    @JsonProperty("statement")
    val statement: String,
    @JsonProperty("database")
    val database: RunnerDatabase,
    @JsonProperty("runner")
    val runner: Runner = Runner(RunnerType.SQL_PLAYGROUND),
    @JsonProperty("mode")
    val mode: RunnerMode = RunnerMode.EXECUTE,
) : RunnerArguments()
