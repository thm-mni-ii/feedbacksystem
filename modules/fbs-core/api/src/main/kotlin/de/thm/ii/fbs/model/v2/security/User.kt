@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.security

import de.thm.ii.fbs.model.v2.CourseRegisteration
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.OneToMany
import javax.persistence.Table

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
    val registration: Set<CourseRegisteration>
)
