package de.thm.ii.fbs.model.v2.ac

import jakarta.persistence.*

@Entity
class User(

        var username: String,
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
)
