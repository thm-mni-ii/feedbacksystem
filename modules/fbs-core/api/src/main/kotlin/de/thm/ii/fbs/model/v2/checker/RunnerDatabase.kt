package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

data class RunnerDatabase(
    @JsonProperty("id")
    val id: Int,
    @JsonProperty("name")
    val name: String,
    @JsonProperty("dbType")
    val dbType: RunnerDbType = RunnerDbType.POSTGRES
)
