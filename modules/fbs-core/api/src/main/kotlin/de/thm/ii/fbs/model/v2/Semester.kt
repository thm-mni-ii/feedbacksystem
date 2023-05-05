package de.thm.ii.fbs.model.v2

import javax.persistence.*


@Entity
@Table(name = "semester")
class Semester(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(nullable = false, name = "semester_id", columnDefinition = "int")
        val id: Int,
        @Column(nullable = false, columnDefinition = "TEXT")
        val name: String
)
