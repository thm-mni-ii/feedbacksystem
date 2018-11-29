package de.thm.ii.submissioncheck.controller

import java.io.{BufferedOutputStream, FileOutputStream}
import java.nio.file.Files
import java.util.{Base64, NoSuchElementException}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, JsonParser, UnauthorizedException}
import de.thm.ii.submissioncheck.services._
import javax.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.Resource
import org.springframework.http.{HttpHeaders, HttpStatus, ResponseEntity}
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile

/**
  * TaskController implement routes for submitting task and receiving results
  *
  * @author Benjamin Manns
  */
@RestController
@RequestMapping(path = Array("/api/v1"))
class TaskController {
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val tokenService: TokenService = null
  @Autowired
  private val courseService: CourseService = null

  private final val application_json_value = "application/json"

  private val topicTaskRequest: String = "new_task_request"

  /** Path variable Label ID*/
  final val LABEL_ID = "id"
  /** JSON variable taskid ID*/
  final val LABEL_TASK_ID = "taskid"
  /** JSON variable userid ID*/
  final val LABEL_USER_ID = "userid"
  /** JSON variable submissionid ID*/
  final val LABEL_SUBMISSION_ID = "submissionid"
  /** JSON variable submissionid ID*/
  final val LABEL_DATA = "data"
  private final val LABEL_FILE = "file"

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val topicName: String = "check_request"

  private val storageService: StorageService = new StorageService
  /**
    * Print all results, if any,from a given task
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{id}/result"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTaskResultByTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): List[Map[String, String]] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)
    if (requestingUser.isEmpty) {
      throw new UnauthorizedException
    }
    taskService.getTaskResults(taskid, requestingUser.get)
  }

  /**
    * Submit data for a given task
    * @param taskid unique identification for a task
    * @param jsonNode request body containing "data" parameter
    * @param request Request Header containing Headers
    * @return JSON
    */
  @ResponseStatus(HttpStatus.ACCEPTED)
  @RequestMapping(value = Array("tasks/{id}/submit"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  @ResponseBody
  def submitTask(@PathVariable(LABEL_ID) taskid: Integer, @RequestBody jsonNode: JsonNode, request: HttpServletRequest): Map[String, String] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)
    if (requestingUser.isEmpty) {
      throw new UnauthorizedException
    }
    if (!taskService.hasSubscriptionForTask(taskid, requestingUser.get) && !taskService.isPermittedForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }
    var kafkaMap = Map(LABEL_TASK_ID -> taskid.toString,
      LABEL_USER_ID -> requestingUser.get.username)

    try {
      var submissionId: Int = -1
      val dataNode = jsonNode.get(LABEL_DATA)
      if (dataNode == null) {
        val file = jsonNode.get(LABEL_FILE).asText()
        val filename = jsonNode.get("filename").asText()
        val dataBytes: Array[Byte] = Base64.getDecoder.decode(file)
        submissionId = taskService.submitTaskWithFile(taskid, requestingUser.get, filename)
        storageService.storeTaskSubmission(dataBytes, taskid, filename, submissionId)
        kafkaMap += ("fileurl" -> this.taskService.getURLOfSubmittedTestFile(taskid, submissionId))
      }
      else {
        val data = dataNode.asText
        submissionId = taskService.submitTaskWithData(taskid, requestingUser.get, data)
        kafkaMap += (LABEL_DATA -> data)
      }

      kafkaMap += (LABEL_SUBMISSION_ID -> submissionId.toString)
      val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
      logger.warn(jsonResult)
      kafkaTemplate.send(topicName, jsonResult)
      kafkaTemplate.flush()

      Map("success" -> "true", LABEL_TASK_ID -> taskid.toString, LABEL_SUBMISSION_ID -> submissionId.toString)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide a data or a file and filename parameter.")
    }
  }

