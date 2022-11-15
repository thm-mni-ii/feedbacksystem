package de.thm.ii.fbs.model.v2.playground

import com.fasterxml.jackson.databind.node.ArrayNode
import de.thm.ii.fbs.utils.v2.converters.JpaJsonNodeConverter
import javax.persistence.*

@Entity
@Table(name="sql_entity")
class SqlPlaygroundEntity(
    @ManyToOne(optional = false)
    var database: SqlPlaygroundDatabase,
    @Column(nullable = false)
    var type: String,
    @Column(nullable = true)
    @Convert(converter = JpaJsonNodeConverter::class)
    var data: ArrayNode? = null,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
