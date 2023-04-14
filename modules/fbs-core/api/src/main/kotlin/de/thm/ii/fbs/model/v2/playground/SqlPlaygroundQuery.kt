package de.thm.ii.fbs.model.v2.playground

import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundResult
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundResultConverter
import de.thm.ii.fbs.utils.v2.converters.JpaJsonNodeConverter
import javax.persistence.*

@Entity
@Table(name ="sql_playground_query")
class SqlPlaygroundQuery(
    @Column(nullable = false)
    val statement: String,
    @ManyToOne(optional = false)
    var runIn: SqlPlaygroundDatabase,
    @Column(nullable = false)
    val creatorId: Int,
    @Column(nullable = true)
    @Convert(converter = SqlPlaygroundResultConverter::class)
    var result: SqlPlaygroundResult? = null,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
