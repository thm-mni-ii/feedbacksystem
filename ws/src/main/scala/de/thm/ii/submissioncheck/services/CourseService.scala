package de.thm.ii.submissioncheck.services

import java.io
import de.thm.ii.submissioncheck.misc.{BadRequestException, DB}
import de.thm.ii.submissioncheck.model.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * CourseService provides interaction with DB
  *
  * @author Benjamin Manns
  */
@Component
class CourseService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  /**
    * CourseLabels holds all Course-Table lables
    * @author Benjamin Manns
    */
  class CourseLabels{
    /** holds label courseid*/
    val courseid: String = "course_id"
    /** holds label name*/
    val name: String = "name"
    /** holds label description*/
    val description: String = "description"
    /** holds label creator*/
    val creator: String = "creator"
  }

  /** holds all course-Table labels*/
  val courseLabels = new CourseLabels()

  /** all interactions with tasks are done via a taskService*/
  val taskService: TaskService = new TaskService

  /**
    * getCoursesByUser search courses by user object
    *
    * @author Benjamin Manns
    * @param user a User object
    * @return Java List of Maps
    */
  def getCoursesByUser(user: User): List[Map[String, String]] = {
    // TODO Check somehow if this is a course owner or a course participant
    DB.query("SELECT * FROM user_has_courses hc join course c using(course_id) where user_id = ?",
      (res, _) => {
        Map(courseLabels.courseid -> res.getString(courseLabels.courseid),
          courseLabels.name -> res.getString(courseLabels.name),
          courseLabels.description -> res.getString(courseLabels.description),
          courseLabels.creator -> res.getString(courseLabels.creator))
      }, user.userid)
  }

  /**
    * Check if a given user is permitted to change course information, grand rights, add task, ...
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a User object
    * @return Boolean, if a user is permitted for the course
    */
  def isPermittedForCourse(courseid: Int, user: User): Boolean = {
    // TODO allow admin users here!
    val list = DB.query("SELECT ? IN (SELECT creator FROM course where course_id = ? UNION " +
      "SELECT user_id from user_course where course_id = ? and typ = 'EDIT') as permitted",
      (res, _) => res.getInt("permitted"), user.userid, courseid, courseid)

    list.nonEmpty && list.head == 1
  }

  /**
    * check is a user has a subscription for a course
    * @param courseid unique identification for a course
    * @param user a user object
    * @return Boolean
    */
  def isSubscriberForCourse(courseid: Int, user: User): Boolean = {
    val list = DB.query("SELECT ? in (select user_id from user_course where course_id = ? " +
      "and typ = 'SUBSCRIBE') as subscribed",
      (res, _) => res.getInt("subscribed"), user.userid, courseid)

    list.nonEmpty && list.head == 1
  }

  /**
    * grant rights (specified by grandType) to a user for a course
    *
    * @author Benjamin Manns
    * @param grandType which rights is specified here (we support just `edit` until now)
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON (contains information if grant worked or not)
    * @throws BadRequestException If the grant type is invalid.
    */
  def grandUserToACourse(grandType: String, courseid: Int, user: User): Map[String, Boolean] = {
    val grandTypes = List("edit")
    if(!grandTypes.contains(grandType)){
      throw new BadRequestException("Please specify a valid grant_type.")
    }
    val num = DB.update("insert ignore into user_course (user_id,course_id,typ) VALUES (?,?,'EDIT')",
      user.userid, courseid)

    Map("success" -> (num == 1))
  }

  /**
    * Gives detailed information about one course - later also task list
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param user User object
    * @return Java Map
    */
  def getCourseDetails(courseid: Int, user: User): Option[Map[_ <: String, _ >: io.Serializable with String]] = {
    val isPermitted = this.isPermittedForCourse(courseid, user)

    val selectPart = "course_id, name, description" + (if (isPermitted) {
      ", creator" // TODO add more columns
    } else {
      ""
    })

    val taskList = if (isPermitted || this.isSubscriberForCourse(courseid, user)) {
      this.taskService.getTasksByCourse(courseid)
    } else {
      null
    }

    val list = DB.query("SELECT " + selectPart + " FROM course where course_id = ?",
      (res, _) => {
        val courseMap = Map(
          courseLabels.courseid -> res.getString(courseLabels.courseid),
          courseLabels.name -> res.getString(courseLabels.name),
          courseLabels.description -> res.getString(courseLabels.description),
          "tasks" -> taskList
        )

        if (isPermitted) {
          courseMap + courseLabels.creator -> res.getString(courseLabels.creator)
        } else {
          courseMap
        }
      }, courseid)

    list.headOption
  }
}
