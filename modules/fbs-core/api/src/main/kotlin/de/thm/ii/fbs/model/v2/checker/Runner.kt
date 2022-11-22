package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

data class Runner(
    @JsonProperty("type")
    val type: RunnerType,
)
