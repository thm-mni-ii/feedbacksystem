package de.thm.ii.fbs.model.v2.playground.api

import com.fasterxml.jackson.annotation.JsonProperty
import org.bson.Document

data class MongoViewDTO(
    @JsonProperty("viewName")
    val viewName: String,
    @JsonProperty("collectionSource")
    val collectionSource: String,
    @JsonProperty("pipeline")
    val pipeline: List<Document>
)
