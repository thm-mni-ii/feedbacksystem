package de.thm.ii.fbs.model.v2.group

import de.thm.ii.fbs.model.v2.security.User
import javax.persistence.*

@Entity
@Table(name = "`group`")
class Group(
    @Column(nullable = false)
    var courseId: Int,
    @Column(nullable = false)
    var name: String,
    @Column(nullable = false)
    var membership: Int,
    @Column(nullable = false)
    var visible: Boolean,
    @OneToMany(mappedBy = "groupId")
    var users: List<UserGroup>,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    var id: Int? = null
)
