package de.thm.ii.fbs.model.playground

data class SQLTrigger(
    val name: String,
    val event: SQLTriggerEvent,
    val action: SQLTriggerAction
)

data class SQLTriggerEvent(val manipulation: String, val objectTable: String)

data class SQLTriggerAction(val statement: String, val orientation: String, val timing: String)