package de.thm.ii.fbs.model.v2.checker.excel.graph

import com.fasterxml.jackson.annotation.JsonProperty

data class ErrorAnalysisSolution(
    @JsonProperty("graph") val graph: ReferenceGraph
)
