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

  /** holds label edit*/
  val LABEL_EDIT = "edit"
  /** holds label subscribe*/
  val LABEL_SUBSCRIBE = "subscribe"

  private val LABEL_PASSED = "passed"
  private val LABEL_TASKS = "tasks"
  private final val LABEL_SUCCESS = "success"
  /** all interactions with tasks are done via a taskService*/
  @Autowired
  val taskService: TaskService = null

  /**
    * getSubscribedCoursesByUser search courses by a single user
    *
    * @author Benjamin Manns
    * @param userid identifies a user
    * @return List of Maps
    */
  def getSubscribedCoursesByUser(userid: Int): List[Map[String, String]] = {
   // TODO filter nach Course Lifetime
    DB.query("SELECT c.* FROM user_course hc join course c using(course_id) where user_id = ? and hc.role_id = 16",
      (res, _) => {
        Map(CourseDBLabels.courseid -> res.getString(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
            CourseDBLabels.course_modul_id -> res.getString(CourseDBLabels.course_modul_id),
          CourseDBLabels.course_semester -> res.getString(CourseDBLabels.course_semester)
          // TODO course_lifetime
        )
      }, userid)
  }

  /**
    * Union all courses beloning to user, no difference in edit, creation or subscription relation
    * @author Benjamin Manns
    * @param user a User object
    * @return List of Maps
    */
  def getAllKindOfCoursesByUser(user: User): List[Map[String, Any]] = {
    DB.query("SELECT c.*, r.* FROM user_course hc JOIN course c using(course_id) join role r  using(role_id) where user_id = ?",
      (res, _) => {
        Map(CourseDBLabels.courseid -> res.getInt(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
          RoleDBLabels.role_name  -> res.getString(RoleDBLabels.role_name),
          RoleDBLabels.role_id  -> res.getString(RoleDBLabels.role_id),
          CourseDBLabels.course_modul_id -> res.getString(CourseDBLabels.course_modul_id),
          CourseDBLabels.course_semester -> res.getString(CourseDBLabels.course_semester),
          "course_docent" -> getCourseDocent(res.getInt(CourseDBLabels.courseid)),
          "course_tutor" -> getCourseTutor(res.getInt(CourseDBLabels.courseid)))
      }, user.userid)
  }

  /**
    * get list of all docent belonging to one course
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @return Scala List
    */
  def getCourseDocent(courseid: Int): List[Map[String, String]] = {
    DB.query("SELECT * FROM user_course uc join user using(user_id) where course_id = ? and uc.role_id = 4",
      (res, _) => {
        Map(UserDBLabels.user_id -> res.getString(UserDBLabels.user_id),
          UserDBLabels.prename -> res.getString(UserDBLabels.prename),
          UserDBLabels.surname -> res.getString(UserDBLabels.surname),
          UserDBLabels.email -> res.getString(UserDBLabels.email))
      }, courseid)
  }
  /**
    * get list of all tutor belonging to one course
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @return Scala List
    */
  def getCourseTutor(courseid: Int): List[Map[String, String]] = {
    DB.query("SELECT * FROM user_course uc join user using(user_id) where course_id = ? and uc.role_id = 8",
      (res, _) => {
        Map(UserDBLabels.user_id -> res.getString(UserDBLabels.user_id),
          UserDBLabels.prename -> res.getString(UserDBLabels.prename),
          UserDBLabels.surname -> res.getString(UserDBLabels.surname),
          UserDBLabels.email -> res.getString(UserDBLabels.email))
      }, courseid)
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
    * Get all subscribed students form one course
    * @param courseid unique identification for a course
    * @return Scala List
    */
  def getStudentsFromCourse(courseid: Int): List[Map[String, Any]] = {
    val list = DB.query("select u.*, uc.* from user_course uc join user u using(user_id) where course_id = ? and uc.role_id = 16",
      (res, _) => {Map(UserDBLabels.user_id -> res.getInt(UserDBLabels.user_id),
        UserDBLabels.prename -> res.getString(UserDBLabels.prename),
        UserDBLabels.surname -> res.getString(UserDBLabels.surname),
        UserDBLabels.username -> res.getString(UserDBLabels.username)) }
      , courseid)
    list
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
    * grant docent rights to a user for a course
    * Important: This has to be done only and only alone by a moderator
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON (contains information if grant worked or not)
    * @throws BadRequestException If the grant type is invalid.
    */
  def grandUserAsDocentForACourse(courseid: Int, user: User): Map[String, Boolean] = {
    val num = DB.update("insert into user_course (user_id,course_id,role_id) VALUES (?,?,4) ON DUPLICATE KEY UPDATE role_id=4",
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
    * deny docent rights for a user for a course if this user was a docent
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param user a user object
    * @return JSON (contains information if grant worked or not)
    */
  def denyUserAsDocentForACourse(courseid: Int, user: User): Map[String, Boolean] = {
    val num = DB.update("delete from user_course where user_id = ? and course_id = ? and role_id = 4",
      user.userid, courseid)
    Map(LABEL_SUCCESS-> (num == 1))
  }

  /**
    * getAllCourses gives few information about all courses for searchin purpose
    * @param user a user object
    * @author Benjamin Manns
    * @return Scala List
    */
  def getAllCourses(user: User): List[Map[String, Any]] = {
    DB.query("select * from course c left join (select * from user_course uc where uc.user_id = ?) u " +
      " on c.course_id = u.course_id left JOIN role r using(role_id)", (res, _) => {
      Map(CourseDBLabels.courseid -> res.getInt(CourseDBLabels.courseid),
        CourseDBLabels.name -> res.getString(CourseDBLabels.name),
        CourseDBLabels.description -> res.getString(CourseDBLabels.description),
        CourseDBLabels.course_modul_id -> res.getString(CourseDBLabels.course_modul_id),
        CourseDBLabels.course_semester -> res.getString(CourseDBLabels.course_semester),
        RoleDBLabels.role_name -> res.getString(RoleDBLabels.role_name),
        "course_docent" -> getCourseDocent(res.getInt(CourseDBLabels.courseid)),
        "course_tutor" -> getCourseTutor(res.getInt(CourseDBLabels.courseid)))
    }, user.userid)
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

    val selectPart = "course_id, course_name, course_description" + (if (isPermitted) {
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
          LABEL_TASKS -> taskList
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
  @deprecated("0", "1")
  def getAllSubmissionsFromAllUsersByCourses(courseid: Int): List[Map[String, Any]] = {
    DB.query("select * from task t join course c using(course_id)  where c.course_id = ? order by t.task_id",
      (res, _) => {
        Map(CourseDBLabels.courseid -> res.getString(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
          CourseDBLabels.creator -> res.getString(CourseDBLabels.creator),
          "submissions" -> this.taskService.getSubmissionsByTask(res.getInt(TaskDBLabels.taskid)))
      }, courseid)
  }

  /**
    * Only permitted for docents / moderator / admins
    * This method returns a submissions matrix of all users for one course
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @return Scala List
    */
  def getSubmissionsMatrixByCourse(courseid: Int): List[Any] = {
    val tasks = taskService.getTasksByCourse(courseid)
    val subscribedStudents = this.getStudentsFromCourse(courseid)
    val taskShortLabels = List.range(1, tasks.length + 1, 1).map(f => "A" + f.toString).reverse
    var matrix: List[Any] = List()

    for(u <- subscribedStudents){
      var tasksPassedSum = 0
      var processedTasks: List[Any] = List()
      for((task, i) <- tasks.zipWithIndex){
        val userSubmissions = taskService.getSubmissionsByTaskAndUser(task(TaskDBLabels.taskid), u("user_id"))
          /* processing - number of trials - passed - passed date */
        var passed: Boolean = false
        var passedDate: Any = ""
        var trials = 0
        for(submission <- userSubmissions) {
          if (!passed && submission(LABEL_PASSED) == 1) {
            passed = true
            passedDate = submission("submit_date")
          }
          else {
            // Also again passed trials are counted, because they are useless!
            trials += 1
          }
        }
        tasksPassedSum = tasksPassedSum + passed.compare(false)
        val taskStudentCell = Map( taskShortLabels(i) -> Map(TaskDBLabels.name -> task(TaskDBLabels.name),
          TaskDBLabels.taskid -> task(TaskDBLabels.taskid), "trials" -> trials, LABEL_PASSED -> passed, "passed_date" -> passedDate))

        processedTasks = taskStudentCell :: processedTasks
      }
      val studentLine = Map(LABEL_TASKS  -> processedTasks, UserDBLabels.username -> u(UserDBLabels.username), UserDBLabels.user_id -> u(UserDBLabels.user_id),
        UserDBLabels.prename -> u(UserDBLabels.prename), UserDBLabels.surname -> u(UserDBLabels.surname), LABEL_PASSED ->  tasksPassedSum)
      matrix = studentLine :: matrix
    }
    matrix
  }

  /**
    * get submission matrix as student.
    * @author Benjamin Manns
    * @param userid unique identification for a user
    * @return Big Scala Map
    */
  def getSubmissionsMatrixByUser(userid: Int): List[Any] = {
    val courseList = this.getSubscribedCoursesByUser(userid)
    var matrix: List[Any] = List()
    for (course <- courseList) {
      val courseTasks = taskService.getTasksByCourse(Integer.parseInt(course(CourseDBLabels.courseid)))
      val taskShortLabels = List.range(1, courseTasks.length + 1, 1).map(f => "A" + f.toString).reverse

      var processedTasks: List[Any] = List()
      var deadlines: List[String] = List()
      for((task, i) <- courseTasks.zipWithIndex) {
        val submissionRawData = this.taskService.getSubmissionsByTaskAndUser(task(TaskDBLabels.taskid), userid)
        // process them
        var passed: Boolean = false
        var passedDate: Any = ""
        var trials = 0
        for (submission <- submissionRawData) {
          if (!passed && submission(LABEL_PASSED) == 1) {
            passed = true
            passedDate = submission("submit_date")
          }
          else {
            // Also again passed trials are counted, because they are useless!
            trials += 1
          }
        }

        val taskStudentCell = Map(taskShortLabels(i) -> Map(TaskDBLabels.name -> task(TaskDBLabels.name),
          TaskDBLabels.taskid -> task(TaskDBLabels.taskid), "trials" -> trials, LABEL_PASSED -> passed,
          "passed_date" -> passedDate, TaskDBLabels.deadline -> task(TaskDBLabels.deadline)))
        deadlines = task(TaskDBLabels.deadline) :: deadlines
        processedTasks = taskStudentCell :: processedTasks
      }
      val courseLine = Map(LABEL_TASKS  -> processedTasks, "deadlines" -> deadlines)
      matrix = courseLine ++ course.map{ case (k, v) => k -> (v + courseLine.getOrElse(k.toString, 0))} :: matrix
    }
    matrix
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
    * @param course_modul_id Based on Modul Descriptino its modul name
    * @param course_semester semester where this course will be available
    * @param anonym_submission anonym submissions, if no every task and submission will be deleted.
    * @return Scala Map
    * @throws RuntimeException
    */
  def createCourseByUser(user: User, name: String, description: String, standard_task_typ: String,
                         course_modul_id: String, course_semester: String, anonym_submission: Int = 0): Map[String, Number] = {
    val (num, holder) = DB.update((con: Connection) => {
      val ps = con.prepareStatement(
        "insert into course (course_name, course_description, creator, standard_task_type, course_modul_id, " +
          "course_semester, anonym_submission) values (?,?,?,?,?,?,?)",
        Statement.RETURN_GENERATED_KEYS
      )
      ps.setString(1, name)
      ps.setString(2, description)
      ps.setInt(3, user.userid)
      val m4 = 4
      val m5 = 5
      val m6 = 6
      val m7 = 7
      ps.setString(m4, standard_task_typ)
      ps.setString(m5, course_modul_id)
      ps.setString(m6, course_semester)
      ps.setInt(m7, anonym_submission)
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
    * @param course_modul_id Based on Modul Descriptino its modul name
    * @param course_semester semester where this course will be available
    * @return Scala Map
    * @throws ResourceNotFoundException
    */
  def updateCourse(courseid: Int, name: String, description: String, standard_task_typ: String,
                   course_modul_id: String, course_semester: String): Map[String, Boolean] = {
    val success = DB.update("update course set course_name = ?, course_description = ?, standard_task_type = ?, " +
      "course_modul_id = ?, course_semester = ? where course_id = ?",
      name, description, standard_task_typ, course_modul_id, course_semester, courseid)
    if (success == 0) {
      throw new ResourceNotFoundException
    }
    else {
      Map(LABEL_SUCCESS -> true)
    }
  }

  /**
    * get a List of all submissions and information from which course
    * @author Benjamin Manns
    * @param user User who wants to see all his submissions
    * @return a List of all Submissions ordered by submissiondate
    */
  @deprecated("0", "1")
  def getAllSubmissionsForAllCoursesByUser(user: User): List[Map[String, Any]] = {
    DB.query("select * from submission join task using(task_id) join course using(course_id) where user_id = ? " +
    "order by submit_date desc", (res, _) => {
      Map(TaskDBLabels.name -> res.getString(TaskDBLabels.name),
        TaskDBLabels.description -> res.getString(TaskDBLabels.description),
        CourseDBLabels.name -> res.getString(CourseDBLabels.name),
        CourseDBLabels.description -> res.getString(CourseDBLabels.description),
        SubmissionDBLabels.passed->res.getInt(SubmissionDBLabels.passed),
        SubmissionDBLabels.exitcode ->res.getString(SubmissionDBLabels.exitcode),
        SubmissionDBLabels.result ->res.getString(SubmissionDBLabels.result),
        SubmissionDBLabels.submit_date->res.getTimestamp(SubmissionDBLabels.submit_date),
        SubmissionDBLabels.result_date->res.getTimestamp(SubmissionDBLabels.result_date),
        CourseDBLabels.courseid -> res.getInt(CourseDBLabels.courseid),
        TaskDBLabels.taskid-> res.getInt(TaskDBLabels.taskid),
        SubmissionDBLabels.submissionid -> res.getInt(SubmissionDBLabels.submissionid))
    }, user.userid)
  }
}
