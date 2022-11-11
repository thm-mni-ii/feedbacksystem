package de.thm.ii.fbs.model.v2.playground

data class SQLConstraint(
    val name: String,
    val type: String,
    val columnName: String,
    val checkClause: String?
)
