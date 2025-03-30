package de.thm.ii.fbs.model.v2.playground.api

import org.bson.Document

data class MongoViewDTO(
    val viewName: String,
    val collectionSource: String,
    val pipeline: List<Document>
)