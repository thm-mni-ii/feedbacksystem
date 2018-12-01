package de.thm.ii.submissioncheck.services

import java.io
import java.sql.{Connection, Statement}

import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException, UnauthorizedException}
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
    /** holds label standard_task_type*/
    val standard_task_type: String = "standard_task_type"
  }

  /** holds all unique labels */
  val taskDBLabels = new TaskDBLabels()
  /** holds all course-Table labels*/
  val courseLabels = new CourseLabels()
  /** holds label edit*/
  val LABEL_EDIT = "edit"
  /** holds label subscribe*/
  val LABEL_SUBSCRIBE = "subscribe"

  private final val LABEL_SUCCESS = "success"
  /** all interactions with tasks are done via a taskService*/
  @Autowired
  val taskService: TaskService = null

  /**
    * getCoursesByUser search courses by user object
    *
    * @author Benjamin Manns
    * @param user a User object
    * @return List of Maps
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
    * Union all courses beloning to user, no difference in edit, creation or subscription relation
    * @author Benjamin Manns
    * @param user a User object
    * @return List of Maps
    */
  def getAllKindOfCoursesByUser(user: User): List[Map[String, String]] = {
    DB.query("SELECT c.* FROM user_course hc JOIN course c using(course_id) where user_id = ? UNION SELECT c.* from course c where creator = ?",
      (res, _) => {
        Map(courseLabels.courseid -> res.getString(courseLabels.courseid),
          courseLabels.name -> res.getString(courseLabels.name),
          courseLabels.description -> res.getString(courseLabels.description),
          courseLabels.creator -> res.getString(courseLabels.creator))
      }, user.userid, user.userid)
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
    if (user.role == "admin") {
        true
      }
    else {
      val list = DB.query("SELECT ? IN (SELECT creator FROM course where course_id = ? UNION " +
        "SELECT user_id from user_course where course_id = ? and typ = 'EDIT') as permitted",
        (res, _) => res.getInt("permitted"), user.userid, courseid, courseid)

      list.nonEmpty && list.head == 1
    }
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
    Map(LABEL_SUCCESS-> (num == 1))
  }

  /**
    * getAllCourses gives few information about all courses for searchin purpose
    * @author Benjamin Manns
    * @return Scala List
    */
  def getAllCourses: List[Map[String, Any]] = {
    DB.query("SELECT * FROM course", (res, _) => {
      Map(courseLabels.courseid -> res.getString(courseLabels.courseid),
        courseLabels.name -> res.getString(courseLabels.name),
        courseLabels.description -> res.getString(courseLabels.description))
    })
  }

  /**
    * Gives detailed information about one course - later also task list
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param user User object
    * @return Scala Map
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
      List.empty
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
          courseMap + (courseLabels.creator -> res.getString(courseLabels.creator))
        } else {
          courseMap
        }
      }, courseid)

    list.headOption
  }

  /**
    * Delete a course by its id and also all corresponding entries
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @return JSON
    */
  def deleteCourse(courseid: Int): Map[String, Boolean] = {
    val success = DB.update( "delete from course where course_id = ?", courseid)
    Map(LABEL_SUCCESS -> (success == 1))
  }

  /**
    * Only permitted for docents / admins
    * This method returns all submissions of all users orderd by tasks for one course
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @return Java List
    */
  def getAllSubmissionsFromAllUsersByCourses(courseid: Int): List[Map[String, Any]] = {
    DB.query("select * from task t join course c using(course_id)  where c.course_id = ? order by t.task_id",
      (res, _) => {
        Map(courseLabels.courseid -> res.getString(courseLabels.courseid),
          courseLabels.name -> res.getString(courseLabels.name),
          courseLabels.description -> res.getString(courseLabels.description),
          courseLabels.creator -> res.getString(courseLabels.creator))
      }, courseid)
  }

  /**
    * subscribe a user to a course
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON (contains information if subscription worked or not)
    */
  def subscribeCourse(courseid: Integer, user: User): Map[String, Boolean] = {
    val success = DB.update("insert ignore into user_course (user_id,course_id,typ) VALUES (?,?,'SUBSCRIBE')",
      user.userid, courseid)
    Map(LABEL_SUCCESS -> (success == 1))
  }

  /**
    * unsubscribe a user from a course
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON (contains information if unsubscription worked or not)
    */
  def unsubscribeCourse(courseid: Integer, user: User): Map[String, Boolean] = {
    val success = DB.update("delete from user_course where user_id = ? and course_id = ? and typ = 'SUBSCRIBE'",
      user.userid, courseid)
    Map(LABEL_SUCCESS -> (success == 1))
  }

  /**
    * create a course by user, which only can be dozent or admin (maybe hiwi?)
    *
    * @author Benjamin Manns
    * @param user a user object
    * @param name course name
    * @param description course description
    * @param standard_task_typ a standart task type
    * @return Scala Map
    */
  def createCourseByUser(user: User, name: String, description: String, standard_task_typ: String): Map[String, Number] = {
    val (num, holder) = DB.update((con: Connection) => {
      val ps = con.prepareStatement(
        "insert into course (name, description, creator, standard_task_type) values (?, ?,?,?)",
        Statement.RETURN_GENERATED_KEYS
      )
      ps.setString(1, name)
      ps.setString(2, description)
      ps.setInt(3, user.userid)
      val m4 = 4
      ps.setString(m4, standard_task_typ)
      ps
    })
    if (num < 1) {
      throw new RuntimeException("Error creating course. Please contact administrator.")
    }
    Map("course_id" -> holder.getKey)
  }

  /**
    * create a course by user, which only can be dozent or admin (maybe hiwi?)
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param name course name
    * @param description course description
    * @param standard_task_typ a standart task type
    * @return Scala Map
    */
  def updateCourseByUser(courseid: Int, name: String, description: String, standard_task_typ: String): Map[String, Boolean] = {
    val success = DB.update("update course set name = ?, description = ?, standard_task_type = ? where course_id = ?",
      name, description, standard_task_typ, courseid)
    if (success == 0) {
      throw new ResourceNotFoundException
    }
    else {
      Map(LABEL_SUCCESS -> true)
    }
  }
}
