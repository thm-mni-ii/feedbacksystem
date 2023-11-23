package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

data class SqlPlaygroundShareDeleteArguments(
    @JsonProperty("database")
    val database: RunnerDatabase,
    @JsonProperty("id")
    val id: String,
    @JsonProperty("delete")
    val delete: Boolean = true,
    @JsonProperty("runner")
    val runner: Runner = Runner(RunnerType.SQL_PLAYGROUND_SHARE)
) : RunnerArguments()
