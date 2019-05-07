package de.thm.ii.submissioncheck.services

import java.io
import java.nio.file.{Files, Path, Paths}
import java.sql.{Connection, Statement}
import java.util.zip.{ZipEntry, ZipOutputStream}

import de.thm.ii.submissioncheck.CourseParameterDBLabels
import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
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
  private final val LABEL_ZIPDIR = "zip-dir"
  private final val LABEL_UPLOADDIR = "upload-dir"
  private final val LABEL_UNDERLINE = "_"
  private final val LABEL_COURSE_TUTOR = "course_tutor"
  private final val LABEL_COURSE_DOCENT = "course_docent"

  /** all interactions with tasks are done via a taskService*/
  @Autowired
  val taskService: TaskService = null

  /**
    * getSubscribedCoursesByUser search courses by a single user
    *
    * @author Benjamin Manns
    * @param userid identifies a user
    * @param check_course_lifetime if true only list courses which have not ended yet
    * @return List of Maps
    */
  def getSubscribedCoursesByUser(userid: Int, check_course_lifetime: Boolean = false): List[Map[String, Any]] = {
    val snippet = if (check_course_lifetime) "and (c.course_end_date is null or CURRENT_DATE() <= c.course_end_date)" else ""
    DB.query("SELECT c.* FROM user_course hc join course c using(course_id) where user_id = ? and hc.role_id = 16 " + snippet,
      (res, _) => {
        Map(CourseDBLabels.courseid -> res.getInt(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
            CourseDBLabels.course_modul_id -> res.getString(CourseDBLabels.course_modul_id),
          CourseDBLabels.course_semester -> res.getString(CourseDBLabels.course_semester),
          CourseDBLabels.course_end_date-> res.getTimestamp(CourseDBLabels.course_end_date)
        )
      }, userid)
  }

  /**
    * get a list of student users which subscri
    * @param courseid unique identification for a course
    * @param roleids subscribed user type
    * @return List of User
    */
  def getSubscribedUserByCourse(courseid: Int, roleids: List[Int]): List[User] = {
    DB.query("SELECT u.*, r.* FROM user_course hc join user u using(user_id) join role r on r.role_id = hc.role_id" +
      " where hc.course_id = ? and hc.role_id IN ?",
    (res, _) => {
      new User(res.getInt(UserDBLabels.user_id), res.getString(UserDBLabels.username), res.getString(UserDBLabels.prename),
        res.getString(UserDBLabels.surname), res.getString(UserDBLabels.email)
      , res.getString(UserDBLabels.role_name), res.getInt(UserDBLabels.role_id), res.getBoolean(UserDBLabels.privacy_checked))
    }, courseid, roleids)
  }

  /**
    * Union all courses beloning to user, no difference in edit, creation or subscription relation
    * @author Benjamin Manns
    * @param user a User object
    * @param hiddenCourses show also hidden courses
    * @return List of Maps
    */
  def getAllKindOfCoursesByUser(user: User, hiddenCourses: Boolean): List[Map[String, Any]] = {
    val hiddenCoursesSQL = if (!hiddenCourses) {
      " c.course_visibility = 'VISIBLE'"
    } else {
      " 1 = 1 "
    }

    val sql = (if (user.roleid <= 2) {
      "SELECT *, ? as requesting_user  FROM course c join role r on r.role_id = " + user.roleid + " where "
    } else {
      "SELECT c.*, r.* FROM user_course hc JOIN course c using(course_id) join role r  using(role_id) where user_id = ? AND "
    }) + hiddenCoursesSQL

    DB.query(sql, (res, _) => {
        Map(CourseDBLabels.courseid -> res.getInt(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
          RoleDBLabels.role_name  -> res.getString(RoleDBLabels.role_name),
          RoleDBLabels.role_id  -> res.getInt(RoleDBLabels.role_id),
          CourseDBLabels.course_modul_id -> res.getString(CourseDBLabels.course_modul_id),
          CourseDBLabels.course_semester -> res.getString(CourseDBLabels.course_semester),
          CourseDBLabels.course_end_date-> res.getTimestamp(CourseDBLabels.course_end_date),
          CourseDBLabels.personalised_submission-> res.getString(CourseDBLabels.personalised_submission),
          LABEL_COURSE_DOCENT -> getCourseDocent(res.getInt(CourseDBLabels.courseid)),
          LABEL_COURSE_TUTOR -> getCourseTutor(res.getInt(CourseDBLabels.courseid)))
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
    if (user.role == "admin" || user.roleid == 2) {
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
    * set a visibility flag for a course. There are currently only HIDDEN and VISIBLE
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param typ which type of visible should be set
    * @return Map of success case
    */
  def setVisibilityForCourse(courseid: Int, typ: String): Map[String, Boolean] = {
    if (!List("HIDDEN", "VISIBLE").contains(typ)) {
      Map(LABEL_SUCCESS -> false)
    } else {
      val num = DB.update("update course set course_visibility = ? where course_id = ?", typ, courseid)
      Map(LABEL_SUCCESS-> (num == 1))
    }
  }

  /**
    * getAllCourses gives few information about all courses for searchin purpose
    * @param user a user object
    * @param hiddenCourses returns also hidden courses if set true
    * @author Benjamin Manns
    * @return Scala List
    */
  def getAllCourses(user: User, hiddenCourses: Boolean): List[Map[String, Any]] = {
    val hiddenCoursesSQL = if (!hiddenCourses) {
      " c.course_visibility = 'VISIBLE'"
    } else {
      " 1 = 1 "
    }

    DB.query("select * from course c left join (select * from user_course uc where uc.user_id = ?) u " +
      " on c.course_id = u.course_id left JOIN role r using(role_id) WHERE " + hiddenCoursesSQL, (res, _) => {
      Map(CourseDBLabels.courseid -> res.getInt(CourseDBLabels.courseid),
        CourseDBLabels.name -> res.getString(CourseDBLabels.name),
        CourseDBLabels.description -> res.getString(CourseDBLabels.description),
        CourseDBLabels.course_modul_id -> res.getString(CourseDBLabels.course_modul_id),
        CourseDBLabels.course_semester -> res.getString(CourseDBLabels.course_semester),
        RoleDBLabels.role_name -> res.getString(RoleDBLabels.role_name),
        CourseDBLabels.course_end_date-> res.getTimestamp(CourseDBLabels.course_end_date),
        CourseDBLabels.personalised_submission-> res.getBoolean(CourseDBLabels.personalised_submission),
        LABEL_COURSE_DOCENT -> getCourseDocent(res.getInt(CourseDBLabels.courseid)),
        LABEL_COURSE_TUTOR -> getCourseTutor(res.getInt(CourseDBLabels.courseid)))
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

    val selectPart = "c.course_id, c.standard_task_typ, c.course_name, c.course_end_date, c.course_description, c.course_modul_id, " +
      "c.course_semester, c.personalised_submission, t.role_id, t.role_name" + (if (isPermitted) {
      ", c.creator" // TODO add more columns
    } else {
      ""
    })

    val taskList = if (isPermitted || this.isSubscriberForCourse(courseid, user) || user.roleid == 1 || user.roleid == 2) {
      this.taskService.getTasksByCourse(courseid, Some(user.userid))
    } else {
      List.empty
    }

    val sql = if (user.roleid <= 2) {
      "SELECT *, ? as requested_user from course c join role r on r.role_id = " + user.roleid + " where c.course_id = ?"
    } else {
      "SELECT " + selectPart + " from course c left join (select user_id, role_id, role_name, course_id from " +
        "user_course join role using(role_id) where user_id = ?) t on t.course_id = c.course_id where c.course_id = ?"
    }

    val list = DB.query(sql,
      (res, _) => {
        val courseMap = Map(
          CourseDBLabels.courseid -> res.getInt(CourseDBLabels.courseid),
          CourseDBLabels.name -> res.getString(CourseDBLabels.name),
          CourseDBLabels.description -> res.getString(CourseDBLabels.description),
          CourseDBLabels.course_end_date -> res.getTimestamp(CourseDBLabels.course_end_date),
          CourseDBLabels.course_modul_id -> res.getString(CourseDBLabels.course_modul_id),
          CourseDBLabels.course_semester -> res.getString(CourseDBLabels.course_semester),
          CourseDBLabels.personalised_submission-> res.getBoolean(CourseDBLabels.personalised_submission),
          CourseDBLabels.standard_task_typ -> res.getString(CourseDBLabels.standard_task_typ),
          LABEL_COURSE_DOCENT -> getCourseDocent(res.getInt(CourseDBLabels.courseid)),
          LABEL_COURSE_TUTOR -> getCourseTutor(res.getInt(CourseDBLabels.courseid)),
          RoleDBLabels.role_id -> res.getInt(RoleDBLabels.role_id),
          RoleDBLabels.role_name  -> res.getString(RoleDBLabels.role_name),
          LABEL_TASKS -> taskList
        )
        if (isPermitted) {
          courseMap + (CourseDBLabels.creator -> res.getInt(CourseDBLabels.creator))
        } else {
          courseMap
        }
      }, user.userid, courseid)

    list.headOption
  }

  private def zip(out: Path, files: Iterable[Path], replacePath: String = "") = {
    val zip = new ZipOutputStream(Files.newOutputStream(out))

    files.foreach { file =>
      zip.putNextEntry(new ZipEntry(file.toString.replace(replacePath, "")))
      try {
        Files.copy(file, zip)
      } catch {
        case _: java.nio.file.NoSuchFileException => {}
      }
      zip.closeEntry()
    }
    zip.close()
  }

  /**
    * I have to apologize that I somehow think in the php way. Therefor I need this implode method
    * @param list contains items which will be glued by a given string
    * @param glue is somehow the opposite from a split delimeter
    * @return items glued together as a string
    */
  private def implode(list: List[String], glue: String) = {
    var back = ""
    for ((l, index) <- list.zipWithIndex) {
      back += l + (if (index < list.length-1) glue else "")
    }
    back
  }

  /**
    * generate Zip file and return its path of all users submission of one course
    * @author Benjamin Manns
    * @param only_last_try if enabled, we only inlcude the last submission of the user
    * @param courseid unique course identification
    * @return local Path of generated Zip File
    */
  def zipOfSubmissionsOfUsersFromCourse(only_last_try: Boolean, courseid: Integer): String = {
    var allPath: List[Path] = List()
    val tmp_folder = Secrets.getSHAStringFromNow()
    Files.createDirectories(Paths.get(LABEL_ZIPDIR).resolve(tmp_folder))

    val studentList = getStudentsFromCourse(courseid)

    for (task <- taskService.getTasksByCourse(courseid)) {
      var last_submission_date: String = null
      val taskPath = Paths.get(LABEL_UPLOADDIR).resolve(task(TaskDBLabels.taskid).toString).resolve("submits")

      for (student <- studentList) {
        var tmpZiptaskPath: Path = null
        var studentSubmissionList = taskService.getSubmissionsByTaskAndUser(task(TaskDBLabels.taskid).toString, student(UserDBLabels.user_id), "desc")
        if (only_last_try) studentSubmissionList = (if (studentSubmissionList.isEmpty) List() else List(studentSubmissionList(0)))
        for ((submission, i) <- studentSubmissionList.zipWithIndex) {
          if (i == 0) {
            last_submission_date = submission(SubmissionDBLabels.submit_date).asInstanceOf[String].replace(":",
              LABEL_UNDERLINE).replace(" ", "")
            tmpZiptaskPath = Paths.get(LABEL_ZIPDIR).resolve(tmp_folder).resolve(implode(List(student(UserDBLabels.username).asInstanceOf[String],
              task(TaskDBLabels.taskid).toString, last_submission_date), LABEL_UNDERLINE))
            Files.createDirectories(tmpZiptaskPath)
          }

          // create path out of this
          val filePath = taskPath.resolve(submission(SubmissionDBLabels.submissionid).asInstanceOf[String])
            .resolve(stringOrNull(submission(SubmissionDBLabels.filename)))
          val goalPath = tmpZiptaskPath.resolve(submission(SubmissionDBLabels.submissionid) + LABEL_UNDERLINE + submission(SubmissionDBLabels.filename))
          allPath = goalPath :: allPath

          try {
            Files.copy(filePath, Files.newOutputStream(goalPath))
          }
          catch {
            case _: java.nio.file.NoSuchFileException => {}
          }
        }
      }
    }
    val finishZipPath = "zip-dir/abgabe_course_" + courseid.toString + LABEL_UNDERLINE + tmp_folder + ".zip"
    zip(Paths.get(finishZipPath), allPath, Paths.get(LABEL_ZIPDIR).resolve(tmp_folder).toString)
    finishZipPath
  }

  private def stringOrNull(any: Any): String = {
    if (any == null) {
      null
    } else {
      any.toString
    }
  }

  /**
    * generate Zip file and return its path of one users submission of one course
    * @author Benjamin Manns
    * @param only_last_try if enabled, we only inlcude the last submission of the user
    * @param courseid unique course identification
    * @param user single user submission
    * @return local Path of generated Zip File
    */
  def zipOfSubmissionsOfUserFromCourse(only_last_try: Boolean, courseid: Integer, user: User): String = {
    var allPath: List[Path] = List()
    val tmp_folder = Secrets.getSHAStringFromNow()
    Files.createDirectories(Paths.get(LABEL_ZIPDIR).resolve(tmp_folder))

    for (task <- taskService.getTasksByCourse(courseid)) {
      var last_submission_date: String = null
      val taskPath = Paths.get(LABEL_UPLOADDIR).resolve(task(TaskDBLabels.taskid).toString).resolve("submits")

      var tmpZiptaskPath: Path = null
      var studentSubmissionList = taskService.getSubmissionsByTaskAndUser(task(TaskDBLabels.taskid).toString, user.userid, "desc")
      if (only_last_try) studentSubmissionList = (if (studentSubmissionList.isEmpty) List() else List(studentSubmissionList(0)))
      for((submission, i) <- studentSubmissionList.zipWithIndex) {
        if (i == 0) {
          last_submission_date = submission(SubmissionDBLabels.submit_date).asInstanceOf[String].replace(":",
            LABEL_UNDERLINE).replace(" ", "")
          tmpZiptaskPath = Paths.get(LABEL_ZIPDIR).resolve(tmp_folder).resolve(implode(List(user.username,
            task(TaskDBLabels.taskid).toString, last_submission_date), LABEL_UNDERLINE))
          Files.createDirectories(tmpZiptaskPath)
        }
        // create path out of this
        val filePath = taskPath.resolve(submission(SubmissionDBLabels.submissionid).asInstanceOf[String])
          .resolve(stringOrNull(submission(SubmissionDBLabels.filename)))
        val goalPath = tmpZiptaskPath.resolve(submission(SubmissionDBLabels.submissionid) + LABEL_UNDERLINE + submission(SubmissionDBLabels.filename))
        allPath = goalPath :: allPath

        try{
          Files.copy(filePath, Files.newOutputStream(goalPath))
        }
        catch {
          case _: java.nio.file.NoSuchFileException => {}
        }
      }
    }
    val finishZipPath = "zip-dir/abgabe_" + user.username + LABEL_UNDERLINE + tmp_folder + ".zip"
    zip(Paths.get(finishZipPath), allPath, Paths.get(LABEL_ZIPDIR).resolve(tmp_folder).toString)
    finishZipPath
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
    val tasks = taskService.getTasksByCourse(courseid).reverse
    val subscribedStudents = this.getStudentsFromCourse(courseid)
    val taskShortLabels = List.range(1, tasks.length + 1, 1).map(f => "A" + f.toString)
    var matrix: List[Any] = List()

    for(u <- subscribedStudents){
      var tasksPassedSum = 0
      var processedTasks: List[Any] = List()
      for((task, i) <- tasks.zipWithIndex){
        val userSubmissions = taskService.getSubmissionsByTaskAndUser(task(TaskDBLabels.taskid).toString, u("user_id"))
          /* processing - number of trials - passed - passed date */
        var passed: Boolean = false
        var passedDate: Any = null
        var passed_string: String = null
        var coll_result_date: Any = null
        for(submission <- userSubmissions) {
          if (coll_result_date == null) {
            coll_result_date = submission("result_date")
          }
          if (!passed && submission(LABEL_PASSED).asInstanceOf[Boolean]) {
            passed = true
            passedDate = submission("submit_date")
          }
        }

        if (!passed && coll_result_date == null) {
          passed_string = null
        } else {
          passed_string = passed.toString
        }

        tasksPassedSum = tasksPassedSum + passed.compare(false)
        val taskStudentCell = Map( taskShortLabels(i) -> Map(TaskDBLabels.name -> task(TaskDBLabels.name),
          TaskDBLabels.taskid -> task(TaskDBLabels.taskid), "trials" -> userSubmissions.length, LABEL_PASSED -> passed_string, "passed_date" -> passedDate))

        processedTasks = taskStudentCell :: processedTasks
      }
      val passed_glob = (processedTasks.length == tasksPassedSum)
      val studentLine = Map(LABEL_TASKS  -> processedTasks, UserDBLabels.username -> u(UserDBLabels.username),
        UserDBLabels.user_id -> u(UserDBLabels.user_id),
        UserDBLabels.prename -> u(UserDBLabels.prename), UserDBLabels.surname -> u(UserDBLabels.surname),
        LABEL_PASSED -> (if (passed_glob) 1 else 0))
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
    var courseList = this.getSubscribedCoursesByUser(userid, true)
    var matrix: List[Any] = List()
    for (course <- courseList) {
      val courseTasks = taskService.getTasksByCourse(course(CourseDBLabels.courseid).asInstanceOf[Int])
      val taskShortLabels = List.range(1, courseTasks.length + 1, 1).map(f => "A" + f.toString)

      var processedTasks: List[Any] = List()
      var deadlines: List[String] = List()
      for((task, i) <- courseTasks.zipWithIndex) {
        val submissionRawData = this.taskService.getSubmissionsByTaskAndUser(task(TaskDBLabels.taskid).toString, userid)
        // process them
        var passed_string: String = null
        var passedDate: Any = null
        var coll_result_date: Any = null
        if (submissionRawData.length == 0) {
          passed_string = null
        } else {
          var passed: Boolean = false
          for (submission <- submissionRawData) {
            if (coll_result_date == null) {
              coll_result_date = submission("result_date")
            }
            if (!passed && submission(LABEL_PASSED).asInstanceOf[Boolean]) {
              passed = true
              passedDate = submission("submit_date")
            }
          }
          if (!passed && coll_result_date == null) {
            passed_string = null
          } else {
            passed_string = passed.toString
          }
        }

        val taskStudentCell = Map(taskShortLabels(i) -> Map(TaskDBLabels.name -> task(TaskDBLabels.name),
          TaskDBLabels.taskid -> task(TaskDBLabels.taskid), "trials" -> submissionRawData.length, LABEL_PASSED -> passed_string,
          "passed_date" -> passedDate, TaskDBLabels.deadline -> task(TaskDBLabels.deadline)))
        deadlines = stringOrNull(task(TaskDBLabels.deadline)) :: deadlines
        processedTasks = taskStudentCell :: processedTasks
      }
      var courseLine: Map[String, Any] = Map(LABEL_TASKS  -> processedTasks, "deadlines" -> deadlines)

      for(c <- course.keys){
        courseLine = courseLine + (c -> course(c))
      }

      matrix = courseLine :: matrix
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
    * @param course_end_date date when course will be unvisible because it is out of date then
    * @param personalised_submission personalised submissions, if true every task and submission will be deleted after user deletion
    * @return Scala Map
    * @throws RuntimeException
    */
  def createCourseByUser(user: User, name: String, description: String, standard_task_typ: String,
                         course_modul_id: String, course_semester: String, course_end_date: String, personalised_submission: Int = 0): Map[String, Any] = {
    val (num, holder) = DB.update((con: Connection) => {
      val ps = con.prepareStatement(
        "insert into course (course_name, course_description, creator, standard_task_typ, course_modul_id, " +
          "course_semester, personalised_submission, course_end_date) values (?,?,?,?,?,?,?,?)",
        Statement.RETURN_GENERATED_KEYS
      )
      ps.setString(1, name)
      ps.setString(2, description)
      ps.setInt(3, user.userid)
      val m4 = 4
      val m5 = 5
      val m6 = 6
      val m7 = 7
      val m8 = 8
      ps.setString(m4, standard_task_typ)
      ps.setString(m5, course_modul_id)
      ps.setString(m6, course_semester)
      ps.setInt(m7, personalised_submission)
      ps.setString(m8, course_end_date)
      ps
    })
    if (num < 1) {
      throw new RuntimeException("Error creating course.")
    }
    Map("course_id" -> holder.getKey, "success" -> true)
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
    * @param course_end_date date when course will be unvisible because it is out of date then
    * @param personalised_submission personalised submissions, if true every task and submission will be deleted after user deletion
    * @return Scala Map
    * @throws ResourceNotFoundException
    */
  def updateCourse(courseid: Int, name: String = null, description: String = null, standard_task_typ: String = null,
                   course_modul_id: String = null, course_semester: String = null, course_end_date: String = null,
                   personalised_submission: String = null): Map[String, Boolean] = {
    var updates = 0
    var suceeds = 0
    if (name != null) { suceeds += DB.update("update course set course_name = ? where course_id = ?", name, courseid); updates += 1 }
    if (description != null) { suceeds += DB.update("update course set course_description = ? where course_id = ?", description, courseid); updates += 1 }
    if (standard_task_typ != null) { suceeds += DB.update("update course set standard_task_typ = ? where course_id = ?",
      standard_task_typ, courseid); updates += 1 }
    if (course_modul_id != null) { suceeds += DB.update("update course set course_modul_id = ? where course_id = ?", course_modul_id, courseid); updates += 1 }
    if (course_semester != null) { suceeds += DB.update("update course set course_semester = ? where course_id = ?", course_semester, courseid); updates += 1 }
    if (course_end_date != null) { suceeds += DB.update("update course set course_end_date = ? where course_id = ?", course_end_date, courseid); updates += 1 }
    if (personalised_submission != null) {
      val dbBool = if (personalised_submission == "true") 1 else 0
      suceeds += DB.update("update course set personalised_submission = ? where course_id = ?", dbBool, courseid)
      updates += 1
    }
    Map(LABEL_SUCCESS -> (updates == suceeds))
  }

  private def getNullOrBoolean(boolDBString: String) = {
    if (boolDBString == null) {
      null
    } else {
      boolDBString.toInt > 0
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
        CourseDBLabels.course_end_date-> res.getString(CourseDBLabels.course_end_date),
        SubmissionDBLabels.passed->getNullOrBoolean(res.getString(SubmissionDBLabels.passed)),
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
