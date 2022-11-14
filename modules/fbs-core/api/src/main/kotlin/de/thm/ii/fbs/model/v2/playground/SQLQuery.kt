package de.thm.ii.fbs.model.v2.playground

import com.fasterxml.jackson.annotation.JsonProperty
import javax.persistence.*

class SqlQueryCreation(
    @JsonProperty("statement")
    var statement: String,
)

@Entity
@Table(name ="sql_playground_query")
class SQLQuery(
    @Column(nullable = false)
    val statement: String,
    @ManyToOne(optional = false)
    var runIn: Database,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
