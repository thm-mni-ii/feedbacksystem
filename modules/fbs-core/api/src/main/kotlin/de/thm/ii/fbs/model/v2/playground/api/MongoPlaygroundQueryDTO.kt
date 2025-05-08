package de.thm.ii.fbs.model.v2.playground.api

import org.bson.Document

data class MongoPlaygroundQueryDTO(
    val operation: String,
    val collection: String,
    val document: Document? = null,
    val documents: List<Document>? = null,
    val filter: Document? = null,
    val update: Document? = null,
    val projection: Document? = null,
    val pipeline: List<Document>? = null,
    val upsert: Boolean = false
)
