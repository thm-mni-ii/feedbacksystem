package de.thm.ii.fbs.model.v2.playground

import javax.persistence.*

@Entity
@Table(name ="sql_playground_routine")
class SQLRoutine(
        @Column(nullable = false)
        var name: String,
        @Column(nullable = false)
        var type: String,
        @Column(nullable = false)
        var definition: String,
        @ManyToOne(optional = false)
        var database: Database,
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
)
