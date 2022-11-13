package de.thm.ii.fbs.model.v2.playground

import javax.persistence.*

@Entity
@Table(name = "sql_playground_constraint")
class SQLConstraint(
    @Column(nullable = false)
    var name: String,
    @Column(nullable = false)
    var type: String,
    @Column(nullable = false)
    var columnName: String,
    @Column(nullable = false)
    var checkClause: String?,
    @ManyToOne(optional = false)
    var table: SQLTable,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
