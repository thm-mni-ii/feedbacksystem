package de.thm.ii.fbs.model.v2

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.OneToMany
import javax.persistence.Table

@Entity
@Table(name = "course")
class Course(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, name = "course_id", columnDefinition = "int")
    var id: Int,
    @Column(nullable = false, columnDefinition = "VARCHAR(100)")
    var name: String,
    @Column(nullable = false, columnDefinition = "TEXT")
    var description: String,
    @Column(nullable = false, columnDefinition = "TINYINT(1)")
    var visible: Boolean = true,
    @Column(columnDefinition = "int")
    val semesterId: Int? = null,
    @OneToMany(mappedBy = "course")
    val registration: Set<CourseRegisteration>
)
