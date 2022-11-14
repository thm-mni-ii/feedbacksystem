package de.thm.ii.fbs.model.v2.checker

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.node.ObjectNode

class SqlPlaygroundRunnerResult(
    @JsonProperty("executionId")
    val executionId: Int,
    @JsonProperty("result")
    val result: ObjectNode,
    @JsonProperty("databaseInformation")
    val databaseInformation: ObjectNode,
    @JsonProperty("error")
    val error: Boolean,
    @JsonProperty("mode")
    val mode: RunnerMode,
    @JsonProperty("resultType")
    val resultType: RunnerResultType,
) : RunnerResult()
