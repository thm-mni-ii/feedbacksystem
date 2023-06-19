@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.security.authentication

import javax.persistence.*

@Entity
@Table(name = "user")
class User(
    @Column(nullable = false)
    var username: String,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    var id: Int? = null
)
