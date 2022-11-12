package de.thm.ii.fbs.model.v2.playground

import jakarta.persistence.*

class SQLConstraint(
    var name: String,
    var type: String,
    var columnName: String,
    var checkClause: String?,
    @ManyToOne(optional = false)
    var table: SQLTable,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
