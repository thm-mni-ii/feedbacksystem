package de.thm.ii.fbs.model.v2.playground.api

import com.fasterxml.jackson.annotation.JsonProperty
import org.bson.Document

data class MongoPlaygroundQueryDTO(
    @JsonProperty("operation")
    val operation: String,
    @JsonProperty("collection")
    val collection: String,
    @JsonProperty("document")
    val document: Document? = null,
    @JsonProperty("documents")
    val documents: List<Document>? = null,
    @JsonProperty("filter")
    val filter: Document? = null,
    @JsonProperty("update")
    val update: Document? = null,
    @JsonProperty("projection")
    val projection: Document? = null,
    @JsonProperty("pipeline")
    val pipeline: List<Document>? = null,
    @JsonProperty("upsert")
    val upsert: Boolean = false
)
