@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.playground

import de.thm.ii.fbs.model.v2.security.User
import javax.persistence.*

@Entity
@Table(name = "sql_users")
class SqlPlaygroundUsers(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,
    @ManyToOne(optional = false)
    var user: User,
    @ManyToOne(optional = false)
    var db: SqlPlaygroundDatabase
)
