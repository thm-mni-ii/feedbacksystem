package de.thm.ii.fbs.model.v2.group

import de.thm.ii.fbs.model.v2.security.User
import javax.persistence.*

@Entity
@Table(name = "user_group")
class Group(
    @Column(nullable = false)
    var name: String,
    @Column(name = "access_key", nullable = false, unique = true)
    var key: String,
    @ManyToOne(optional = false)
    var creator: User,
    @ManyToMany
    @JoinTable(name = "user_group_membership")
    var members: Set<User>,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
)
