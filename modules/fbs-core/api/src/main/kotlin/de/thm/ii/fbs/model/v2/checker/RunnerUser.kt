package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty

class RunnerUser(
    @JsonProperty("id")
    val id: Int,
    @JsonProperty("username")
    val username: String
)
