package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

data class SharePlaygroundArguments(
    @JsonProperty("user")
    val user: RunnerUser,
    @JsonProperty("database")
    val database: RunnerDatabase
) : RunnerArguments()