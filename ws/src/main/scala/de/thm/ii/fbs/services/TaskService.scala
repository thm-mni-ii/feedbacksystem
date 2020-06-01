package de.thm.ii.fbs.services

import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path, Paths}
import java.sql.{Connection, Statement, Timestamp}
import java.text.SimpleDateFormat
import java.util.Date

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.model.Role
import de.thm.ii.fbs.security.Secrets
import de.thm.ii.fbs.util.{DB, JsonParser, ResourceNotFoundException}
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
  private val logger: Logger = LoggerFactory.getLogger(classOf[TaskService])

  private val sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

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
  private val LABEL_DATA = "data"
  private final val LABEL_FILE = "file"
  private final val LABEL_JWT_TOKEN = "jwt_token"
  private val LABEL_SUBMIT_TYP = "submit_typ"
  private val LABEL_TASK_ID = "taskid"
  private val LABEL_USER_ID = "userid"
  private val LABEL_SUBMISSION_ID = "submissionid"
  private val LABEL_CHECK_REQUEST: String = "check_request"
  private val LABEL_SUCCESS = "success"
  private val LABEL_EXTERNAL = "external"
  private val topicTaskRequest: String = "new_task_request"

  /**
    * After Upload a submitted File save it's name
    * @author Benjamin Manns
    * @param submissionid  unique identification for a submission
    * @param filename filename from uploaded file
    * @return boolean if update worked
    */
  def setSubmissionFilename(submissionid: Int, filename: String): Boolean = {
    0 == DB.update("UPDATE submission set filename = ? where submission_id = ?;", filename, submissionid)
  }

  /**
    * send submission to testsystem with several options
    * @param submission_id unique identification for a submission
    * @param task_id unique identification for a task
    * @param testsystem_id task testsystem
    * @param user sending user
    * @param typ option which format we want to send
    * @param data content
    * @param queued_test set label for tests which will use already existing files, not creating new ones.
    */
  def sendSubmissionToTestsystem(submission_id: Int, task_id: Int, testsystem_id: String, user: User, typ: String, data: String,
                                 queued_test: Boolean = false): Unit = {
    var kafkaMap: Map[String, Any] = Map(LABEL_TASK_ID -> task_id.toString, LABEL_USER_ID -> user.userid, "username" -> user.username)
    val taskDetailsOpt = getTaskDetails(task_id)
    if (typ == LABEL_DATA){
      kafkaMap += (LABEL_DATA -> data)
      kafkaMap += (LABEL_SUBMIT_TYP -> LABEL_DATA)
    } else if (typ == LABEL_FILE){
      kafkaMap += ("fileurl" ->  submissionService.getURLOfSubmittedTestFile(task_id, submission_id))
      kafkaMap += (LABEL_SUBMIT_TYP -> LABEL_FILE)
    } else if (typ == LABEL_EXTERNAL) {
      kafkaMap += (LABEL_SUBMIT_TYP -> LABEL_EXTERNAL)
    } else if (typ == "info") {
      kafkaMap += (LABEL_DATA -> data)
      kafkaMap += (LABEL_SUBMIT_TYP -> LABEL_DATA)
      kafkaMap += ("isinfo" -> true)
    } else if (typ == "resubmit"){
      kafkaMap += (LABEL_SUBMIT_TYP -> "resubmit")
    } else {
      throw new IllegalArgumentException("`typ` keyword is IN (data, file, external, resubmit)")
    }
    kafkaMap += ("use_extern" -> queued_test)
    kafkaMap += ("api_url" -> s"${UPLOAD_BASE_URL}/api/v1/")
    kafkaMap += ("courseid" -> getCourseIdByTaskId(task_id).get)

    kafkaMap += (LABEL_SUBMISSION_ID -> submission_id.toString)
    kafkaMap += (LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(testsystem_id))
    kafkaMap += ("global_settings" -> testsystemService.getSettingsOfTestsystem(testsystem_id))
    kafkaMap += ("course_parameter" -> courseParameterService.getAllCourseParamsForUser(
      taskDetailsOpt.get(TaskDBLabels.courseid).asInstanceOf[Int], user))
    val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
    logger.info(connectKafkaTopic(testsystem_id, LABEL_CHECK_REQUEST))
    logger.info(jsonResult)
    kafkaTemplate.send(connectKafkaTopic(testsystem_id, LABEL_CHECK_REQUEST), jsonResult)
    kafkaTemplate.flush()
  }

  /**
    * send task and upladed files to testsystem with several options
    * @param taskid unique identification for a task
    * @param testsystem_id task testystem
    * @return true (to be extended)
    */
  def sendTaskToTestsystem(taskid: Int, testsystem_id: String): Unit = {
    val jsonMsg: Map[String, Any] = Map("testfile_urls" -> getURLsOfTaskTestFiles(taskid, testsystem_id),
      LABEL_TASK_ID -> taskid.toString,
      LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(testsystem_id))

    val jsonStringMsg = JsonParser.mapToJsonStr(jsonMsg)
    kafkaTemplate.send(connectKafkaTopic(testsystem_id, topicTaskRequest), jsonStringMsg)
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
    } catch {
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
    1 == DB.update("UPDATE submission set plagiat_passed = ? where submission_id = ? ", passed, submissionid)
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
          SubmissionDBLabels.submit_date -> nullSafeTime(res.getTimestamp(SubmissionDBLabels.submit_date)),
          SubmissionDBLabels.evaluation -> submissionService.getTestsystemSubmissionEvaluationList(res.getInt(SubmissionDBLabels.submissionid)))
      }, taskid, user.userid)
  }

  /**
    * get students submissions by Tasks
    *
    * @author Benjamin Manns
    * @param taskid unique task identification
    * @return Scala List
    */
  def getSubmissionsByTask(taskid: Int): List[Map[String, Any]] = {
    DB.query("SELECT u.*, max(s.submission_id) as submission_id from task join submission s using(task_id) join user u using(user_id)" +
      " where task_id = ? group by u.user_id",
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
      val studentSubmissionList = submissionService.getSubmissionsByTaskAndUser(taskid.toString, student(UserDBLabels.user_id), LABEL_DESC)

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
    FileOperations.complexZip(Paths.get(finishZipPath), allPath, Paths.get(LABEL_ZIPDIR).resolve(tmp_folder).toString)
    finishZipPath
  }

  /**
    * print detail information of a given task
    * @param taskid unique identification for a task
    * @param userid unique identification for a User
    * @param raise if the 404 error should be raised here
    * @return JAVA Map
    */
  def getTaskDetails(taskid: Integer, userid: Option[Int] = None, raise: Boolean = true): Option[Map[String, Any]] = {
    val usersIdOrNull = if (userid.isDefined) userid.get else null
    val list = DB.query("SELECT t.*, ted.description as external_description from task_testsystem t_t join task t " +
      "on t.task_id = t_t.task_id left join task_external_description ted on ted.testsystem_id = t_t.testsystem_id " +
      "and ted.task_id = t.task_id and ted.user_id = ? where t_t.task_id = ? order by t_t.ordnr limit 1",
      (res, _) => {
        val lineMap = Map(TaskDBLabels.courseid -> res.getString(TaskDBLabels.courseid),
          TaskDBLabels.taskid -> res.getInt(TaskDBLabels.taskid),
          TaskDBLabels.name -> res.getString(TaskDBLabels.name),
          TaskDBLabels.description -> res.getString(TaskDBLabels.description),
          TaskDBLabels.deadline -> nullSafeTime(res.getTimestamp(TaskDBLabels.deadline)),
          TaskTestsystemDBLabels.testsystems -> getTestsystemsByTask(res.getInt(TaskDBLabels.taskid)),
          TaskDBLabels.external_description -> res.getString(TaskDBLabels.external_description),
          TaskDBLabels.load_external_description -> res.getBoolean(TaskDBLabels.load_external_description),
          TaskDBLabels.courseid ->  res.getInt(TaskDBLabels.courseid))

        if (userid.isDefined){
          val submissionInfos = submissionService.getLastSubmissionResultInfoByTaskIDAndUser(taskid, userid.get)

          val subId = submissionInfos(SubmissionDBLabels.submissionid).asInstanceOf[String]
          val combinedPassed: String = if (subId == null) null else submissionService.getSubmissionPassed(Integer.parseInt(subId))
          lineMap ++ Map(SubmissionDBLabels.evaluation -> submissionInfos(SubmissionDBLabels.evaluation),
            LABEL_FILE -> submissionInfos(SubmissionDBLabels.filename),
            SubmissionDBLabels.combined_passed -> combinedPassed,
            SubmissionDBLabels.submit_date -> submissionInfos(SubmissionDBLabels.submit_date),
            SubmissionDBLabels.submission_data -> submissionInfos(SubmissionDBLabels.submission_data))
        } else {
          lineMap
        }
      }, usersIdOrNull, taskid)
    if(list.isEmpty && raise) {
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
    * @param result_type type of answers encoding
    * @param passed test result passed information (0 = failed, 1 = passed)
    * @param exitcode tiny peace of status information
    * @param best_result_fit contains the solution which the testsystem select the best match to check the submission
    * @param pre_result contains the solution which the testsystem pre renders to compare with the original expected result
    * @param testsystem_id from which testsystem we got the answer
    * @return Boolean: did update work
    */
  def setResultOfTask(submissionid: Int, result: String, result_type: String, passed: String, exitcode: Int, best_result_fit: String,
                      pre_result: String, testsystem_id: String): Boolean = {
    val num = DB.update(
      "INSERT INTO submission_testsystem (result, result_type, choice_best_result_fit, calculate_pre_result, passed, exitcode, " +
        "result_date, submission_id, testsystem_id, step) " +
        "select ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), ?, ?, COALESCE(max(step),0)+1 as nextstep from submission_testsystem  where submission_id = ?;",
      result, result_type, best_result_fit, pre_result, passed, exitcode, submissionid, testsystem_id, submissionid)
    num > 0
  }

  /**
    * convert any to string, if it is null return null
    * @param any any variable
    * @return variable as string
    */
  def stringOrNull(any: Any): String = {
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
        TaskTestsystemDBLabels.test_file_accept -> submissionService.getNullOrBoolean(res.getString(TaskTestsystemDBLabels.test_file_accept)),
        TaskTestsystemDBLabels.test_file_accept_error -> res.getString(TaskTestsystemDBLabels.test_file_accept_error),
        TaskTestsystemDBLabels.test_file_name -> res.getString(TaskTestsystemDBLabels.test_file_name),
        TestsystemLabels.name -> res.getString(TestsystemLabels.name),
        TestsystemLabels.description -> res.getString(TestsystemLabels.description),
        TestsystemLabels.supported_formats -> res.getString(TestsystemLabels.supported_formats),
        TestsystemLabels.machine_ip -> res.getString(TestsystemLabels.machine_ip),
        TestsystemLabels.machine_port -> res.getString(TestsystemLabels.machine_port),
        TestsystemLabels.accepted_input -> res.getInt(TestsystemLabels.accepted_input))
    }, taskid)
  }

  /**
    * get the ith testsystem id of a task
    * @param task_id unique id of task
    * @param index which index of testsystem
    * @return testsystem id
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
    val usersIdOrNull = if (userid.isDefined) userid.get else null
    DB.query("select t.*, ted.description as external_description " +
      "from task t " +
      "       left join (select task_external_description.* " +
      "                  from task_external_description " +
      "                         join (select t_t.task_id, testsystem_id " +
      "                               from task_testsystem t_t " +
      "                                      join (select min(ordnr) as ordnr, task_id " +
      "                                            from task_testsystem " +
      "                                            group by task_id) ttm " +
      "                                       on ttm.ordnr = t_t.ordnr and ttm.task_id = t_t.task_id) " +
      "                      tsys on tsys.testsystem_id = task_external_description.testsystem_id and " +
      "                              tsys.task_id = task_external_description.task_id) " +
      "    ted on ted.task_id = t.task_id and ted.user_id = ? " +
      "where t.course_id = ?",
      (res, _) => {
        val lineMap = Map(
          TaskDBLabels.courseid -> res.getString(TaskDBLabels.courseid),
          TaskDBLabels.taskid -> res.getInt(TaskDBLabels.taskid),
          TaskDBLabels.name -> res.getString(TaskDBLabels.name),
          TaskDBLabels.description -> res.getString(TaskDBLabels.description),
          TaskDBLabels.deadline -> nullSafeTime(res.getTimestamp(TaskDBLabels.deadline)),
          TaskDBLabels.load_external_description -> res.getBoolean(TaskDBLabels.load_external_description),
          TaskDBLabels.external_description -> res.getString(TaskDBLabels.external_description),
          "testsystems" -> getTestsystemsByTask(res.getInt(TaskDBLabels.taskid)))
        if (userid.isDefined){
          val submissionInfos = submissionService.getLastSubmissionResultInfoByTaskIDAndUser(res.getInt(TaskDBLabels.taskid), userid.get)
          val subId = submissionInfos(SubmissionDBLabels.submissionid).asInstanceOf[String]
          val combinedPassed: String = if (subId == null) null else submissionService.getSubmissionPassed(Integer.parseInt(subId))
          lineMap ++ Map(
            SubmissionDBLabels.evaluation -> submissionInfos(SubmissionDBLabels.evaluation),
            LABEL_FILE -> submissionInfos(SubmissionDBLabels.filename),
            SubmissionDBLabels.submit_date -> submissionInfos(SubmissionDBLabels.submit_date),
            SubmissionDBLabels.submission_data -> submissionInfos(SubmissionDBLabels.submission_data),
            SubmissionDBLabels.combined_passed -> combinedPassed
          )
        } else {
          lineMap
        }
      }, usersIdOrNull, courseid)
  }

  /**
    * create a task to a given course
    * @author Benjamin Manns
    * @param name Task name
    * @param description Task description
    * @param courseid Course where task is created for
    * @param deadline until when the task is open
    * @param testsystems: list of refered testsystems
    * @param load_extern_info: load external description of task by testsytsem
    * @return Scala Map
    */
  def createTask(name: String, description: String, courseid: Int, deadline: Date, testsystems: List[String],
                 load_extern_info: Boolean): Map[String, AnyVal] = {
    val (num, holder) = DB.update((con: Connection) => {
      val ps = con.prepareStatement(
        "INSERT INTO task (task_name, task_description, course_id, deadline, load_external_description) VALUES (?,?,?,?,?)",
        Statement.RETURN_GENERATED_KEYS
      )

      ps.setString(1, name)
      ps.setString(2, description)
      ps.setInt(3, courseid)
      ps.setString(4, sdf.format(deadline))
      ps.setBoolean(5, load_extern_info)
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

    Map(LABEL_SUCCESS -> (num == 1 && setTestsystemsForTask(testsystemMap, insertedId)), "taskid" -> insertedId)
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
    1 == DB.update("UPDATE task_testsystem set test_file_name = ? where task_id = ? and testsystem_id = ? ", filename, taskid, testsystem_id)
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
    1 == DB.update("update task_testsystem set test_file_accept_error = null, test_file_accept = null where " +
      "task_id = ? and testsystem_id = ?", taskid, testsystem_id)
  }

  /**
    * update Task by its Task ID
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param name Task name
    * @param description Task description
    * @param deadline until when the task is open
    * @param plagiat_check: plagiat check status
    * @param load_extern_info: load external description of task by testsytsem
    * @return result if update works
    */
  def updateTask(taskid: Int, name: String = null, description: String = null, deadline: Date = null,
                 plagiat_check: Any = null, load_extern_info: Any = null): Boolean = {
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

    if (deadline != null) {
      successfulUpdates += DB.update("UPDATE task set deadline = ? where task_id = ? ", sdf.format(deadline), taskid)
      updates += 1
    }

    if (plagiat_check != null) {
      val status = plagiat_check.asInstanceOf[Boolean]
      successfulUpdates += DB.update("UPDATE task set plagiat_check_done = ? where task_id = ? ", status, taskid)
      updates += 1
    }

    if (load_extern_info != null) {
      val status = load_extern_info.asInstanceOf[Boolean]
      successfulUpdates += DB.update("UPDATE task set load_external_description = ? where task_id = ? ", status, taskid)
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
    * @return update succeeded
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
      success_steps += DB.update("INSERT INTO task_testsystem (task_id, testsystem_id, ordnr) VALUES (?,?,?) ", task_id,
        line(TaskTestsystemDBLabels.testsystem_id),
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
    Map(LABEL_SUCCESS -> (num == 1))
  }

  /**
    * set info / task description of external system
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param description description of task
    * @param username users request
    * @param testsystem_id answer from which testsystem
    * @return result if delete works
    */
  def setExternalAnswerOfTaskByTestsytem(taskid: Int, description: String, username: String, testsystem_id: String): Map[String, Boolean] = {
    val num = DB.update("insert into task_external_description (task_id, user_id, testsystem_id, description) select ?,user_id,?,? from user " +
      "where username = ? on duplicate key update description = ?", taskid, testsystem_id, description, username, description)
    Map(LABEL_SUCCESS -> (num == 1))
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
    if (user.isAtLeastInRole(Role.MODERATOR)) {
      true
    } else {
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
    if (user.isAtLeastInRole(Role.MODERATOR)) {
        true
    } else {
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
    DB.query("select testsystem_id from task_testsystem join testsystem using(testsystem_id) where task_id = ? order by ordnr",
      (res, _) => res.getString(TestsystemLabels.id), taskid)
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
          TaskDBLabels.deadline -> nullSafeTime(res.getTimestamp(TaskDBLabels.deadline)),
          TaskTestsystemDBLabels.testsystems -> getTestsystemsByTask(res.getInt(TaskDBLabels.taskid)))
      })
    list
  }

  private def nullSafeTime(t: Timestamp): java.lang.Long = if (t == null) null else t.getTime
  private def nullSafeTime(t: Date): java.lang.Long = if (t == null) null else t.getTime
}
