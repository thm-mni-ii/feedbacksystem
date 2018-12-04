package de.thm.ii.submissioncheck.services

import java.io
import java.sql.{Connection, Statement}

import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
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

  /** holds all unique labels */
  val taskDBLabels = new TaskDBLabels()
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
  @deprecated("0", "not working anymore")
  def getCoursesByUser(user: User): List[Map[String, String]] = {
    // TODO Check somehow if this is a course owner or a course participant
    DB.query("SELECT * FROM user_has_courses hc join course c using(course_id) where user_id = ?",
      (res, _) => {
        Map(CourseDBLabels.courseid -> res.getString(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
          CourseDBLabels.creator -> res.getString(CourseDBLabels.creator))
      }, user.userid)
  }

  /**
    * Union all courses beloning to user, no difference in edit, creation or subscription relation
    * @author Benjamin Manns
    * @param user a User object
    * @return List of Maps
    */
  def getAllKindOfCoursesByUser(user: User): List[Map[String, String]] = {
    DB.query("SELECT c.*, r.* FROM user_course hc JOIN course c using(course_id) join role r  using(role_id) where user_id = ?",
      (res, _) => {
        Map(CourseDBLabels.courseid -> res.getString(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
          RoleDBLabels.role_name  -> res.getString(RoleDBLabels.role_name),
          RoleDBLabels.role_id  -> res.getString(RoleDBLabels.role_id))
      }, user.userid)
  }

  /**
    * Check if a given user is permitted to change course information, add task, grant rights are not checked here.
    * A Tutor and Docent are permitted or courses and admins of course.
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
      val list = DB.query("select count(*) as count from user_course where course_id = ? and user_id = ? and role_id IN (4,8)",
        (res, _) => res.getInt("count"), courseid, user.userid)
      list.nonEmpty && list.head == 1
    }
  }
  /**
    * Check if a given user is a course docent
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a User object
    * @return Boolean, if a user is permitted for the course
    */
  def isDocentForCourse(courseid: Int, user: User): Boolean = {
      val list = DB.query("select count(*) as count from user_course where course_id = ? and user_id = ? and role_id = 4",
        (res, _) => res.getInt("count"), courseid, user.userid)
      list.nonEmpty && list.head == 1
  }

  /**
    * check is a user has a subscription for a course
    * @param courseid unique identification for a course
    * @param user a user object
    * @return Boolean
    */
  def isSubscriberForCourse(courseid: Int, user: User): Boolean = {
    // If a user has any subscription, i.e. he is tutor, docent or just student, he has more view rights
    val list = DB.query("select count(*) as c from user_course where course_id = ? and user_id = ?",
      (res, _) => res.getInt("c"), courseid, user.userid)

    list.nonEmpty && list.head == 1
  }

  /**
    * grant tutor rights to a user for a course
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON (contains information if grant worked or not)
    * @throws BadRequestException If the grant type is invalid.
    */
  def grandUserAsTutorForACourse(courseid: Int, user: User): Map[String, Boolean] = {
    val num = DB.update("insert into user_course (user_id,course_id,role_id) VALUES (?,?,8) ON DUPLICATE KEY UPDATE role_id=8",
      user.userid, courseid)
    Map(LABEL_SUCCESS-> true)
  }

  /**
    * deny tutor rights to a user for a course if this user was a tutor
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON (contains information if grant worked or not)
    */
  def denyUserAsTutorForACourse(courseid: Int, user: User): Map[String, Boolean] = {
    val num = DB.update("update user_course set role_id=16 where user_id = ? and course_id = ? and role_id = 8",
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
      Map(CourseDBLabels.courseid -> res.getString(CourseDBLabels.courseid),
        CourseDBLabels.name -> res.getString(CourseDBLabels.name),
        CourseDBLabels.description -> res.getString(CourseDBLabels.description))
    })
  }

  /**
    * Gives detailed information about one course
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
          CourseDBLabels.courseid -> res.getString(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
          "tasks" -> taskList
        )
        if (isPermitted) {
          courseMap + (CourseDBLabels.creator -> res.getString(CourseDBLabels.creator))
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
    * Only permitted for docents / moderator / admins
    * This method returns all submissions of all users orderd by tasks for one course
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @return Java List
    */
  def getAllSubmissionsFromAllUsersByCourses(courseid: Int): List[Map[String, Any]] = {
    DB.query("select * from task t join course c using(course_id)  where c.course_id = ? order by t.task_id",
      (res, _) => {
        Map(CourseDBLabels.courseid -> res.getString(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
          CourseDBLabels.creator -> res.getString(CourseDBLabels.creator),
          "submissions" -> this.taskService.getSubmissionsByTask(res.getInt(taskDBLabels.taskid)))
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
    val success = DB.update("insert ignore into user_course (user_id,course_id,role_id) VALUES (?,?,16)",
      user.userid, courseid)
    Map(LABEL_SUCCESS -> (success == 1))
  }

  /**
    * unsubscribe a user from a course
    * Tutor can also unsubscribe themself from courses
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON (contains information if unsubscription worked or not)
    */
  def unsubscribeCourse(courseid: Integer, user: User): Map[String, Boolean] = {
    val success = DB.update("delete from user_course where user_id = ? and course_id = ? and role_id IN (8,16)",
      user.userid, courseid)
    Map(LABEL_SUCCESS -> (success == 1))
  }

  /**
    * create a course by user, which only can be moderator or admin (maybe hiwi?)
    *
    * @author Benjamin Manns
    * @param user a user object
    * @param name course name
    * @param description course description
    * @param standard_task_typ a standart task type
    * @return Scala Map
    * @throws RuntimeException
    */
  def createCourseByUser(user: User, name: String, description: String, standard_task_typ: String): Map[String, Number] = {
    val (num, holder) = DB.update((con: Connection) => {
      val ps = con.prepareStatement(
        "insert into course (name, description, creator, standard_task_type) values (?,?,?,?)",
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
      throw new RuntimeException("Error creating course.")
    }
    Map("course_id" -> holder.getKey)
  }

  /**
    * create a course by user, which only can be docent or tutor and everyone above
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param name course name
    * @param description course description
    * @param standard_task_typ a standart task type
    * @return Scala Map
    * @throws ResourceNotFoundException
    */
  def updateCourse(courseid: Int, name: String, description: String, standard_task_typ: String): Map[String, Boolean] = {
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
