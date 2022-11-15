package de.thm.ii.fbs.model.v2.playground.api

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.node.ArrayNode

data class SqlPlaygroundResult(
    @JsonProperty("error")
    val error: Boolean,
    @JsonProperty("errorMsg")
    val errorMsg: String?,
    @JsonProperty("result")
    val result: ArrayNode
)
