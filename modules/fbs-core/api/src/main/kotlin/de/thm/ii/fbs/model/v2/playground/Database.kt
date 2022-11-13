package de.thm.ii.fbs.model.v2.playground

import com.fasterxml.jackson.annotation.JsonProperty
import de.thm.ii.fbs.model.v2.security.User
import javax.persistence.*

class DatabaseCreation(
    @JsonProperty("name")
    var name: String
)

@Entity
@Table(name = "sql_playground_database")
class Database(
    @Column(nullable = false)
    var name: String,
    @Column(nullable = false)
    var version: String,
    @Column(nullable = false)
    var dbType: String,
    @ManyToOne(optional = false)
    var owner: User,
    @Column(nullable = false)
    var active: Boolean = false,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
