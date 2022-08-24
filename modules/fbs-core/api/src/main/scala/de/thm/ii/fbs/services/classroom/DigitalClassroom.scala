package de.thm.ii.fbs.services.classroom

/**
  * A digital classroom
  * @param classroomId unique id of the classroom
  * @param courseId the courseId of the classroom
  * @param studentPassword The student password of the classroom
  * @param tutorPassword The tutor password of the classroom
  * @param teacherPassword The docent password of the classroom
  */
class DigitalClassroom(
    val classroomId: String,
    val courseId: Int,
    val studentPassword: String,
    val tutorPassword: String,
    val teacherPassword: String
)
