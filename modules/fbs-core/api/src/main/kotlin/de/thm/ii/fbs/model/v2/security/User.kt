package de.thm.ii.fbs.model.v2.security

import de.thm.ii.fbs.model.v2.Course
import de.thm.ii.fbs.model.v2.CourseRegisteration
import javax.persistence.*

@Entity
@Table(name = "user")
class User(
        @Column(nullable = false)
        var username: String,
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "user_id")
        var id: Int? = null,

        @OneToMany(mappedBy = "user")
        val registration: Set<CourseRegisteration>,
)
