package de.thm.ii.fbs.services.persistance

import java.sql.ResultSet

import de.thm.ii.fbs.model._
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * CourseServiceServices handles course registration and participants
  */
@Component
class CourseRegistrationService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Register a user with a role into a course, or update its registration if already registered
    * @param cid The course id
    * @param uid The user id
    * @param role The role
    * @return True if successful
    */
  def register(cid: Int, uid: Int, role: CourseRole.Value): Boolean =
    1 == DB.update("REPLACE INTO user_course (course_id, user_id, course_role) VALUES (?,?,?);", cid, uid, role.id)

  /**
    * Deregister a user from a course.
    * @param cid The course id
    * @param uid The user id
    * @return True if sucessfully deregistered
    */
  def deregister(cid: Int, uid: Int): Boolean =
    1 == DB.update("DELETE FROM user_course WHERE course_id = ? AND user_id = ?", cid, uid)

  /**
    * Get all course for that the user with the user id uid is registered
    * @param uid User id
    * @param ignoreHidden True if hidden courses should be ignored
    * @return List of courses
    */
  def getRegisteredCourses(uid: Int, ignoreHidden: Boolean = true): List[Course] = DB.query(
    "SELECT course_id, name, description, visible FROM course JOIN user_course using(course_id) WHERE user_id = ?"
      + (if (ignoreHidden) " AND visible = 1" else ""),
    (res, _) => parseCourseResult(res), uid)

  /**
    * Get all participants of a course
    * @param cid The course id
    * @return List of courses
    */
  def getParticipants(cid: Int): List[Participant] = DB.query(
    "SELECT user_id, prename, surname, email, username, alias, global_role, course_role FROM user JOIN user_course using(user_id) where deleted = 0" +
      " and course_id = ?",
    (res, _) => Participant(parseUserResult(res), CourseRole.parse(res.getInt("course_role"))), cid)

  /**
    * Get the course priviledges of a user.
    * @param uid The user id
    * @return Map of course id to its course role. Note that courses where the user is a student are not listed here.
    */
  def getCoursePriviledges(uid: Int): Map[Int, Int] = {
    DB.query("SELECT course_id, course_role FROM user_course WHERE user_id = ? AND course_role <> ?", (res, _) => {
      (res.getInt("course_id"), res.getInt("course_role"))
    }, uid, CourseRole.TUTOR.id)
      .foldLeft(Map[Int, Int]())((akku, value) => akku + value)
  }

  private def parseCourseResult(res: ResultSet): Course = Course(
    name = res.getString("name"),
    description = res.getString("description"),
    visible = res.getBoolean("visible"),
    id = res.getInt("course_id")
  )

  private def parseUserResult(res: ResultSet): User = new User(
    prename = res.getString("prename"),
    surname = res.getString("surname"),
    email = res.getString("email"),
    username = res.getString("username"),
    globalRole = GlobalRole.parse(res.getInt("global_role")),
    alias = Option(res.getString("alias")),
    id = res.getInt("user_id")
  )
}
