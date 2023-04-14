package de.thm.ii.fbs.model.v2.playground

import de.thm.ii.fbs.model.v2.security.User
import javax.persistence.*

@Entity
@Table(name="sql_users")
class SqlPlaygroundUsers(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        val id: Int? = null,
        @Column(nullable = false)
        var user: User,
        @ManyToOne(optional = false)
        @Column(nullable = false)
        var db: SqlPlaygroundDatabase,
)