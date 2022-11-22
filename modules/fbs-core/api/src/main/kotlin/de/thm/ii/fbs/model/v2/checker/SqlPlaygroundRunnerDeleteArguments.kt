package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

data class SqlPlaygroundRunnerDeleteArguments(
    @JsonProperty("user")
    val user: RunnerUser,
    @JsonProperty("database")
    val database: RunnerDatabase,
    @JsonProperty("runner")
    val runner: Runner = Runner(RunnerType.SQL_PLAYGROUND),
    @JsonProperty("mode")
    val mode: RunnerMode = RunnerMode.DELETE_DB,
    @JsonProperty("executionId")
    val executionId: Int = 0,
    @JsonProperty("statement")
    val statement: String = "",
) : RunnerArguments()
