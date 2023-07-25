package de.thm.ii.fbs.model.v2

import de.thm.ii.fbs.model.v2.security.User
import java.io.Serializable
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.MapsId
import javax.persistence.Table

@Entity
@Table(name = "user_course")
class CourseRegisteration(
    @EmbeddedId
    val id: CourseRegisterationKey,

    @ManyToOne
    @MapsId("user_id")
    @JoinColumn(name = "user_id")
    val user: User,

    @ManyToOne
    @MapsId("course_id")
    @JoinColumn(name = "course_id")
    val course: Course,

    val courseRole: CourseRole
)

@Embeddable
class CourseRegisterationKey : Serializable {
    @Column(name = "user_id")
    var user_id: Int? = null

    @Column(name = "course_id")
    var course_id: Int? = null
}
