package de.thm.ii.fbs.model.v2.playground

import de.thm.ii.fbs.model.v2.ac.User
import jakarta.persistence.*

data class DatabaseCreation(val name: String)

@Entity
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
