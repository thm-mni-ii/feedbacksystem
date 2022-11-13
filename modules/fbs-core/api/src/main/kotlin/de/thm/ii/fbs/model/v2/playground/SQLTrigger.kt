package de.thm.ii.fbs.model.v2.playground

import de.thm.ii.fbs.utils.v2.converters.JpaJsonConverter
import javax.persistence.*

@Entity
@Table(name = "sql_playground_trigger")
class SQLTrigger(
        @Column(nullable = false)
        var name: String,
        @Column(nullable = false)
        @Convert(converter = SQLTriggerEventConvert::class)
        var event: SQLTriggerEvent,
        @Column(nullable = false)
        @Convert(converter = SQLTriggerActionConvert::class)
        var action: SQLTriggerAction,
        @ManyToOne(optional = false)
        var database: Database,
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
)

data class SQLTriggerEvent(val manipulation: String, val objectTable: String)

data class SQLTriggerAction(val statement: String, val orientation: String, val timing: String)

class SQLTriggerEventConvert : JpaJsonConverter<SQLTriggerEvent>(SQLTriggerEvent::class)
class SQLTriggerActionConvert : JpaJsonConverter<SQLTriggerAction>(SQLTriggerAction::class)
