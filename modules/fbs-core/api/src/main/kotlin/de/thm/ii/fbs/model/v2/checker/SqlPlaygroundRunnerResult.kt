package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode

data class SqlPlaygroundRunnerResult(
    @JsonProperty("executionId")
    val executionId: Int,
    @JsonProperty("result")
    val result: ArrayNode,
    @JsonProperty("databaseInformation")
    val databaseInformation: ObjectNode,
    @JsonProperty("error")
    val error: Boolean,
    @JsonProperty("errorMsg")
    val errorMsg: String,
    @JsonProperty("mode")
    val mode: RunnerMode
) : RunnerResult()
