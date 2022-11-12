package de.thm.ii.fbs.model.v2.playground

import jakarta.persistence.*

@Entity
data class SQLView(
        var tableName: String,
        var definition: String,
        @ManyToOne(optional = false)
        var database: Database,
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
)
