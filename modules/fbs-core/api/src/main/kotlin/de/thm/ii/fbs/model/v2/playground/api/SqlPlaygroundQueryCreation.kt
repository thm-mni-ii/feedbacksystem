package de.thm.ii.fbs.model.v2.playground.api

import com.fasterxml.jackson.annotation.JsonProperty

class SqlPlaygroundQueryCreation(
    @JsonProperty("statement")
    var statement: String,
)
