package de.thm.ii.fbs.model.v2.security

import de.thm.ii.fbs.model.v2.GlobalRole
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
        @Column(nullable = false)
        var prename: String,
        @Column(nullable = false)
        var surname: String,
        @Column()
        var email: String? = null,
        @Column()
        var alias: String? = null,
        @Column()
        @Enumerated(EnumType.ORDINAL)
        var globalRole: GlobalRole = GlobalRole.USER,
)
