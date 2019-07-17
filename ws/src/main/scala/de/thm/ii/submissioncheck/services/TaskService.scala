package de.thm.ii.submissioncheck.services

import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path, Paths}
import java.sql.{Connection, Statement}

import de.thm.ii.submissioncheck.controller.ClientService
import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, JsonParser, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

/**
  * Enable communication with Tasks and their Results
  *
  * @author Benjamin Manns
  */
@Component
class TaskService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  /**
    * Class holds all DB labels
    */

  @Autowired
  private val tokenService: TokenService = null

  private final val ERROR_CREATING_ADMIN_MSG = "Error creating submission. Please contact administrator."

  @Value("${compile.production}")
  private val compile_production: Boolean = true

  @Value("${cas.client-host-url}")
  private val UPLOAD_BASE_URL: String = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val testsystemService: TestsystemService = null
  @Autowired
  private val courseParameterService: CourseParamService = null
  /** holds connection to storageService*/
  val storageService = new StorageService(compile_production)
  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  /**
   * Load base upload URL
   * @return string based on configuration the correct upload base URL
   */
  def getUploadBaseURL(): String = {
    if (compile_production) {
      "https://ws:8080/"
    } else {
      UPLOAD_BASE_URL
    }
  }

  /** all interactions with tasks are done via a taskService*/
  @Autowired
  val courseService: CourseService = null

  private final var LABEL_ZIPDIR = "zip-dir"
  private final var LABEL_UPLOADDIR = "upload-dir"
  private final var LABEL_UNDERLINE = "_"
  private val LABEL_DESC = "desc"
  final val LABEL_DATA = "data"
  private final val LABEL_FILE = "file"
  private final val LABEL_SEQ = "seq"
  private final val LABEL_NAME = "name"
  private final val LABEL_DESCRIPTION = "description"
  private final val LABEL_FILENAME = "filename"
  private final val LABEL_UPLOAD_URL = "upload_url"
  private final val LABEL_JWT_TOKEN = "jwt_token"
  private val LABEL_RELOAD = "reload"
  private val LABEL_SUBMIT_TYP = "submit_typ"
  private val LABEL_TASK_ID = "taskid"
  private val LABEL_USER_ID = "userid"
  private val LABEL_SUBMISSION_ID = "submissionid"
  private val LABEL_COURSE_ID = "courseid"
  private val LABEL_CHECK_REQUEST: String = "check_request"

  /**
    * After Upload a submitted File save it's name
    * @author Benjamin Manns
    * @param submissionid  unique identification for a submission
    * @param filename filename from uploaded file
    * @return boolean if update worked
    */
  def setSubmissionFilename(submissionid: Int, filename: String): Boolean = {
    val num = DB.update("UPDATE submission set filename = ? where submission_id = ?;", filename, submissionid)
    num == 0
  }


  def sendSubmissionToTestsystem(submission_id: Int, task_id: Int, testsystem_id: String, user: User, typ: String, data: String) = {
    var kafkaMap: Map[String, Any] = Map(LABEL_TASK_ID -> task_id.toString, LABEL_USER_ID -> user.username)
    val taskDetailsOpt = getTaskDetails(task_id)
    if (typ == "data"){
      kafkaMap += (LABEL_DATA -> data)
      kafkaMap += (LABEL_SUBMIT_TYP -> LABEL_DATA)
    } else if (typ == LABEL_FILE){
      kafkaMap += ("fileurl" ->  this.submissionService.getURLOfSubmittedTestFile(task_id, submission_id))
      kafkaMap += (LABEL_SUBMIT_TYP -> LABEL_FILE)
    } else if (typ == "external") {
      kafkaMap += (LABEL_SUBMIT_TYP -> "external")
    } else {
      throw new IllegalArgumentException("`typ` keyword is IN (data, file, external)")
    }

    kafkaMap += (LABEL_SUBMISSION_ID -> submission_id.toString)
    kafkaMap += (LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(testsystem_id))
    kafkaMap += ("course_parameter" -> courseParameterService.getAllCourseParamsForUser(
      taskDetailsOpt.get(TaskDBLabels.courseid).asInstanceOf[Int], user))
    val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
    logger.warn(connectKafkaTopic(testsystem_id, LABEL_CHECK_REQUEST))
    logger.warn(jsonResult)
    kafkaTemplate.send(connectKafkaTopic(testsystem_id, LABEL_CHECK_REQUEST), jsonResult)
    kafkaTemplate.flush()
  }

  /**
    * submit a Task
    * @param taskid unique identification for a task
    * @param user requesting User
    * @param data submitted data from User
    * @return Submission ID
    */
  def submitTaskWithData(taskid: Int, user: User, data: String): Int = {
    try {
      val (num, holder) = DB.update((con: Connection) => {
        val ps = con.prepareStatement(
          "INSERT INTO submission (task_id, user_id, submission_data) VALUES (?,?,?);",
          Statement.RETURN_GENERATED_KEYS
        )
        ps.setInt(1, taskid)
        ps.setInt(2, user.userid)
        ps.setString(3, data)
        ps
      })
      val insertedId = holder.getKey.intValue()

      if (num == 0) {
        throw new RuntimeException(ERROR_CREATING_ADMIN_MSG)
      }

      insertedId
    }
    catch {
      // TODO use the SQLIntegrityConstraintViolationException or anything with SQL
      case _: Exception => {
        throw new ResourceNotFoundException
      }
    }
  }

  /**
    * simply update users submission if plagiat check passed or not
    * @param submissionid which submission
    * @param passed passed plagiat check
    * @return DB update succeeded
    */
  def setPlagiatPassedForSubmission(submissionid: String, passed: Boolean): Boolean = {
    DB.update("UPDATE submission set plagiat_passed = ? where submission_id = ? ", passed, submissionid) == 1
  }

  /**
    * print Task Results
    * @param taskid unique identification for a task
    * @param user requesting user
    * @return JAVA Map
    */
  def getTaskResults(taskid: Int, user: User): List[Map[String, Any]] = {
    DB.query("SELECT * from task join submission using(task_id) where task_id = ? and user_id = ?;",
      (res, _) => {
        Map(
          TaskDBLabels.courseid -> res.getString(TaskDBLabels.courseid),
          TaskDBLabels.taskid -> res.getString(TaskDBLabels.taskid),
          TaskDBLabels.name -> res.getString(TaskDBLabels.name),
          SubmissionDBLabels.combined_passed ->  submissionService.getSubmissionPassed(res.getInt(SubmissionDBLabels.submissionid)),
          SubmissionDBLabels.filename -> res.getString(SubmissionDBLabels.filename),
          SubmissionDBLabels.submission_data -> res.getString(SubmissionDBLabels.submission_data),
          SubmissionDBLabels.submissionid -> res.getString(SubmissionDBLabels.submissionid),
          SubmissionDBLabels.userid -> res.getString(SubmissionDBLabels.userid),
          SubmissionDBLabels.submit_date -> res.getTimestamp(SubmissionDBLabels.submit_date),
          SubmissionDBLabels.evaluation -> submissionService.getTestsystemSubmissionEvaluationList(res.getInt(SubmissionDBLabels.submissionid)))
      }, taskid, user.userid)
  }

  private def getNullOrBoolean(boolDBString: String) = {
    if (boolDBString == null) {
      null
    } else {
      boolDBString.toInt > 0
    }
  }



  /**
    * get students submissions by Tasks
    *
    * @author Benjamin Manns
    * @param taskid unique task identification
    * @return Scala List
    */
  def getSubmissionsByTask(taskid: Int): List[Map[String, Any]] = {
    DB.query("SELECT u.*, s.* from task join submission s using(task_id) join user u using(user_id) where task_id = ?",
      (res, _) => {
        Map(SubmissionDBLabels.combined_passed ->  submissionService.getSubmissionPassed(res.getInt(SubmissionDBLabels.submissionid)),
          SubmissionDBLabels.evaluation -> submissionService.getTestsystemSubmissionEvaluationList(res.getInt(SubmissionDBLabels.submissionid)),
          SubmissionDBLabels.submissionid -> res.getInt(SubmissionDBLabels.submissionid),
          SubmissionDBLabels.userid -> res.getString(SubmissionDBLabels.userid),
          UserDBLabels.username -> res.getString(UserDBLabels.username),
          UserDBLabels.prename -> res.getString(UserDBLabels.prename),
          UserDBLabels.surname -> res.getString(UserDBLabels.surname),
          UserDBLabels.email -> res.getString(UserDBLabels.email)
        )
      }, taskid)
  }

  /**
    * Simply return the correct course id of a task
    * @param taskid unique identification for a task
    * @return Course ID
    */
  def getCourseIdByTaskId(taskid: Int): Option[Int] = {
    DB.query("SELECT course_id from task where task_id = ?",
      (res, _) => {
        res.getInt("course_id")
      }, taskid).headOption
  }

  /**
    * Collect all (last) submissions of a task and zip them
    * @param taskid unique identification for a task
    * @return zip path
    */
  def zipOfSubmissionsOfUsersFromTask(taskid: Integer): String = {
    var allPath: List[Path] = List()
    val tmp_folder = Secrets.getSHAStringFromNow()
    Files.createDirectories(Paths.get(LABEL_ZIPDIR).resolve(tmp_folder))

    val studentList = courseService.getStudentsFromCourse(this.getCourseIdByTaskId(taskid).get)

    var last_submission_date: String = null
    val taskPath = Paths.get(LABEL_UPLOADDIR).resolve(taskid.toString).resolve("submits")

    for (student <- studentList) {
      var studentSubmissionList = submissionService.getSubmissionsByTaskAndUser(taskid.toString, student(UserDBLabels.user_id), LABEL_DESC)

      if (studentSubmissionList.nonEmpty) {
        val submission = studentSubmissionList.head

        last_submission_date = submission(SubmissionDBLabels.submit_date).asInstanceOf[java.sql.Timestamp].toString.replace(":",
          LABEL_UNDERLINE).replace(" ", "")
        val goalPath = Paths.get(LABEL_ZIPDIR).resolve(tmp_folder).resolve(courseService.implode(List(student(UserDBLabels.username).asInstanceOf[String],
          taskid.toString, submission(SubmissionDBLabels.submissionid).toString, last_submission_date), LABEL_UNDERLINE))

        // create path out of this
        val filePath = taskPath.resolve(submission(SubmissionDBLabels.submissionid).asInstanceOf[String])
          .resolve(stringOrNull(submission(SubmissionDBLabels.filename)))

        allPath = goalPath :: allPath

        try {
          Files.copy(filePath, Files.newOutputStream(goalPath))
        }
        catch {
          case _: java.nio.file.NoSuchFileException => {}
        }
      }
    }

    val finishZipPath = "zip-dir/abgabe_task_" + taskid.toString + LABEL_UNDERLINE + tmp_folder + ".zip"
    courseService.zip(Paths.get(finishZipPath), allPath, Paths.get(LABEL_ZIPDIR).resolve(tmp_folder).toString)
    finishZipPath
  }

  /**
    * print detail information of a given task
    * @param taskid unique identification for a task
    * @param userid unique identification for a User
    * @return JAVA Map
    */
  def getTaskDetails(taskid: Integer, userid: Option[Int] = None): Option[Map[String, Any]] = {
    // TODO check if user has this course where the task is from
    val list = DB.query("SELECT task.test_file_name,  task.test_file_accept, task.test_file_accept_error, " +
      "`task`.`task_name`, task.deadline, `task`.`task_description`, `task`.`task_id`, `task`.`course_id`, " +
      "task.testsystem_id from task join course using(course_id) where task_id = ?",
      (res, _) => {
        val lineMap = Map(TaskDBLabels.courseid -> res.getString(TaskDBLabels.courseid),
          TaskDBLabels.taskid -> res.getInt(TaskDBLabels.taskid),
          TaskDBLabels.name -> res.getString(TaskDBLabels.name),
          TaskDBLabels.description -> res.getString(TaskDBLabels.description),
          TaskDBLabels.deadline -> res.getTimestamp(TaskDBLabels.deadline),
          TaskTestsystemDBLabels.testsystems -> getTestsystemsByTask(res.getInt(TaskDBLabels.taskid)),
          TaskDBLabels.courseid ->  res.getInt(TaskDBLabels.courseid))

        if (userid.isDefined){
          val submissionInfos = submissionService.getLastSubmissionResultInfoByTaskIDAndUser(taskid, userid.get)
          lineMap + (SubmissionDBLabels.evaluation -> submissionInfos(SubmissionDBLabels.evaluation),
            "file" -> submissionInfos(SubmissionDBLabels.filename),
            SubmissionDBLabels.submit_date -> submissionInfos(SubmissionDBLabels.submit_date),
            SubmissionDBLabels.submission_data -> submissionInfos(SubmissionDBLabels.submission_data))
        } else {
          lineMap
        }
      }, taskid)
    if(list.isEmpty) {
      throw new ResourceNotFoundException
    }
    list.headOption
  }



  /**
    * Testsystems answer (ansynchron) if provided testfiles are acceptable or not, they have there individual logic.
    * This method simply saved this answer
    * @author Benjamin Manns
    * @param task_id unique identification for a task
    * @param accept if testsystem accepted or not
    * @param error error mesage provided by testsystem
    * @param testsystem_id from which testsystem the answer came back
    * @return update work
    */
  def setTaskTestFileAcceptedState(task_id: Int, accept: Boolean, error: String = "", testsystem_id: String): Boolean = {
    val num = DB.update(
      "UPDATE task_testsystem set test_file_accept = ?, test_file_accept_error = ? where task_id = ? and testsystem_id = ?;",
      accept, error, task_id, testsystem_id)
    num > 0
  }

  /**
    * for a given Taskid and submissionid set a result text
    *
    * @author Benjamin Manns
    * @param submissionid unique identification for a submissionid
    * @param result answer coming from a checker service
    * @param passed test result passed information (0 = failed, 1 = passed)
    * @param exitcode tiny peace of status information
    * @param testsystem_id from which testsystem we got the answer
    * @return Boolean: did update work
    */
  def setResultOfTask(submissionid: Int, result: String, passed: String, exitcode: Int, testsystem_id: String): Boolean = {
    val num = DB.update(
      "INSERT INTO submission_testsystem (result, passed, exitcode, result_date, submission_id, testsystem_id, step) " +
        "select ?, ?, ?, CURRENT_TIMESTAMP(), ?, ?, COALESCE(max(step),0)+1 as nextstep from submission_testsystem  where submission_id = ?;",
      result, passed, exitcode, submissionid, testsystem_id)
    num > 0
  }

  private def stringOrNull(any: Any): String = {
    if (any == null) {
      null
    } else {
      any.toString
    }
  }

  /**
    * get list of all testsystem a task has
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @return list of testsystem
    */
  def getTestsystemsByTask(taskid: Int): List[Map[String, Any]] = {
    DB.query("select * from task_testsystem tt join testsystem t using(testsystem_id)  where tt.task_id = ?", (res, _) => {
      Map(TaskTestsystemDBLabels.taskid -> res.getInt(TaskTestsystemDBLabels.taskid),
        TaskTestsystemDBLabels.testsystem_id -> res.getString(TaskTestsystemDBLabels.testsystem_id),
        TaskTestsystemDBLabels.ordnr -> res.getInt(TaskTestsystemDBLabels.ordnr),
        TaskTestsystemDBLabels.test_file_accept -> res.getBoolean(TaskTestsystemDBLabels.test_file_accept),
        TaskTestsystemDBLabels.test_file_accept_error -> res.getString(TaskTestsystemDBLabels.test_file_accept_error),
        TaskTestsystemDBLabels.test_file_name -> res.getString(TaskTestsystemDBLabels.test_file_name),
        TestsystemLabels.name -> res.getString(TestsystemLabels.name),
        TestsystemLabels.description -> res.getString(TestsystemLabels.description),
        TestsystemLabels.supported_formats -> res.getString(TestsystemLabels.supported_formats),
        TestsystemLabels.machine_ip -> res.getString(TestsystemLabels.machine_ip),
        TestsystemLabels.machine_port -> res.getString(TestsystemLabels.machine_port))
    }, taskid)
  }

  /**
    *
    * @param task_id
    * @param index
    * @return
    */
  def getTestsystemIDOfTaskByIndex(task_id: Int, index: Int): String = {
    DB.query("select testsystem_id from task_testsystem where task_id = ? limit ?,1", (res, _) => {
      res.getString(TaskTestsystemDBLabels.testsystem_id)
    }, task_id, index-1).head
  }

  /**
    * get a JAVA List of Task by a given course id
    * @param courseid unique identification for a course
    * @param userid unique identification for a User
    * @return JAVA List
    */
  def getTasksByCourse(courseid: Int, userid: Option[Int] = None): List[Map[String, Any]] = {
    DB.query("select * from task where course_id = ?",
      (res, _) => {
        val lineMap = Map(
          TaskDBLabels.courseid -> res.getString(TaskDBLabels.courseid),
          TaskDBLabels.taskid -> res.getInt(TaskDBLabels.taskid),
          TaskDBLabels.name -> res.getString(TaskDBLabels.name),
          TaskDBLabels.description -> res.getString(TaskDBLabels.description),
          TaskDBLabels.deadline -> res.getTimestamp(TaskDBLabels.deadline),
          "testsystems" -> getTestsystemsByTask(res.getInt(TaskDBLabels.taskid)),
        )
        if (userid.isDefined){
          val submissionInfos = submissionService.getLastSubmissionResultInfoByTaskIDAndUser(res.getInt(TaskDBLabels.taskid), userid.get)
          lineMap + (SubmissionDBLabels.evaluation -> submissionInfos(SubmissionDBLabels.evaluation),
            "file" -> submissionInfos(SubmissionDBLabels.filename),
            SubmissionDBLabels.submit_date -> submissionInfos(SubmissionDBLabels.submit_date),
            SubmissionDBLabels.submission_data -> submissionInfos(SubmissionDBLabels.submission_data))
        } else {
          lineMap
        }
      }, courseid)
  }

  /**
    * create a task to a given course
    * @author Benjamin Manns
    * @param name Task name
    * @param description Task description
    * @param courseid Course where task is created for
    * @param deadline until when the task is open
    * @param testsystems: list of refered testsystems
    * @return Scala Map
    */
  def createTask(name: String, description: String, courseid: Int, deadline: String, testsystems: List[String]): Map[String, AnyVal] = {
    //val availableTypes = List("FILE", "STRING")
    //if (!availableTypes.contains(test_type)) throw new BadRequestException(test_type + "as `test_type` is not implemented.")
    val (num, holder) = DB.update((con: Connection) => {
      val ps = con.prepareStatement(
        "INSERT INTO task (task_name, task_description, course_id, deadline) VALUES (?,?,?,?)",
        Statement.RETURN_GENERATED_KEYS
      )
      val magic4 = 4
      ps.setString(1, name)
      ps.setString(2, description)
      ps.setInt(3, courseid)
      ps.setString(magic4, deadline)
      ps
    })

    val insertedId = holder.getKey.intValue()
    if (num == 0) {
      throw new RuntimeException(ERROR_CREATING_ADMIN_MSG)
    }

    var line = 0
    val testsystemMap = testsystems.map(testsystem_id => {
      line += 1
      Map(TaskTestsystemDBLabels.ordnr -> line, TaskTestsystemDBLabels.testsystem_id -> testsystem_id)
    })

    Map("success" -> (num == 1 && setTestsystemsForTask(testsystemMap, insertedId)), "taskid" -> insertedId)
  }

  /**
    * Update only filename
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param testsystem_id for which testsystem
    * @param filename test file for this task
    * @return result if update works
    */
  def setTaskFilename(taskid: Int, testsystem_id: String, filename: String): Boolean = {
    val num = DB.update("UPDATE task_testsystem set test_file_name = ? where task_id = ? and testsystem_id = ? ", filename, taskid, testsystem_id)
    num == 1
  }

  /**
    * Reset testsystem file status if controller get new testfiles
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param testsystem_id for which testsystem
    * @return result if update works
    */
  def resetTaskTestStatus(taskid: Int, testsystem_id: String): Boolean = {
    // TODO Maybe reset for all?
    val num = DB.update("update task_testsystem set test_file_accept_error = null, test_file_accept = null where task_id = ? and testsystem_id = ?", taskid, testsystem_id)
    num == 1
  }

  /**
    * update Task by its Task ID
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param name Task name
    * @param description Task description
    * @param deadline until when the task is open
    * @param testsystem_id: refered testsystem
    * @param plagiat_check: plagiat check status
    * @return result if update works
    */
  def updateTask(taskid: Int, name: String = null, description: String = null, deadline: String = null, testsystem_id: String = null,
                 plagiat_check: Any = null): Boolean = {
    var updates = 0
    var successfulUpdates = 0
    if (name != null) {
      successfulUpdates += DB.update("UPDATE task set task_name = ? where task_id = ? ", name, taskid)
      updates += 1
    }

    if (description != null) {
      successfulUpdates += DB.update("UPDATE task set task_description = ?  where task_id = ? ", description, taskid)
      updates += 1
    }

    if (testsystem_id != null) {
      successfulUpdates += DB.update("UPDATE task set testsystem_id = ? where task_id = ? ", testsystem_id, taskid)
      updates += 1
    }

    if (deadline != null) {
      successfulUpdates += DB.update("UPDATE task set deadline = ? where task_id = ? ", deadline, taskid)
      updates += 1
    }

    if (plagiat_check != null) {
      val status = plagiat_check.asInstanceOf[Boolean]
      successfulUpdates += DB.update("UPDATE task set plagiat_check_done = ? where task_id = ? ", status, taskid)
      updates += 1
    }

    successfulUpdates == updates
  }

  /**
    * Overwrites and set testsystems for a given task
    * Input structure has to be: List(Map(ordnr -> 1, testsystem_id -> gitchecker))
    *
    * @param testsystem list of testsystem which should be set
    * @param task_id set testsystem to a specific task
    */
  def setTestsystemsForTask(testsystem: List[Map[String, Any]], task_id: Int): Boolean = {

    val input_ordnr = testsystem.map(l => l(TaskTestsystemDBLabels.ordnr))
    if (input_ordnr.length > input_ordnr.distinct.length) {
      throw new IllegalArgumentException("`ordnr` musst be distinct")
    }
    var steps = 0
    var success_steps = 0

    DB.update("DELETE from task_testsystem where task_id = ? ", task_id)

    testsystem.foreach(line => {
      success_steps += DB.update("INSERT INTO task_testsystem (task_id, testsystem_id, ordnr) VALUES (?,?,?) ", task_id, line(TaskTestsystemDBLabels.testsystem_id),
        line(TaskTestsystemDBLabels.ordnr))
      steps += 1
    })

    success_steps == steps
  }

  /**
    * delete Task by Task ID
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @return result if delete works
    */
  def deleteTask(taskid: Int): Map[String, Boolean] = {
    val num = DB.update("DELETE from task where task_id = ? ", taskid)
    Map("success" -> (num == 1))
  }

  /**
    * Check if User has a subcription for this task
    *
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param user a user object
    * @return Boolean if user is permitted
    */
  def hasSubscriptionForTask(taskid: Int, user: User): Boolean = {
    if (user.role == "admin" || user.roleid == 2) {
      true
    }
    else {
      val list = DB.query("SELECT count(*) as c FROM  user_course join task using (course_id) where task_id = ? and user_id = ?",
        (res, _) => res.getInt("c"), taskid, user.userid)
      list.nonEmpty && list.head == 1
    }
  }

  /**
    * Check if User is permitted to edit / observe Task
    *
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param user a user object
    * @return Boolean if user is permitted
    */
  def isPermittedForTask(taskid: Int, user: User): Boolean = {
    if (user.role == "admin" || user.roleid == 2) {
        true
      }
    else {
       val list = DB.query("SELECT ? IN (select c.creator from task t join course c using (course_id) where " +
        "task_id = ? UNION SELECT user_id from user_course join task using (course_id) where task_id = ? " +
        "and role_id IN (8,4) ) as permitted",
          (res, _) => res.getInt("permitted"), user.userid, taskid, taskid)

      list.nonEmpty && list.head == 1
    }
  }
  /**
    * Gets the filename by a given Taskid
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param testsystem_id for which testsystem
    * @return just the filename
    */
  def getTestFilesByTask(taskid: Int, testsystem_id: String): List[String] = {
    val list = DB.query("SELECT test_file_name from task_testsystem where task_id = ? and testsystem_id = ?",
      (res, _) => res.getString("test_file_name"), taskid, testsystem_id)
    if (list.isEmpty) {
      throw new ResourceNotFoundException
    }
    if (list.isEmpty){
      List()
    } else {
      list.head.asInstanceOf[String].split(",").toList
    }
  }

  /**
    * generate token validated URL to download task test file
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param testsystem_id for which testsystem
    * @return URL String
    */
  def getURLsOfTaskTestFiles(taskid: Int, testsystem_id: String): List[String] = {
    getTestFilesByTask(taskid, testsystem_id).map(testfile => {
      s"${getUploadBaseURL()}/api/v1/tasks/${taskid.toString}/files/testfile/${testsystem_id}/${encodeValue(testfile)}"
    })
  }



  private def encodeValue(value: String): String = {
    URLEncoder.encode(value, StandardCharsets.UTF_8.toString)
  }



  /**
    * generate validated URL to download plagiat script
    * @author Benjamin MAnns
    * @param courseid unique courseid identification
    * @return URl String
    */
  def getURLOfPlagiatScriptForCourse(courseid: Int): String = getUploadBaseURL() + s"/api/v1/course/$courseid/files/plagiatscript"

  /**
    * Get the unique test system name
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @return the unique test system name
    */
  def getTestsystemTopicsByTaskId(taskid: Int): List[String] = {
    val list = DB.query("select testsystem_id from task_testsystem join testsystem using(testsystem_id) where task_id = ?",
      (res, _) => res.getString(TestsystemLabels.id), taskid)
    list
  }

  /**
    * Get the testsystem modus of a task
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @return modus is SEQ or MULTI
    */
  def getMultiTestModeOfTask(taskid: Int): String = {
    val list = DB.query("select testsystem_modus from task where task_id = ?",
      (res, _) => res.getString(TaskDBLabels.testsystem_modus), taskid)
    list.head
  }



  /**
    * Connect a testsystem String with corresponding topic
    * @param id testsystem id
    * @param t_name action string
    * @return topic
    */
  def connectKafkaTopic(id: String, t_name: String): String = id + "_" + t_name

  /**
    * get tasks which are expired and can be sent to plagiat checker
    * @return List of tasks
    */
  def getExpiredTasks(): List[Map[String, Any]] = {
    val list = DB.query("select * from task where plagiat_check_done = 0 and deadline < CURRENT_TIMESTAMP",
      (res, _) => {
        Map(TaskDBLabels.courseid -> res.getString(TaskDBLabels.courseid),
          TaskDBLabels.taskid -> res.getInt(TaskDBLabels.taskid),
          TaskDBLabels.name -> res.getString(TaskDBLabels.name),
          TaskDBLabels.description -> res.getString(TaskDBLabels.description),
          TaskDBLabels.deadline -> res.getTimestamp(TaskDBLabels.deadline),
          TaskTestsystemDBLabels.testsystems -> getTestsystemsByTask(res.getInt(TaskDBLabels.taskid)))
      })
    list
  }
}
