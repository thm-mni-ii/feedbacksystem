package de.thm.ii.fbs.model.v2.playground.api

import com.fasterxml.jackson.annotation.JsonProperty

data class MongoIndexDTO(
    @JsonProperty("collection")
    val collection: String,
    @JsonProperty("index")
    val index: Map<String, Int>
)
