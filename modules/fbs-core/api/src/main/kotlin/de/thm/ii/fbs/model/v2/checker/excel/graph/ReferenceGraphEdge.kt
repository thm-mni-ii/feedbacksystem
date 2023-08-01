package de.thm.ii.fbs.model.v2.checker.excel.graph

import com.fasterxml.jackson.annotation.JsonProperty

data class ReferenceGraphEdge(
    @JsonProperty("source") val source: String,
    @JsonProperty("target") val target: String
)
