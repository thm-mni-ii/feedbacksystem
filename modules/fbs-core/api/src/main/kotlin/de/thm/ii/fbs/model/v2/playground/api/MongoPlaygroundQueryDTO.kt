package de.thm.ii.fbs.model.v2.playground.api

data class MongoPlaygroundQueryDTO(
    val operation: String,
    val collection: String,
    val document: Map<String, Any>? = null,
    val criteria: Map<String, Any>? = null,
    val update: Map<String, Any>? = null,
    val pipeline: List<Map<String, Any>>? = null
)
