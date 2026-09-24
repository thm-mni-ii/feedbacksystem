package de.thm.ii.fbs.fbs_identity_service.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "`user`")
class UserEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    val id: Long = 0,

    @Column(name = "prename", nullable = false)
    var prename: String = "",

    @Column(name = "surname", nullable = false)
    var surname: String = "",

    @Column(name = "email")
    var email: String? = null,

    @Column(name = "password")
    var password: String? = null,

    @Column(name = "username", nullable = false)
    var username: String = "",

    @Column(name = "privacy_checked", nullable = false)
    var privacyChecked: Boolean = false,

    @Column(name = "deleted", nullable = false)
    var deleted: Boolean = false,

    @Column(name = "alias")
    var alias: String? = null,

    @Column(name = "global_role", nullable = false)
    var globalRole: Int = 2
)
