package de.thm.ii.fbs.model.playground

data class SQLConstraint(
    val name: String,
    val type: String,
    val columnName: String,
    val checkClause: String?
)
