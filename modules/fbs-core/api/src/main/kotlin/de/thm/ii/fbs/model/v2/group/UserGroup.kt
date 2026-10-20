@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.group

import jakarta.persistence.*
import java.io.Serializable

@Entity
@Table(name = "user_group")
class UserGroup(
    @Id
    @Column(name = "group_id", nullable = false)
    var groupId: Int,
    @Id
    @Column(name = "user_id", nullable = false)
    var userId: Int,
    @Id
    @Column(name = "course_id", nullable = false)
    var courseId: Int
) : Serializable
