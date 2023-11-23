package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

data class SqlPlaygroundShareArguments(
    @JsonProperty("user")
    val user: RunnerUser,
    @JsonProperty("database")
    val database: RunnerDatabase,
    @JsonProperty("id")
    val id: String,
    @JsonProperty("password")
    val password: String,
    @JsonProperty("runner")
    val runner: Runner = Runner(RunnerType.SQL_PLAYGROUND_SHARE)
) : RunnerArguments()
