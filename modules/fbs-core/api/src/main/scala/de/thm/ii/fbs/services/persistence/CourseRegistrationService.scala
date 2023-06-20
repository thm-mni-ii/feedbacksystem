package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.v2.course.Participant
import de.thm.ii.fbs.model.v2.security.authentication.User
import de.thm.ii.fbs.model.v2.security.authorization.{CourseRole, GlobalRole}
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import java.sql.ResultSet

/**
  * CourseServiceServices handles course registration and participants
  */
@Component
class CourseRegistrationService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Register a user with a role into a course, or update its registration if already registered
    *
    * @param cid  The course id
    * @param uid  The user id
    * @param role The role
    * @return True if successful
    */
  def register(cid: Int, uid: Int, role: CourseRole): Boolean =
    1 == DB.update("REPLACE INTO user_course (course_id, user_id, course_role) VALUES (?,?,?);", cid, uid, role.getId)

  /**
    * Deregister a user from a course.
    *
    * @param cid The course id
    * @param uid The user id
    * @return True if sucessfully deregistered
    */
  def deregister(cid: Int, uid: Int): Boolean =
    1 == DB.update("DELETE FROM user_course WHERE course_id = ? AND user_id = ?", cid, uid)

  /**
    * Deregister all users with a specific role from a course.
    *
    * @param cid  The course id
    * @param role The role
    * @return True if sucessfully deregistered
    */
  def deregisterRole(cid: Int, role: CourseRole): Boolean =
    1 == DB.update("DELETE FROM user_course WHERE course_id = ? AND course_role = ?", cid, role.getId)

  /**
    * Deregister all users except the current user.
    *
    * @param cid The course id
    * @param uid The user id
    * @return True if sucessfully deregistered
    */
  def deregisterAll(cid: Int, uid: Int): Boolean =
    1 == DB.update("DELETE FROM user_course WHERE course_id = ? AND user_id <> ?", cid, uid)

  /**
    * Get all course for that the user with the user id uid is registered
    *
    * @param uid          User id
    * @param ignoreHidden True if hidden courses should be ignored
    * @return List of courses
    */
  def getRegisteredCourses(uid: Int, ignoreHidden: Boolean = true): List[Course] = DB.query(
    "SELECT course_id, semester_id, name, description, visible FROM course JOIN user_course using(course_id) WHERE user_id = ?"
      + (if (ignoreHidden) " AND visible = 1" else ""),
    (res, _) => parseCourseResult(res), uid)

  private def parseCourseResult(res: ResultSet): Course = Course(
    semesterId = Some(res.getInt("semester_id")),
    name = res.getString("name"),
    description = res.getString("description"),
    visible = res.getBoolean("visible"),
    id = res.getInt("course_id")
  )

  /**
    * Get all participants of a course
    *
    * @param cid The course id
    * @return List of courses
    */
  def getParticipants(cid: Int): List[Participant] = DB.query(
    "SELECT user_id, prename, surname, email, username, alias, global_role, course_role FROM user JOIN user_course using(user_id) where deleted = 0" +
      " and course_id = ?",
    (res, _) => new Participant(parseUserResult(res), CourseRole.parse(res.getInt("course_role")), true), cid)

  /**
    * Parse SQL Query user result
    *
    * @param res SQL Query result
    * @return User Object
    */
  def parseUserResult(res: ResultSet): User = new User(
    res.getString("prename"),
    res.getString("surname"),
    res.getString("username"),
    GlobalRole.parse(res.getInt("global_role")),
    res.getString("email"),
    res.getString("alias"),
    res.getInt("user_id"),
    false, false, null
  )

  /**
    * Get the course privileges of a user.
    *
    * @param uid The user id
    * @return Map of course id to its course role. Note that courses where the user is a student are not listed here.
    */
  def getCoursePrivileges(uid: Int): Map[Int, CourseRole] = {
    DB.query("SELECT course_id, course_role FROM user_course WHERE user_id = ?", (res, _) => {
      (res.getInt("course_id"), CourseRole.parse(res.getInt("course_role")))
    }, uid)
      .foldLeft(Map[Int, CourseRole]())((akku, value) => akku + value)
  }

  def getCourseRoleOfUser(cid: Int, uid: Int): Option[CourseRole] = {
    DB.query("SELECT course_role FROM user_course WHERE user_id = ? AND course_id = ?",
      (res, _) => CourseRole.parse(res.getInt("course_role")), uid, cid).headOption
  }
}
