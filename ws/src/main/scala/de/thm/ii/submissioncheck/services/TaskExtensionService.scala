package de.thm.ii.submissioncheck.services

import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path, Paths}
import java.sql.{Connection, Statement}

import de.thm.ii.submissioncheck.controller.ClientService
import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, JsonParser, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.{TaskExtension, User}
import de.thm.ii.submissioncheck.security.Secrets
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

/**
  * Enable communication with Tasks Extensions
  *
  * @author Benjamin Manns
  */
@Component
class TaskExtensionService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  /**
    * Class holds all DB labels
    */

  @Autowired
  private val tokenService: TokenService = null

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

  private val storageService: StorageService = null
  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  private final var LABEL_ZIPDIR = "zip-dir"
  private final var LABEL_UPLOADDIR = "upload-dir"
  private final var LABEL_UNDERLINE = "_"
  private val LABEL_DESC = "desc"
  private val LABEL_DATA = "data"
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
  private val LABEL_SUCCESS = "success"
  private val LABEL_EXTERNAL = "external"
  private val topicTaskRequest: String = "new_task_request"

  /**
    * save or update a task extended information by user with a given subject
    * @param taskid task ID
    * @param userid user ID
    * @param subject type / handler of information
    * @param data data encoded as string (json, base64, ...)
    * @param info_typ what kind of data is stored (string / file)
    * @return if update succeeded
    */
  def setTaskExtension(taskid: Int, userid: Int, subject: String, data: String, info_typ: String): Boolean = {
    if (!List("file", "string").contains(info_typ)) throw new BadRequestException("info_typ not allowed")
    val num = DB.update(
      "INSERT INTO task_extension (taskid, userid, subject, data, info_typ) values (?,?,?,?,?) on duplicate key update data = ?",
      taskid, userid, subject, data, info_typ, data)
    num > 0
  }

  /**
    * get list of task extension by taks and user
    * @param taskid task ID
    * @param userid user ID
    * @return list of Task Extension Models
    */
  def getAllExensionsByTask(taskid: Int, userid: Int): List[TaskExtension] = {
    DB.query("SELECT * from task_extension where taskid = ? and userid = ?",
      (res, _) => {
        new TaskExtension(res.getInt("taskid"), res.getInt("userid"), res.getString("subject"), res.getString("data"),
          res.getString("info_typ"))
      }, taskid, userid)
  }
}
