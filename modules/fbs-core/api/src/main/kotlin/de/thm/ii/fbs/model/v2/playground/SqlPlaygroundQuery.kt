@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.playground

import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundResult
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundResultConverter
import de.thm.ii.fbs.model.v2.security.User
import javax.persistence.*

@Entity
@Table(name = "sql_playground_query")
class SqlPlaygroundQuery(
    @Column(nullable = false)
    val statement: String,
    @ManyToOne(optional = false)
    var runIn: SqlPlaygroundDatabase,
    @ManyToOne(optional = false)
    val creatorId: User,
    @Column(nullable = true)
    @Convert(converter = SqlPlaygroundResultConverter::class)
    var result: SqlPlaygroundResult? = null,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null
)
