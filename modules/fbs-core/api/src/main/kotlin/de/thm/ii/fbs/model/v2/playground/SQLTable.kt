package de.thm.ii.fbs.model.v2.playground

data class SQLTable(
        val name: String,
        val columns: List<SQLTableColumn>,
)

data class SQLTableColumn(val name: String, val isNullable: Boolean, val udtName: String)
