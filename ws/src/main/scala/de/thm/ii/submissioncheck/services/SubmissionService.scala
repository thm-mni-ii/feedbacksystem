package de.thm.ii.submissioncheck.services

import java.io.{BufferedWriter, FileWriter}
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path, Paths}
import java.sql.{Connection, Statement}
import java.util.{Timer, TimerTask}

import scala.collection.JavaConverters._
import au.com.bytecode.opencsv.CSVWriter
import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import org.springframework.beans.factory.SmartInitializingSingleton
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.context.annotation.Bean
import org.springframework.core.io.UrlResource
import org.springframework.http.ResponseEntity
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import scala.collection.mutable.ListBuffer

/**
  * Enable communication with Tasks and their Results
  *
  * @author Benjamin Manns
  */
@Component
class SubmissionService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  /**
    * Class holds all DB labels
    */

  @Autowired
  private val tokenService: TokenService = null
  @Autowired
  private val taskService: TaskService = null
  private final val ERROR_CREATING_ADMIN_MSG = "Error creating submission. Please contact administrator."
  @Value("${compile.production}")
  private val compile_production: Boolean = true
  @Value("${cas.client-host-url}")
  private val UPLOAD_BASE_URL: String = null

  private var storageService: StorageService = null

  /**
    * Using autowired configuration, they will be loaded after self initialization
    */
  def configurateStorageService(): Unit = {
    this.storageService = new StorageService(compile_production)
  }

  /**
    * After autowiring initialize storage service
    * @return timer run
    */
  @Bean
  def importStorageProcessor: SmartInitializingSingleton = () => {
    /** wait 3 seconds to be sure everything is connected like it should*/
    val bean_delay = 300
    new Timer().schedule(new TimerTask() {
      override def run(): Unit = {
        configurateStorageService
      }
    }, bean_delay)
  }
  /** all interactions with tasks are done via a taskService*/
  @Autowired
  val courseService: CourseService = null
  private val LABEL_DESC = "desc"
  /**
    * Gets the filename by a given Submissionid
    * @param submission_id unique submission identification
    * @return just the filename
    */
  def getSubmittedFileBySubmission(submission_id: Int): String = {
    val list = DB.query("SELECT filename from submission where submission_id = ?",
      (res, _) => res.getString("filename"), submission_id)
    if (list.isEmpty) {
      throw new ResourceNotFoundException
    }
    list.head
  }

  /**
    * generate token validated URL to download submitted student file
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param submissionid unique taskid identification
    * @return URL String
    */
  def getURLOfSubmittedTestFile(taskid: Int, submissionid: Int): String = {
    taskService.getUploadBaseURL() + "/api/v1/tasks/" + taskid.toString + "/files/submissions/" + submissionid.toString
  }

  /**
    * Get the next testsystem of a task for a submission
    * @param submission_id a submitted task
    * @return testsystem ID
    */
  def getNextTestsystemFromSubmission(submission_id: Int): Option[String] = {
    val offsetRes = DB.query("select count(*) as offset from submission_testsystem where submission_id = ?",
      (res, _) => res.getInt("offset"), submission_id)
    val offset: Int = offsetRes.head
    DB.query("select * from task_testsystem tt join task using(task_id) join submission s on task.task_id = s.task_id where submission_id = ? limit ?,1",
      (res, _) => res.getString(TaskTestsystemDBLabels.testsystem_id), submission_id, offset).headOption
  }

  /**
    * get the user of a submission id
    * @param submission_id unique submission identification
    * @return User
    */
  def getUserOfSubmission(submission_id: Int): Option[User] = {
    val users = DB.query("select r.*, u.*, s.submission_id from submission s join user u using(user_id) join role r using(role_id) where s.submission_id = ?",
      (res, _) => {
        new User(res.getInt(UserDBLabels.user_id), res.getString(UserDBLabels.username), res.getString(UserDBLabels.prename),
          res.getString(UserDBLabels.surname), res.getString(UserDBLabels.email)
          , res.getString(UserDBLabels.role_name), res.getInt(UserDBLabels.role_id), res.getBoolean(UserDBLabels.privacy_checked))
      }, submission_id)
    users.headOption
  }

  /**
    * get a details Map of Submission by ID
    * @param submission_id unique submission identification
    * @return details Map
    */
  def getSubmissionDetails(submission_id: Int): Option[Map[String, Any]] = {
    DB.query("select * from submission s where s.submission_id = ?",
      (res, _) => {
        Map(SubmissionDBLabels.submissionid -> res.getInt(SubmissionDBLabels.submissionid),
          SubmissionDBLabels.plagiat_passed -> res.getInt(SubmissionDBLabels.plagiat_passed),
          SubmissionDBLabels.submit_date -> res.getTimestamp(SubmissionDBLabels.submit_date),
          SubmissionDBLabels.filename -> res.getString(SubmissionDBLabels.filename),
          SubmissionDBLabels.taskid -> res.getInt(SubmissionDBLabels.taskid),
          SubmissionDBLabels.userid -> res.getInt(SubmissionDBLabels.userid),
        SubmissionDBLabels.submission_data -> res.getString(SubmissionDBLabels.submission_data))

      }, submission_id).headOption
  }

  private def replaceSubmissionTestsystem(submissionid: Int, result: Any, passed: Any, result_date: Any, exitcode: Int,
                                          testsystem_id: String, step: Int): Boolean = {
    val num = DB.update(
      "REPLACE INTO submission_testsystem (result, passed, exitcode, result_date, submission_id, testsystem_id, step) values (?, ?, ?, ?, ?, ?, ?);",
      result, passed, exitcode, result_date, submissionid, testsystem_id, step)
    num > 0
  }

  private def insertReplaceSubmission(subid: Any, submit_date: String, user_id: Int, task_id: Int, filename: String, sub_data: String,
                                      plagiat_passed: Boolean): Int = {
      val (num, holder) = DB.update((con: Connection) => {
        val ps = con.prepareStatement("REPLACE INTO submission (submission_id, submit_date, user_id, task_id, filename, submission_data," +
          "plagiat_passed) VALUES (?,?,?,?,?,?,?);",
          Statement.RETURN_GENERATED_KEYS
        )
        var paramIndex = 1
        if (subid == null) {
          ps.setNull(paramIndex, 1);
        } else {
          ps.setInt(paramIndex, subid.toString.toInt)
        }
        paramIndex+=1
        ps.setString(paramIndex, submit_date); paramIndex+=1
        ps.setInt(paramIndex, user_id); paramIndex+=1
        ps.setInt(paramIndex, task_id); paramIndex+=1
        ps.setString(paramIndex, filename); paramIndex+=1
        ps.setString(paramIndex, sub_data); paramIndex+=1
        ps.setBoolean(paramIndex, plagiat_passed); paramIndex+=1
        ps
      })

      val insertedId = holder.getKeyList
      if (num == 0) {
        throw new RuntimeException(ERROR_CREATING_ADMIN_MSG)
      }
    if (subid == null) insertedId.get(0).get("GENERATED_KEY").toString.toInt else subid.toString.toInt
  }

  /**
    * restore, replace or insert submission and testsystem answers
    * @param data submission config map
    * @param taskIDMap if tasks has been new created, the reference is saved there
    * @return worked out
    */
  def replaceUpdateSubmission(data: List[Map[String, Any]], taskIDMap: Map[Int, Int]): Boolean = {
    for (submission <- data){
      var subID = submission(SubmissionDBLabels.submissionid).toString.toInt
      val insertSubId = if (getSubmissionDetails(subID).nonEmpty) subID else null
      val s_date = DateTimeOperation.fromTimestamp(submission(SubmissionDBLabels.submit_date).toString)

      var corTaskID = submission(SubmissionDBLabels.taskid).toString.toInt
      if (taskIDMap.contains(corTaskID)) corTaskID = taskIDMap(corTaskID) // if there is a mapping used this

      subID = insertReplaceSubmission(insertSubId, s_date, submission(SubmissionDBLabels.userid).toString.toInt, corTaskID,
        submission(SubmissionDBLabels.filename).toString, submission(SubmissionDBLabels.submission_data).toString,
        submission(SubmissionDBLabels.plagiat_passed).asInstanceOf[Boolean])

      val evaList = submission("evaluation").asInstanceOf[List[Map[String, Any]]]
      for (eva <- evaList) { //then insert update replace evaluation list
        val resDateRaw = eva(SubmissionTestsystemDBLabels.result_date)
        val res_date = if (resDateRaw == null) null else DateTimeOperation.fromTimestamp(resDateRaw.toString)
        replaceSubmissionTestsystem(eva(SubmissionDBLabels.submissionid).toString.toInt, eva(SubmissionTestsystemDBLabels.result),
          eva(SubmissionTestsystemDBLabels.passed), res_date, eva(SubmissionTestsystemDBLabels.exitcode).toString.toInt,
          eva(SubmissionTestsystemDBLabels.testsystem_id).toString, eva("ordnr").toString.toInt)
      }
    }
    true
  }

  /**
    * submitTaskWithFile
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @param user requesting user
    * @return SubmissionID
    */
  def submitTaskWithFile(taskid: Int, user: User): Int = {
    try {
      val (num, holder) = DB.update((con: Connection) => {
        val ps = con.prepareStatement(
          "INSERT INTO submission (task_id, user_id) VALUES (?,?);",
          Statement.RETURN_GENERATED_KEYS
        )
        ps.setInt(1, taskid)
        ps.setInt(2, user.userid)
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
    * get last submission of user for a task with its result
    * @param taskid unique identification for a task
    * @param userid requesting user
    * @return submission list
    */
  def getLastSubmissionResultInfoByTaskIDAndUser(taskid: Int, userid: Int): Map[String, Any] = {
    val submissions = getSubmissionsByTaskAndUser(taskid.toString, userid, LABEL_DESC)
    if(submissions.nonEmpty){
      submissions.head
    } else {
      Map(SubmissionDBLabels.filename -> null, SubmissionDBLabels.submission_data -> null,
        SubmissionDBLabels.submissionid -> null,
        SubmissionDBLabels.submit_date -> null, SubmissionDBLabels.evaluation -> getEmptyTestsystemSubmissionEvaluationList(taskid))
    }
  }

  /**
    * convert a "boolean string" which is 1, 0 or null to a understandable boolean (true, false, null)
    * @param boolDBString a string from DB which is a boolean / tinyint column
    * @return (true, false, null)
    */
  def getNullOrBoolean(boolDBString: String): Any = {
    if (boolDBString == null) {
      null
    } else {
      boolDBString.toInt > 0
    }
  }

  private def getEmptyTestsystemSubmissionEvaluationList(task_id: Int): List[Map[String, Any]] = {
    DB.query("select * from task_testsystem left join submission_testsystem st on false where task_id = ?",
      (res, _) => {
        Map(TaskTestsystemDBLabels.testsystem_id -> res.getString(TaskTestsystemDBLabels.testsystem_id),
          SubmissionDBLabels.submissionid -> res.getInt(SubmissionDBLabels.submissionid),
          TaskTestsystemDBLabels.ordnr -> res.getInt(TaskTestsystemDBLabels.ordnr),
          SubmissionTestsystemDBLabels.exitcode -> res.getInt(SubmissionTestsystemDBLabels.exitcode),
          SubmissionTestsystemDBLabels.passed -> getNullOrBoolean(res.getString(SubmissionTestsystemDBLabels.passed)),
          SubmissionTestsystemDBLabels.result -> res.getString(SubmissionTestsystemDBLabels.result),
          SubmissionTestsystemDBLabels.result_date -> res.getTimestamp(SubmissionTestsystemDBLabels.result_date))
      }, task_id)
  }

  /**
    * get evaluated list of testsystems by submission
    * @param submission_id unique submission identification
    * @param with_result_fit also select the best fit of matching result
    * @return list of evaluated submission
    */
  def getTestsystemSubmissionEvaluationList(submission_id: Int, with_result_fit: Boolean = false): List[Map[String, Any]] = {
    DB.query("select tt.*, st.exitcode, st.passed, st.result, st.step, st.result_date, st.choice_best_result_fit, " +
      "st.calculate_pre_result, ss.submission_id from submission ss " +
      "join task t using(task_id) join task_testsystem tt using (task_id) " +
      "left join submission_testsystem st on st.testsystem_id = tt.testsystem_id and st.submission_id = ? and tt.ordnr <= st.step " +
      "where ss.submission_id = ? order by tt.ordnr",
      (res, _) => {
        var m = Map(TaskTestsystemDBLabels.testsystem_id -> res.getString(TaskTestsystemDBLabels.testsystem_id),
          SubmissionDBLabels.submissionid -> res.getInt(SubmissionDBLabels.submissionid),
          TaskTestsystemDBLabels.ordnr -> res.getInt(TaskTestsystemDBLabels.ordnr),
          SubmissionTestsystemDBLabels.exitcode -> res.getInt(SubmissionTestsystemDBLabels.exitcode),
          SubmissionTestsystemDBLabels.passed -> getNullOrBoolean(res.getString(SubmissionTestsystemDBLabels.passed)),
          SubmissionTestsystemDBLabels.result -> res.getString(SubmissionTestsystemDBLabels.result),
          SubmissionTestsystemDBLabels.result_date -> res.getTimestamp(SubmissionTestsystemDBLabels.result_date))

          if(with_result_fit) {
            m += (SubmissionTestsystemDBLabels.choice_best_result_fit -> res.getString(SubmissionTestsystemDBLabels.choice_best_result_fit))
            m += (SubmissionTestsystemDBLabels.calculate_pre_result -> res.getString(SubmissionTestsystemDBLabels.calculate_pre_result))
          }
        m
      }, submission_id, submission_id)
  }

  /**
    * get combined passed result of submission
    * @param submission_id unique submission identification
    * @return combined answer
    */
  def getSubmissionPassed(submission_id: Int): String = {
    val passedList = getTestsystemSubmissionEvaluationList(submission_id).map(line => line(SubmissionTestsystemDBLabels.passed))
    if (passedList.contains(false)){
      "false"
    } else if (passedList.contains(null)){
      null
    } else {
      "true"
    }
  }

  /**
    * get the possible list where to upload test files
    * @param client_host_url basic url of webservice
    * @param taskid unique identification for a task
    * @return list of urls
    */
  def getUploadUrlsForTaskTestFile(client_host_url: String, taskid: Int): List[String] = {
    var linenumber = 0
    getEmptyTestsystemSubmissionEvaluationList(taskid).map(line => {
      linenumber += 1
      s"${client_host_url}/api/v1/tasks/${taskid}/testfile/${linenumber}/upload"
    })
  }

  /**
    * get all submissions from a user by a given task
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @param userid requesting user
    * @param sort sort submissions by date (asc, desc)
    * @param with_result_fit also select the choice_best_result_fit
    * @return Scala List of Maps
    */
  def getSubmissionsByTaskAndUser(taskid: String, userid: Any, sort: String = "asc", with_result_fit: Boolean = false): List[Map[String, Any]] = {
    if (!List("asc", LABEL_DESC).contains(sort)){
      throw new IllegalArgumentException("sort must be a value of `asc` or `desc`")
    }
    DB.query("SELECT  s.* from task join submission s using(task_id) where task_id = ? and user_id = ? order by submit_date " + sort,
      (res, _) => {
        Map(SubmissionDBLabels.filename -> res.getString(SubmissionDBLabels.filename),
          SubmissionDBLabels.submission_data -> res.getString(SubmissionDBLabels.submission_data),
          SubmissionDBLabels.submissionid -> res.getString(SubmissionDBLabels.submissionid),
          SubmissionDBLabels.userid -> res.getInt(SubmissionDBLabels.userid),
          SubmissionDBLabels.submit_date -> res.getTimestamp(SubmissionDBLabels.submit_date),
          SubmissionDBLabels.plagiat_passed -> res.getString(SubmissionDBLabels.plagiat_passed),
          "evaluation" -> getTestsystemSubmissionEvaluationList(res.getInt(SubmissionDBLabels.submissionid), with_result_fit)
        )
      }, taskid, userid)
  }

  /**
    * generate a Submission CSV based on the submission matrix
    * @param courseid the unique course id
    * @return web compatble file resource
    */
  def generateSubmissionCSV(courseid: Int): ResponseEntity[UrlResource] = {
    // put this in a service!
    val matrix = this.courseService.getSubmissionsMatrixByCourse(courseid, 0, Int.MaxValue).asInstanceOf[List[Map[String, Any]]]
    //var csvSchema = Array("username", "surname", "", "city")
    val tasks = matrix(0)("tasks").asInstanceOf[List[Map[String, Map[String, Any]]]]
    var csvSchema: List[String] = List("student")

    tasks.foreach(t => {
      for (k <- t.keys) {
        csvSchema = s"${k} (${t(k)("task_name")})" :: csvSchema
        // also put a header for the plagiarism information
        csvSchema = s"${k} - plagiarism passed" :: csvSchema
      }
    })

    val asString = (v: Any) => if (v == null) "0" else v.toString
    var listOfRecords = new ListBuffer[Array[String]]()
    listOfRecords += csvSchema.reverse.toArray
    // https://blog.knoldus.com/write-a-csv-fileusing-scala/
    for(m <- matrix){
      var csvLine: List[String] = List()
      csvLine = s"${m("prename")} ${m("surname")}" :: csvLine

      val tasks = m("tasks").asInstanceOf[List[Map[String, Map[String, Any]]]]

      tasks.foreach(t => { // only one key!
        for (k <- t.keys) {
          csvLine = s"${asString(t(k)("passed"))} of ${asString(t(k)("trials"))}" :: csvLine
          csvLine = s"""${t(k)("plagiat_passed")}""" :: csvLine
        }
      })
      listOfRecords += csvLine.reverse.toArray
    }
    val writer = storageService.createTemporaryFileWriter(s"""${courseid}_submission_matrix.csv""")
    val outputFile = new BufferedWriter(writer.filewriter)
    val csvWriter = new CSVWriter(outputFile)
    csvWriter.writeAll(listOfRecords.toList.asJava)
    //csvSchema.toArray
    outputFile.close()
    writer.getWebResource()
  }
}
