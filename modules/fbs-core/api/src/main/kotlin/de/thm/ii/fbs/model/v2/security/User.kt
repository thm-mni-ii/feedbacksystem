@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.security

import javax.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "user")
class User(
    @Column(nullable = false)
    var username: String,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    var id: Int? = null,

    @Column(name = "last_login")
    var lastLogin: LocalDateTime? = null
)