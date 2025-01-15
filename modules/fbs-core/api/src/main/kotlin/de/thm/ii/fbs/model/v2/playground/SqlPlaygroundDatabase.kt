@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.playground

import com.fasterxml.jackson.annotation.JsonIgnore
import de.thm.ii.fbs.model.v2.group.Group
import de.thm.ii.fbs.model.v2.security.User
import javax.persistence.*

@Entity
@Table(name = "sql_playground_database")
class SqlPlaygroundDatabase(
    @Column(nullable = false)
    var name: String,
    @Column(nullable = false)
    var version: String,
    @Column(nullable = false)
    var dbType: String,
    @ManyToOne(optional = false)
    var owner: User,
    @Column(nullable = false)
    var active: Boolean = false,
    @OneToOne
    var shareWithGroup: Group? = null,
    @Column(nullable = false)
    @JsonIgnore
    var deleted: Boolean = false,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null
)
