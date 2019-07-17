package de.thm.ii.submissioncheck.services

import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path, Paths}
import java.sql.{Connection, Statement}

import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

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
  /** holds connection to storageService*/
  val storageService = new StorageService(compile_production)
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
      (res, _) => res.getInt("offset") , submission_id)
    val offset: Int = offsetRes.head
    DB.query("select * from task_testsystem tt join task using(task_id) join submission s on task.task_id = s.task_id where submission_id = ? limit ?,1",
      (res, _) => res.getString(TaskTestsystemDBLabels.testsystem_id) , submission_id, offset).headOption
  }

  /**
    * get the user of a submission id
    * @param submission_id unique submission identification
    * @return User
    */
  def getUserOfSubmission(submission_id: Int): Option[User] = {
    val users = DB.query("select u.*, s.submission_id from submission s join user u using(user_id) where s.submission_id = ?",
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
          SubmissionDBLabels.submit_date -> res.getInt(SubmissionDBLabels.submit_date),
          SubmissionDBLabels.filename -> res.getInt(SubmissionDBLabels.filename),
          SubmissionDBLabels.taskid -> res.getInt(SubmissionDBLabels.taskid),
          SubmissionDBLabels.userid -> res.getInt(SubmissionDBLabels.userid),
        SubmissionDBLabels.submission_data -> res.getInt(SubmissionDBLabels.submission_data))

      }, submission_id).headOption
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

  def getLastSubmissionResultInfoByTaskIDAndUser(taskid: Int, userid: Int): Map[String, Any] = {
    val submissions = getSubmissionsByTaskAndUser(taskid.toString, userid, LABEL_DESC)
    if(submissions.nonEmpty){
      submissions.head
    } else {
      Map(SubmissionDBLabels.filename -> null, SubmissionDBLabels.submission_data -> null,
        SubmissionDBLabels.submit_date -> null, SubmissionDBLabels.evaluation -> getEmptyTestsystemSubmissionEvaluationList(taskid))
    }
  }

  private def getNullOrBoolean(boolDBString: String) = {
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
    * @return list of evaluated submission
    */
  def getTestsystemSubmissionEvaluationList(submission_id: Int): List[Map[String, Any]] = {
    DB.query("select tt.*, st.exitcode, st.passed, st.result, st.step, st.result_date, ss.submission_id from submission ss " +
      "join task t using(task_id) join task_testsystem tt using (task_id) " +
      "left join submission_testsystem st on st.testsystem_id = tt.testsystem_id and st.submission_id = ? and tt.ordnr <= st.step " +
      "where ss.submission_id = ? order by tt.ordnr",
      (res, _) => {
        Map(TaskTestsystemDBLabels.testsystem_id -> res.getString(TaskTestsystemDBLabels.testsystem_id),
          SubmissionDBLabels.submissionid -> res.getInt(SubmissionDBLabels.submissionid),
          TaskTestsystemDBLabels.ordnr -> res.getInt(TaskTestsystemDBLabels.ordnr),
          SubmissionTestsystemDBLabels.exitcode -> res.getInt(SubmissionTestsystemDBLabels.exitcode),
          SubmissionTestsystemDBLabels.passed -> getNullOrBoolean(res.getString(SubmissionTestsystemDBLabels.passed)),
          SubmissionTestsystemDBLabels.result -> res.getString(SubmissionTestsystemDBLabels.result),
          SubmissionTestsystemDBLabels.result_date -> res.getTimestamp(SubmissionTestsystemDBLabels.result_date))
      }, submission_id, submission_id)
  }

  /**
    * get combined passed result of submission
    * @param submission_id unique submission identification
    * @return combined answer
    */
  def getSubmissionPassed(submission_id: Int): String = {
    val passedList = getTestsystemSubmissionEvaluationList(submission_id).map(line => line(SubmissionTestsystemDBLabels.passed))
    if (passedList.contains("false")){
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
    * @return Scala List of Maps
    */
  def getSubmissionsByTaskAndUser(taskid: String, userid: Any, sort: String = "asc"): List[Map[String, Any]] = {
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
          "evaluation" -> getTestsystemSubmissionEvaluationList(res.getInt(SubmissionDBLabels.submissionid))
        )
      }, taskid, userid)
  }
}
