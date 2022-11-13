package de.thm.ii.fbs.model.v2.playground

import javax.persistence.*

@Entity
@Table(name = "sql_playground_view")
class SQLView(
        @Column(nullable = false)
        var tableName: String,
        @Column(nullable = false)
        var definition: String,
        @ManyToOne(optional = false)
        var database: Database,
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
)
