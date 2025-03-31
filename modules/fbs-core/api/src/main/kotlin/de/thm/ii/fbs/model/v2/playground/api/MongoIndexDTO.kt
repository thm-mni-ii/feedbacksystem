package de.thm.ii.fbs.model.v2.playground.api

data class MongoIndexDTO(
    val collection: String,
    val index: Map<String, Int>
)