  /**
    * implement REST route to get students task submission
    *
    * @author Benjamin Manns
    * @param taskid unique task identification
    * @param jsonNode request body containing "data" parameter
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{id}/submissions"), method = Array(RequestMethod.GET), consumes = Array(application_json_value))
  @ResponseBody
  def seeAllSubmissions(@PathVariable(LABEL_ID) taskid: Integer,
                        @RequestBody jsonNode: JsonNode,
                        request: HttpServletRequest): List[Map[String, String]] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    if(!this.taskService.isPermittedForTask(taskid, user.get)){
      throw new UnauthorizedException
    }
    this.taskService.getSubmissionsByTask(taskid)
  }

  /**
    * Print details for a given Task
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{id}"), method = Array(RequestMethod.GET))
  def getTaskDetails(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): Map[String, String] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)

    if (requestingUser.isEmpty) {
      throw new UnauthorizedException
    }

    taskService.getTaskDetails(taskid, requestingUser.get).getOrElse(Map.empty)
  }

  // Useful hint for Angular cooperation:
  // https://stackoverflow.com/questions/47886695/current-request-is-not-a-multipart-requestangular-4spring-boot
  /**
    * serve a route to upload a file to a given taskid
    * @author grokonez.com
    *
    * @param taskid unique identification for a task
    * @param file a multipart binary file in a form data format
    * @return HTTP Response with Status Code
    */
  @deprecated("0.1", "use task create")
  @RequestMapping(value = Array("tasks/{id}/upload"), method = Array(RequestMethod.POST))
  def handleFileUpload(@PathVariable(LABEL_ID) taskid: Int, @RequestParam(LABEL_FILE) file: MultipartFile): ResponseEntity[String] = {
    var message: String = ""
    try {
      storageService.storeTaskTestFile(file, taskid)
      message = "You successfully uploaded " + file.getOriginalFilename + "!"
      ResponseEntity.status(HttpStatus.OK).body(message)
    } catch {
      case e: Exception =>
        message = "FAIL to upload " + file.getOriginalFilename + "!"
        ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(message)
    }
  }

  /**
    * Create a task for a given course
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param request contain request information
    * @param jsonNode JSON Parameter from request
    * @return JSON
    */
  @RequestMapping(value = Array("courses/{id}/tasks"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  def createTask(@PathVariable("id") courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, AnyVal] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (this.courseService.isPermittedForCourse(courseid, user.get)) {
      throw new BadRequestException("User with role `student` and no edit rights can not create a task.")
    }
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val filename = jsonNode.get("filename").asText()
      val file = jsonNode.get(LABEL_FILE).asText()
      val dataBytes: Array[Byte] = Base64.getDecoder.decode(file)
      val test_type = jsonNode.get("test_type").asText()
      val taskInfo = this.taskService.createTask(name, description, courseid, filename, test_type)
      val taskid: Int = taskInfo(LABEL_TASK_ID).asInstanceOf[Int]
      val jsonMsg: Map[String, String] = Map("testfile_url" -> this.taskService.getURLOfTaskTestFile(taskid),
        LABEL_TASK_ID -> taskid.toString)

      storageService.storeTaskTestFile(dataBytes, filename, taskid)

      val jsonStringMsg = JsonParser.mapToJsonStr(jsonMsg)
      logger.warn(jsonStringMsg)
      kafkaTemplate.send(topicTaskRequest, jsonStringMsg)
      kafkaTemplate.flush()
      taskInfo
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: name, description, filename, test_type and a file")
      }
    }
  }

  /**
    * provide a GET URL to download testfiles for a task
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param token URL is only working withing a time range
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{id}/files/testfile/{token}"))
  @ResponseBody def getTestFileByTask(@PathVariable(LABEL_ID) taskid: Int, @PathVariable token: String): ResponseEntity[Resource] = {
    if (!tokenService.tokenIsValid(token, taskid, "TASK_TEST_FILE")) {
        throw new UnauthorizedException
      }
    val filename = taskService.getTestFileByTask(taskid)
    val file = storageService.loadFile(filename, taskid)
    ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename + "\"").body(file)
  }

  /**
    * provide a GET URL to download submitted files for a submission
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param subid unique subid identification
    * @param token URL is only working withing a time range
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{id}/files/submissions/{subid}/{token}"))
  @ResponseBody def getSubmitFileByTask(@PathVariable(LABEL_ID) taskid: Int, @PathVariable subid: Int,
                                        @PathVariable token: String): ResponseEntity[Resource] = {
    if (!tokenService.tokenIsValid(token, subid, "SUBMISSION_TEST_FILE")) {
      throw new UnauthorizedException
    }
    var filename = taskService.getSubmittedFileBySubmission(subid)
    val file = storageService.loadFileBySubmission(filename, taskid, subid)
    ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename + "\"").body(file)
  }

  /**
    * Listen on "check_answer"
    * @param msg Answer from service
    */
  @KafkaListener(topics = Array("check_answer"))
  def listener(msg: String): Unit = {
    logger.debug("received message from topic 'check_answer': " + msg)
    val answeredMap = JsonParser.jsonStrToMap(msg)
    try {
      logger.warn(answeredMap.toString())
      this.taskService.setResultOfTask(
        Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String]), Integer.parseInt(answeredMap(LABEL_SUBMISSION_ID).asInstanceOf[String]),
        answeredMap(LABEL_DATA).asInstanceOf[String], answeredMap("exitcode").asInstanceOf[String])
    } catch {
      case _: NoSuchElementException => logger.warn("Checker Service did not provide all parameters")
    }
  }
}
