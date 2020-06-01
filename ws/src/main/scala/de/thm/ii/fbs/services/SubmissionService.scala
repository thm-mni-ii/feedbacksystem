package de.thm.ii.fbs.services

import java.io.BufferedWriter
import java.sql.{Connection, Statement, Timestamp}
import java.text.SimpleDateFormat
import java.util.{Date, Timer, TimerTask}

import scala.jdk.CollectionConverters._
import au.com.bytecode.opencsv.CSVWriter
import de.thm.ii.fbs.ReSubmissionDBLabels
import de.thm.ii.fbs.model.{AdminUser, User}
import de.thm.ii.fbs.util.{DB, ResourceNotFoundException}
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
  private var storageService: StorageService = null
  private final val LABEL_ZERO_STRING = "0"
  private final val LABEL_ONE_STRING = "1"

  private val sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

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
          SubmissionDBLabels.submit_date -> nullSafeTime(res.getTimestamp(SubmissionDBLabels.submit_date)),
          SubmissionDBLabels.filename -> res.getString(SubmissionDBLabels.filename),
          SubmissionDBLabels.taskid -> res.getInt(SubmissionDBLabels.taskid),
          SubmissionDBLabels.userid -> res.getInt(SubmissionDBLabels.userid),
          SubmissionDBLabels.submission_data -> res.getString(SubmissionDBLabels.submission_data))
      }, submission_id).headOption
  }

  /**
    * set all submissions for the tas as passed (if docent think it is passed, thought)
    * @param submissionid submission id
    * @param taskid taskid
    * @return update passed
    */
  def setSubmissionAsPassed(submissionid: Int, taskid: Int): Boolean = {
    val testsystems = getEmptyTestsystemSubmissionEvaluationList(taskid)
    var num = 0
    for ((testsystem, i) <- testsystems.zipWithIndex) {
      num += DB.update("INSERT INTO submission_testsystem (submission_id, testsystem_id, exitcode, passed, result_date, step, result, result_type) " +
        " values (?, ?, 0, 1, CURRENT_TIMESTAMP, ?, 'Docent marked as passed', 'string') " +
        " on duplicate key update  exitcode = 0, passed = 1", submissionid, testsystem(TaskTestsystemDBLabels.testsystem_id), i + 1)
    }
    testsystems.nonEmpty
  }

  private def replaceSubmissionTestsystem(submissionid: Int, result: Any, passed: Any, result_date: Any, exitcode: Int,
                                          testsystem_id: String, step: Int): Boolean = {
    val num = DB.update(
      "REPLACE INTO submission_testsystem (result, passed, exitcode, result_date, submission_id, testsystem_id, step) values (?, ?, ?, ?, ?, ?, ?);",
      result, passed, exitcode, result_date, submissionid, testsystem_id, step)
    num > 0
  }

  private def insertReplaceSubmission(subid: Any, submit_date: Date, user_id: Int, task_id: Int, filename: String, sub_data: String,
                                      plagiat_passed: Any): Int = {
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
        ps.setString(paramIndex, sdf.format(submit_date)); paramIndex+=1
        ps.setInt(paramIndex, user_id); paramIndex+=1
        ps.setInt(paramIndex, task_id); paramIndex+=1
        ps.setString(paramIndex, filename); paramIndex+=1
        ps.setString(paramIndex, sub_data); paramIndex+=1
        if (plagiat_passed == null){
          ps.setString(paramIndex, null); paramIndex+=1
        } else {
          ps.setString(paramIndex, plagiat_passed.toString); paramIndex+=1
        }
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
  def replaceUpdateSubmission(data: List[Map[String, Any]], taskIDMap: Map[Int, Int]): Unit = {
    for (submission <- data){
      var subID = submission(SubmissionDBLabels.submissionid).toString.toInt
      val insertSubId = if (getSubmissionDetails(subID).nonEmpty) subID else null
      val s_date = new Date(submission(SubmissionDBLabels.submit_date).asInstanceOf[Long])

      var corTaskID = submission(SubmissionDBLabels.taskid).toString.toInt
      if (taskIDMap.contains(corTaskID)) corTaskID = taskIDMap(corTaskID) // if there is a mapping used this

      subID = insertReplaceSubmission(insertSubId, s_date, submission(SubmissionDBLabels.userid).toString.toInt, corTaskID,
        submission(SubmissionDBLabels.filename).toString, submission(SubmissionDBLabels.submission_data).toString,
        submission(SubmissionDBLabels.plagiat_passed))

      val evaList = submission("evaluation").asInstanceOf[List[Map[String, Any]]]
      for (eva <- evaList) { //then insert update replace evaluation list
        val res_date = if (eva(SubmissionTestsystemDBLabels.result_date) == null) {
          null
        } else {
          new Date(eva(SubmissionTestsystemDBLabels.result_date).asInstanceOf[Long])
        }
        replaceSubmissionTestsystem(eva(SubmissionDBLabels.submissionid).toString.toInt, eva(SubmissionTestsystemDBLabels.result),
          eva(SubmissionTestsystemDBLabels.passed), res_date, eva(SubmissionTestsystemDBLabels.exitcode).toString.toInt,
          eva(SubmissionTestsystemDBLabels.testsystem_id).toString, eva("ordnr").toString.toInt)
      }
    }
  }

  /**
    * prepare database for resubmitting / analyzing a submission
    * @param subid submisison id
    * @param taskid task id
    * @param testsystems list of all testsystems which should triggered
    */
  def reSubmitASubmission(subid: Int, taskid: Int, testsystems: List[String]): Unit = {
    // clean old entries
    DB.update("DELETE from resubmission where subid = ?", subid)
    // add new entries
    for ((system, i) <- testsystems.zipWithIndex){
      DB.update("insert into resubmission (subid, ordnr, testsystem_id) values (?,?,?) ", subid, i + 1, system)
    }

    // trigger re submission
    this.taskService.sendSubmissionToTestsystem(subid, taskid, testsystems.head, new AdminUser(), "resubmit", "")
  }

  /**
    * set a result entry for a resubmission
    * @param subid submission id
    * @param testsystem testsystem id
    * @param result result string of testsystem
    * @param result_type result type (is a string)
    * @return update succeeded
    */
  def setResultOfReSubmit(subid: Int, testsystem: String, result: String, result_type: String): Boolean = {
    1 == DB.update("update resubmission set result = ?, result_type = ? where subid = ? and testsystem_id = ? ", result, result_type, subid, testsystem)
  }

  /**
    * get (none ready) result sets of resubmissions/analyze of a submission id
    * @param subid the submission id
    * @return result set
    */
  def getReSubmittedResults(subid: Int): List[Map[String, Any]] = {
    DB.query("select * from resubmission where subid = ?",
      (res, _) => {
        Map(ReSubmissionDBLabels.subid -> res.getInt(ReSubmissionDBLabels.subid),
          ReSubmissionDBLabels.ordnr -> res.getInt(ReSubmissionDBLabels.ordnr),
          ReSubmissionDBLabels.testsystem_id -> res.getString(ReSubmissionDBLabels.testsystem_id),
          ReSubmissionDBLabels.result -> res.getString(ReSubmissionDBLabels.result),
          ReSubmissionDBLabels.result_type -> res.getString(ReSubmissionDBLabels.result_type),
          ReSubmissionDBLabels.test_file_accept -> res.getBoolean(ReSubmissionDBLabels.test_file_accept),
          ReSubmissionDBLabels.test_file_accept_error -> res.getString(ReSubmissionDBLabels.test_file_accept_error),
          ReSubmissionDBLabels.test_file_name -> res.getString(ReSubmissionDBLabels.test_file_name))
      }, subid)
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
    } catch {
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
          SubmissionTestsystemDBLabels.result_date -> nullSafeTime(res.getTimestamp(SubmissionTestsystemDBLabels.result_date)))
      }, task_id)
  }

  /**
    * get evaluated list of testsystems by submission
    * @param submission_id unique submission identification
    * @param with_result_fit also select the best fit of matching result
    * @return list of evaluated submission
    */
  def getTestsystemSubmissionEvaluationList(submission_id: Int, with_result_fit: Boolean = false): List[Map[String, Any]] = {
    DB.query("select tt.*, st.exitcode, st.passed, st.result, st.result_type, st.step, st.result_date, st.choice_best_result_fit, " +
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
          SubmissionTestsystemDBLabels.result_type -> res.getString(SubmissionTestsystemDBLabels.result_type),
          SubmissionTestsystemDBLabels.result_date -> nullSafeTime(res.getTimestamp(SubmissionTestsystemDBLabels.result_date)))

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
    * get one line of submission matrix
    * @param userid user id
    * @param courseid course id
    * @return submission matrix row
    */
  def getSummarizedSubmissionEvaluationOfCourseOfUser(userid: Int, courseid: Int): (Boolean, List[Map[String, Any]]) = {
    var globalPassed: Int = 0
    val list = DB.query("SELECT  u.prename, u.surname, t.task_name, t.deadline, t.task_id, min(s.plagiat_passed) plagiat_sum, " +
      "max(st.passed) as passed_sum, count(st.passed) as count_sum, st.result_date " +
      "from task t left join submission s on t.task_id = s.task_id and s.user_id = ? " +
      "                                              left join submission_testsystem st on s.submission_id = st.submission_id " +
      "                                               left join user u on s.user_id = u.user_id " +
      "where t.course_id = ? " +
      "group by t.task_id",
      (res, rowNum) => {
        val db_passed = res.getString("passed_sum")
        val passed_string: Any = if (db_passed == LABEL_ONE_STRING) true else if (db_passed == LABEL_ZERO_STRING) false else null
        if (passed_string != null && passed_string == true) globalPassed += 1

        val db_plagiat = res.getString("plagiat_sum")
        val taskPlagiatPassed: Any = if (db_plagiat == null){
          null
        } else if (db_plagiat.contains(LABEL_ZERO_STRING)) {
          false
        } else if (db_plagiat.contains(LABEL_ONE_STRING)) {
          true
        }

        Map(s"""A${rowNum}""" -> Map(TaskDBLabels.name -> res.getString(TaskDBLabels.name),
          TaskDBLabels.taskid -> res.getString(TaskDBLabels.taskid), "trials" -> res.getInt("count_sum"), "passed" -> passed_string,
          "passed_date" -> nullSafeTime(res.getDate("result_date")), "deadline" -> stringOrNull(res.getString(TaskDBLabels.deadline)),
          SubmissionDBLabels.plagiat_passed -> taskPlagiatPassed))
      }, userid, courseid)

    (list.length == globalPassed, list)
  }

  private def stringOrNull(any: Any): String = {
    if (any == null) {
      null
    } else {
      any.toString
    }
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
          SubmissionDBLabels.submit_date -> nullSafeTime(res.getTimestamp(SubmissionDBLabels.submit_date)),
          SubmissionDBLabels.plagiat_passed -> res.getString(SubmissionDBLabels.plagiat_passed),
          "evaluation" -> getTestsystemSubmissionEvaluationList(res.getInt(SubmissionDBLabels.submissionid), with_result_fit)
        )
      }, taskid, userid)
  }

  private def nullSafeTime(t: Timestamp): java.lang.Long = if (t == null) null else t.getTime
  private def nullSafeTime(t: Date): java.lang.Long = if (t == null) null else t.getTime

  /**
    * generate a Submission CSV based on the submission matrix
    * @param courseid the unique course id
    * @return web compatble file resource
    */
  def generateSubmissionCSV(courseid: Int): ResponseEntity[UrlResource] = {
    // put this in a service!
    val matrix = this.courseService.getSubmissionsMatrixByCourse(courseid, 0, Int.MaxValue, "").asInstanceOf[List[Map[String, Any]]]
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
