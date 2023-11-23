package de.thm.ii.fbs.model.v2.playground.api

import com.fasterxml.jackson.annotation.JsonProperty

data class SqlPlaygroundShareResponse(
    @JsonProperty("url")
    var url: String
)
