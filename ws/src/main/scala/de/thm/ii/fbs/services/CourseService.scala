package de.thm.ii.fbs.services

import java.io
import java.nio.file.{Files, Path, Paths}
import java.sql.{Connection, Statement, Timestamp}
import java.text.SimpleDateFormat
import java.util.Date

import de.thm.ii.fbs.model.{AdminUser, SimpleUser, User}
import de.thm.ii.fbs.security.Secrets
import de.thm.ii.fbs.util.{BadRequestException, DB, JsonParser, ResourceNotFoundException}
import org.springframework.beans.factory.annotation.{Autowired, Value}
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
  private var LABEL_ZIPDIR = "zip-dir"
  private var LABEL_UPLOADDIR = "upload-dir"
  private final val LABEL_TRUE = "true"
  private final val LABEL_DESC = "desc"
  private final val LABEL_COURSE_JSON = "course.json"
  private final val LABEL_COURSE = "course"
  @Value("${compile.production}")
  private val compile_production: Boolean = true

  private val sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")

  private val LABEL_PASSED = "passed"
  private val LABEL_TASKS = "tasks"
  private val LABEL_SUBMITS = "submits"
  private final val LABEL_SUCCESS = "success"
  private final val LABEL_UNDERLINE = "_"
  private final val LABEL_COURSE_TUTOR = "course_tutor"
  private final val LABEL_COURSE_DOCENT = "course_docent"

  /** all interactions with tasks are done via a taskService*/
  @Autowired
  val taskService: TaskService = null
  @Autowired
  private val submissionService: SubmissionService = null
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
          CourseDBLabels.course_end_date-> nullSafeTime(res.getTimestamp(CourseDBLabels.course_end_date))
        )
      }, userid)
  }

  private def getZIPDIR = {
    Paths.get(System.getProperty("java.io.tmpdir")).resolve(LABEL_ZIPDIR)
  }

  private def getUPLOADDIR = {
    (if (compile_production) "/" else "") + LABEL_UPLOADDIR
  }

  /**
    * get a list of student users which subscri
    * @param courseid unique identification for a course
    * @param roleids subscribed user type
    * @return List of User
    */
  def getSubscribedUserByCourse(courseid: Int, roleids: List[Int]): List[User] = {
    val sqlList = "(" + roleids.map(a => a.toString).reduce((a, b) => s"${a}, ${b}") + ")"
    DB.query("SELECT u.user_id, u.username, u.prename, u.surname, u.email, r.role_name, hc.role_id, u.privacy_checked " +
      "FROM user_course hc " +
      "join user u using(user_id) " +
      "join role r on r.role_id = hc.role_id" +
      " where hc.course_id = ? and hc.role_id IN " + sqlList,
      (res, _) => {
        new User(res.getInt(UserDBLabels.user_id), res.getString(UserDBLabels.username), res.getString(UserDBLabels.prename),
          res.getString(UserDBLabels.surname), res.getString(UserDBLabels.email)
          , res.getString(UserDBLabels.role_name), res.getInt(UserDBLabels.role_id), res.getBoolean(UserDBLabels.privacy_checked))
      }, courseid)
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
        CourseDBLabels.course_end_date-> nullSafeTime(res.getTimestamp(CourseDBLabels.course_end_date)),
        CourseDBLabels.personalised_submission-> res.getString(CourseDBLabels.personalised_submission),
        LABEL_COURSE_DOCENT -> getCourseDocent(res.getInt(CourseDBLabels.courseid)),
        LABEL_COURSE_TUTOR -> getCourseTutor(res.getInt(CourseDBLabels.courseid)))
    }, user.userid)
  }

  private def nullSafeTime(t: Timestamp): java.lang.Long = if (t == null) null else t.getTime

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
    * get list of all courses where user is a docent
    * @author Simon Schniedenharn
    * @param user unique identification for a user
    * @return Scala List
    */
  def getCoursesAsDocent(user: User): List[Int] = {
    DB.query("SELECT uc.course_id FROM user_course uc join user using(user_id) where uc.user_id = ? and uc.role_id = 4",
      (res, _) => {
        res.getInt(CourseDBLabels.courseid)
      }, user.userid)
  }

  /**
    * get list of all courses where user is a tutor
    * @author Simon Schniedenharn
    * @param user unique identification for a user
    * @return Scala List
    */
  def getCoursesAsTutor(user: User): List[Int] = {
    DB.query("SELECT uc.course_id FROM user_course uc join user using(user_id) where uc.user_id = ? and uc.role_id = 8",
      (res, _) => {
        def test = res;
        res.getInt(CourseDBLabels.courseid)
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
    * Get all subscribed students form one course with limit and offset
    * @param courseid unique identification for a course
    * @param offset offset the user list
    * @param limit limit the user list
    * @param filter filter the user list
    * @return Scala List
    */
  def getStudentsFromCourse(courseid: Int, offset: Integer, limit: Integer, filter: String): List[Map[String, Any]] = {
    var queryArgs: List[Any] = List(courseid)
    var filterQuery = ""
    if(filter != null && filter.length > 0) {
      val filterLike = filter + "%"
      queryArgs = queryArgs ++ List(filterLike, filterLike, filterLike)
      filterQuery = " and (u.username like ? OR u.prename like ? OR u.surname like ?) "
    }

    val (qArgs, sqlAdd) = if (limit == null && offset != null){
      (List(offset), "limit ?")
    } else if (limit != null && offset == null){
      (List(limit), "limit 0,?")
    } else if (limit != null && offset != null){
      (List(offset, limit), "limit ?,?")
    } else {
      (List(), "  ")
    }

    queryArgs = queryArgs ++ qArgs // List(offset, limit)
    val list = DB.query(s"select u.*, uc.* from user_course uc join user u using(user_id) where course_id = ? and " +
      s"uc.role_id = 16 ${filterQuery} order by u.surname asc " + sqlAdd,
      (res, _) => {Map(UserDBLabels.user_id -> res.getInt(UserDBLabels.user_id),
        UserDBLabels.prename -> res.getString(UserDBLabels.prename),
        UserDBLabels.surname -> res.getString(UserDBLabels.surname),
        UserDBLabels.username -> res.getString(UserDBLabels.username)) }
      , queryArgs: _*) // decompose the list to args
    list.reverse
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
        CourseDBLabels.course_end_date-> nullSafeTime(res.getTimestamp(CourseDBLabels.course_end_date)),
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
    * @param taskid optional taskid information
    * @return Scala Map
    */
  def getCourseDetails(courseid: Int, user: User, taskid: Option[Int] = None): Option[Map[_ <: String, _ >: io.Serializable with String]] = {
    val isPermitted = this.isPermittedForCourse(courseid, user)

    val selectPart = "c.course_id, c.standard_task_typ, c.course_name, c.course_end_date, c.course_description, c.course_modul_id, " +
      "c.course_semester, c.personalised_submission, t.role_id, t.role_name, c.plagiarism_script " + (if (isPermitted) {
      ", c.creator" // TODO add more columns
    } else {
      ""
    })

    val taskList = if (taskid.isDefined) { this.taskService.getTaskDetails(taskid.get, Some(user.userid), true).getOrElse(Map.empty) }
    else if (isPermitted || this.isSubscriberForCourse(courseid, user) || user.roleid == 1 || user.roleid == 2) {
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

    val label = if (taskid.isDefined) "task" else LABEL_TASKS
    val list = DB.query(sql, (res, _) => {
      val courseMap = Map(
        CourseDBLabels.courseid -> res.getInt(CourseDBLabels.courseid), CourseDBLabels.name -> res.getString(CourseDBLabels.name),
        CourseDBLabels.description -> res.getString(CourseDBLabels.description),
        CourseDBLabels.course_end_date -> nullSafeTime(res.getTimestamp(CourseDBLabels.course_end_date)),
        CourseDBLabels.course_modul_id -> res.getString(CourseDBLabels.course_modul_id),
        CourseDBLabels.course_semester -> res.getString(CourseDBLabels.course_semester),
        CourseDBLabels.personalised_submission-> res.getBoolean(CourseDBLabels.personalised_submission),
        CourseDBLabels.standard_task_typ -> res.getString(CourseDBLabels.standard_task_typ),
        CourseDBLabels.plagiarism_script -> res.getBoolean(CourseDBLabels.plagiarism_script),
        LABEL_COURSE_DOCENT -> getCourseDocent(res.getInt(CourseDBLabels.courseid)),
        LABEL_COURSE_TUTOR -> getCourseTutor(res.getInt(CourseDBLabels.courseid)), label -> taskList,
        RoleDBLabels.role_id -> res.getInt(RoleDBLabels.role_id), RoleDBLabels.role_name  -> res.getString(RoleDBLabels.role_name))
      if (isPermitted) {
        courseMap + (CourseDBLabels.creator -> res.getInt(CourseDBLabels.creator))
      } else {
        courseMap
      }
    }, user.userid, courseid)

    list.headOption
  }

  /**
    * I have to apologize that I somehow think in the php way. Therefor I need this implode method
    * @param list contains items which will be glued by a given string
    * @param glue is somehow the opposite from a split delimeter
    * @return items glued together as a string
    */
  def implode(list: List[String], glue: String): String = {
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
    Files.createDirectories(getZIPDIR.resolve(tmp_folder))

    val studentList = getStudentsFromCourse(courseid)

    for (task <- taskService.getTasksByCourse(courseid)) {
      var last_submission_date: String = null
      val taskPath = Paths.get(getUPLOADDIR).resolve(task(TaskDBLabels.taskid).toString).resolve(LABEL_SUBMITS)

      for (student <- studentList) {
        var tmpZiptaskPath: Path = null
        var studentSubmissionList = submissionService.getSubmissionsByTaskAndUser(task(TaskDBLabels.taskid).toString, student(UserDBLabels.user_id), LABEL_DESC)
        if (only_last_try) studentSubmissionList = (if (studentSubmissionList.isEmpty) List() else List(studentSubmissionList(0)))
        for ((submission, i) <- studentSubmissionList.zipWithIndex) {
          if (i == 0) {
            last_submission_date = submission(SubmissionDBLabels.submit_date).asInstanceOf[java.sql.Timestamp].toString.replace(":",
              LABEL_UNDERLINE).replace(" ", "")
            tmpZiptaskPath = getZIPDIR.resolve(tmp_folder).resolve(implode(List(student(UserDBLabels.username).asInstanceOf[String],
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
    val goalPath = Paths.get(s"/tmp/zip-dir/abgaben/")
    goalPath.toFile.mkdirs()

    val finishZipPath = goalPath.resolve("abgabe_course_" + courseid.toString + LABEL_UNDERLINE + tmp_folder + ".zip")
    FileOperations.complexZip(finishZipPath, allPath, getZIPDIR.resolve(tmp_folder).toString)
    finishZipPath.toString
  }

  /**
    * Generates a zip of all course data which can be imported
    * @param courseid unique course identification
    * @return the path where to download from
    */
  def exportCourseImportable(courseid: Int): Path = {
    val tmp_folder = Secrets.getSHAStringFromNow()
    Files.createDirectories(getZIPDIR.resolve(tmp_folder))
    var courseMap: Map[String, Any] = Map(LABEL_COURSE -> getCourseDetails(courseid, new SimpleUser()))

    val tasksDir = getZIPDIR.resolve(tmp_folder).resolve(LABEL_TASKS)
    Files.createDirectories(tasksDir)

    val studentList = getStudentsFromCourse(courseid)

    var taskList = taskService.getTasksByCourse(courseid)
    var subs: List[Any] = List()
    for (task <- taskList) {
      val taskid = task(TaskDBLabels.taskid).toString
      val success = FileOperations.copy(Paths.get(getUPLOADDIR).resolve(taskid).toString, tasksDir.resolve(taskid).toString)

      for(student <- studentList){
        var studentSubmissionList = submissionService.getSubmissionsByTaskAndUser(taskid, student(UserDBLabels.user_id), LABEL_DESC)
        for(entry <- studentSubmissionList){
          val modEntry = entry + (SubmissionDBLabels.taskid -> taskid.toInt)
          subs = modEntry :: subs
        }
      }
    }

    courseMap += (LABEL_TASKS -> taskList)
    courseMap += ("submissions" -> subs)
    FileOperations.writeToFile(JsonParser.mapToJsonStr(courseMap), getZIPDIR.resolve(tmp_folder).resolve(LABEL_COURSE_JSON))

    val finishZipPath = getZIPDIR.resolve(s"export_${courseid}_${tmp_folder}.zip")
    FileOperations.zip(finishZipPath, getZIPDIR.resolve(tmp_folder).toString)
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
    Files.createDirectories(getZIPDIR.resolve(tmp_folder))

    for (task <- taskService.getTasksByCourse(courseid)) {
      var last_submission_date: String = null
      val taskPath = Paths.get(getUPLOADDIR).resolve(task(TaskDBLabels.taskid).toString).resolve(LABEL_SUBMITS)

      var tmpZiptaskPath: Path = null
      var studentSubmissionList = submissionService.getSubmissionsByTaskAndUser(task(TaskDBLabels.taskid).toString, user.userid, LABEL_DESC)
      if (only_last_try) studentSubmissionList = (if (studentSubmissionList.isEmpty) List() else List(studentSubmissionList(0)))
      for((submission, i) <- studentSubmissionList.zipWithIndex) {
        if (i == 0) {
          last_submission_date = submission(SubmissionDBLabels.submit_date).asInstanceOf[String].replace(":",
            LABEL_UNDERLINE).replace(" ", "")
          tmpZiptaskPath = getZIPDIR.resolve(tmp_folder).resolve(implode(List(user.username,
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
    FileOperations.complexZip(Paths.get(finishZipPath), allPath, getZIPDIR.resolve(tmp_folder).toString)
    finishZipPath
  }

  /**
    * import and restore all course data
    *
    * @param courseid unique course identification
    * @param zipdir  the path where the zip is uploaded
    * @return if import worked out
    */
  def recoverACourse(courseid: Int, zipdir: Path): Unit = {
    FileOperations.unzip(zipdir, zipdir.getParent)
    val completeConfig = JsonParser.jsonStrToMap(FileOperations.readFromFile(zipdir.getParent.resolve(LABEL_COURSE_JSON)))
    val courseConfig: Map[String, Any] = completeConfig(LABEL_COURSE).asInstanceOf[Map[String, Any]]
    val confCourseId = courseConfig(CourseDBLabels.courseid).toString.toInt

    if (courseid != confCourseId){
      throw new BadRequestException("Provided ZIP and course id do not match")
    }

    // check if course exists
    if (getCourseDetails(courseid, new AdminUser()).isEmpty) {
      throw new ResourceNotFoundException
    }
    val semester = if (courseConfig(CourseDBLabels.course_semester) == null) null else courseConfig(CourseDBLabels.course_semester).toString
    val module = if (courseConfig(CourseDBLabels.course_modul_id) == null) null else courseConfig(CourseDBLabels.course_modul_id).toString
    val c_end = if (courseConfig(CourseDBLabels.course_end_date) == null) null else new Date(courseConfig(CourseDBLabels.course_end_date).asInstanceOf[Long])
    updateCourse(courseid, courseConfig(CourseDBLabels.name).toString, courseConfig(CourseDBLabels.description).toString,
      courseConfig(CourseDBLabels.standard_task_typ).toString, module,
      semester, c_end, courseConfig(CourseDBLabels.personalised_submission).toString)

    var taskIDMap: Map[Int, Int] = Map() // (original -> new id)
    for (task <- completeConfig(LABEL_TASKS).asInstanceOf[List[Map[String, Any]]]) {
      val taskID = task(TaskDBLabels.taskid).toString.toInt
      val datime = new Date(task(TaskDBLabels.deadline).asInstanceOf[Long])
      var newTaskId = taskID
      val testsystemConfig = task("testsystems").asInstanceOf[List[Map[String, Any]]]
      val testsystems = testsystemConfig.map(elem => elem("testsystem_id").toString)
      // check if task exists exists
      if (taskService.getTaskDetails(taskID, None, raise = false).isEmpty) {
        val taskConfig = taskService.createTask(task(TaskDBLabels.name).toString, task(TaskDBLabels.description).toString, courseid,
          datime, testsystems, task(TaskDBLabels.load_external_description).asInstanceOf[Boolean])
        newTaskId = taskConfig("taskid").toString.toInt
        taskIDMap += (taskID -> newTaskId)
      } else {
        taskService.updateTask(taskID, task(TaskDBLabels.name).toString, task(TaskDBLabels.description).toString,
          datime, null, task(TaskDBLabels.load_external_description).asInstanceOf[Boolean])
      }

      for ((testsystem, j) <- testsystems.zipWithIndex) {
        taskService.setTaskFilename(newTaskId, testsystem, (testsystemConfig(j)("test_file_name")).toString)
        taskService.resetTaskTestStatus(newTaskId, testsystem)
        taskService.sendTaskToTestsystem(newTaskId, testsystem)  // send to kafka
      }
    }
    // update SUBMISSION -> replace into!
    submissionService.replaceUpdateSubmission(completeConfig("submissions").asInstanceOf[List[Map[String, Any]]], taskIDMap)
  }

  /**
    * create and import a curse with corresponsing tasks
    *
    * @param zipdir the path where the zip is uploaded
    * @return if import worked out
    */
  def importACourse(zipdir: Path): (Boolean, Int) = {
    FileOperations.unzip(zipdir, zipdir.getParent)
    val completeConfig = JsonParser.jsonStrToMap(FileOperations.readFromFile(zipdir.getParent.resolve(LABEL_COURSE_JSON)))
    val courseConfig: Map[String, Any] = completeConfig(LABEL_COURSE).asInstanceOf[Map[String, Any]]

    val createdCourse = createCourseByUser(new AdminUser(), courseConfig(CourseDBLabels.name).toString, courseConfig(CourseDBLabels.description).toString,
      courseConfig(CourseDBLabels.standard_task_typ).toString, courseConfig(CourseDBLabels.course_modul_id).toString, null, null)
    val courseID: Int = Integer.parseInt(createdCourse("course_id").toString)

    // we need a map of old taskids to the new ones, where we then can copy task definitions and everything to the right place
    var taskIdMap: Map[Int, Int] = Map()
    var taskTestsystems: Map[Int, List[String]] = Map()
    for (task <- completeConfig(LABEL_TASKS).asInstanceOf[List[Map[String, Any]]]) {
      val testsystemConfig = task("testsystems").asInstanceOf[List[Map[String, Any]]]
      val testsystems = testsystemConfig.map(elem => elem("testsystem_id").toString)

      val taskDeadline = new Date(task(TaskDBLabels.deadline).asInstanceOf[Long])
      val oldTaskId = Integer.parseInt(task(TaskDBLabels.taskid).toString)

      val createdTask = taskService.createTask(task(TaskDBLabels.name).toString, task(TaskDBLabels.description).toString, courseID,
        taskDeadline, testsystems, task(TaskDBLabels.load_external_description).asInstanceOf[Boolean])
      val taskid: Int = Integer.parseInt(createdTask("taskid").toString)

      for ((testsystem, j) <- testsystems.zipWithIndex) {
        taskService.setTaskFilename(taskid, testsystem, (testsystemConfig(j)("test_file_name")).toString)
        taskService.resetTaskTestStatus(taskid, testsystem)
      }

      taskIdMap += (oldTaskId -> taskid)
      taskTestsystems += (taskid -> testsystems)
    }
    // 1. remove "submit" folder from task, if it exists
    val uploadedTaskRoot = zipdir.getParent.resolve(LABEL_TASKS)
    taskIdMap.keys.foreach(taskid => FileOperations.rmdir(uploadedTaskRoot.resolve(taskid.toString).resolve(LABEL_SUBMITS).toFile))

    // 2. copy each task folder while renaming it
    taskIdMap.foreach(entry => {
      FileOperations.copy(uploadedTaskRoot.resolve(entry._1.toString).toString, Paths.get(getUPLOADDIR).resolve(entry._2.toString).toString)
    })

    // 3. send the tasks to the checker systems
    taskTestsystems.foreach(entry => {
      for (testsytem_id <- entry._2) {
        taskService.sendTaskToTestsystem(entry._1, testsytem_id)
      }
    })
    (true, courseID)
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
    * This method returns a submissions matrix of all users for one course
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param offset offset of user list
    * @param limit limit the user list
    * @param filter filter the user list
    * @return Scala List
    */
  def getSubmissionsMatrixByCourse(courseid: Int, offset: Integer, limit: Integer, filter: String): List[Any] = {
    val subscribedStudents = this.getStudentsFromCourse(courseid, offset, limit, filter)
    var matrix: List[Any] = List()
    for(u <- subscribedStudents){
      val (passed_glob, processedTasks: List[Map[String, Any]]) = submissionService.getSummarizedSubmissionEvaluationOfCourseOfUser(
        u(UserDBLabels.user_id).toString.toInt, courseid)
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
      val courseid = course(CourseDBLabels.courseid).toString.toInt
      val (passed_glob, processedTasks: List[Map[String, Any]]) =
        submissionService.getSummarizedSubmissionEvaluationOfCourseOfUser(userid, courseid)

      var courseLine: Map[String, Any] = Map(LABEL_TASKS  -> processedTasks, "deadlines" -> processedTasks.map(task =>
        task(task.keys.head).asInstanceOf[Map[String, Any]]("deadline")))
      for(c <- course.keys) courseLine = courseLine + (c -> course(c))

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
                         course_modul_id: String, course_semester: String, course_end_date: Date, personalised_submission: Int = 0): Map[String, Any] = {
    val (num, holder) = DB.update((con: Connection) => {
      val ps = con.prepareStatement(
        "insert into course (course_name, course_description, creator, standard_task_typ, course_modul_id, " +
          "course_semester, personalised_submission, course_end_date) values (?,?,?,?,?,?,?,?)",
        Statement.RETURN_GENERATED_KEYS
      )
      ps.setString(1, name)
      ps.setString(2, description)
      ps.setInt(3, user.userid)
      ps.setString(4, standard_task_typ)
      ps.setString(5, course_modul_id)
      ps.setString(6, course_semester)
      ps.setInt(7, personalised_submission)
      ps.setString(8, sdf.format(course_end_date))
      ps
    })
    if (num < 1) {
      throw new RuntimeException("Error creating course.")
    }
    Map("course_id" -> holder.getKey, "success" -> true)
  }

  /**
    * set plagiarism scritp status
    * @param courseid unique identification for a course
    * @param plagiarism_script check if plagiarism_script is correct set
    * @return update success status
    */
  def setPlagiarismScriptStatus(courseid: Int, plagiarism_script: Boolean): Boolean = {
    DB.update("update course set plagiarism_script = ? where course_id = ?", plagiarism_script, courseid) == 1
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
                   course_modul_id: String = null, course_semester: String = null, course_end_date: Date = null,
                   personalised_submission: String = null): Map[String, Boolean] = {
    var updates = 0
    var suceeds = 0
    if (name != null & !name.isBlank) { suceeds += DB.update("update course set course_name = ? where course_id = ?", name, courseid); updates += 1 }
    if (description != null) { suceeds += DB.update("update course set course_description = ? where course_id = ?", description, courseid); updates += 1 }
    if (standard_task_typ != null & !standard_task_typ.isBlank) { suceeds += DB.update("update course set standard_task_typ = ? where course_id = ?",
      standard_task_typ, courseid); updates += 1 }
    if (course_modul_id != null) { suceeds += DB.update("update course set course_modul_id = ? where course_id = ?", course_modul_id, courseid); updates += 1 }
    if (course_semester != null) { suceeds += DB.update("update course set course_semester = ? where course_id = ?", course_semester, courseid); updates += 1 }
    if (course_end_date != null) {
      suceeds += DB.update("update course set course_end_date = ? where course_id = ?", sdf.format(course_end_date), courseid); updates += 1
    }
    if (personalised_submission != null) {
      val dbBool = if (personalised_submission == LABEL_TRUE) 1 else 0
      suceeds += DB.update("update course set personalised_submission = ? where course_id = ?", dbBool, courseid)
      updates += 1
    }
    Map(LABEL_SUCCESS -> (updates == suceeds))
  }
}
