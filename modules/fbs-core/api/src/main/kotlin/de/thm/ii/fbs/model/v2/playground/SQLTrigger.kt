package de.thm.ii.fbs.model.v2.playground

import de.thm.ii.fbs.utils.v2.converters.JpaJsonConverter
import jakarta.persistence.*

@Entity
data class SQLTrigger(
        @Column(nullable = false)
        var name: String,
        @Column(nullable = false)
        @Convert(converter = JpaJsonConverter::class)
        var event: SQLTriggerEvent,
        @Column(nullable = false)
        @Convert(converter = JpaJsonConverter::class)
        var action: SQLTriggerAction,
        @ManyToOne(optional = false)
        var database: Database,
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
)

data class SQLTriggerEvent(val manipulation: String, val objectTable: String)

data class SQLTriggerAction(val statement: String, val orientation: String, val timing: String)