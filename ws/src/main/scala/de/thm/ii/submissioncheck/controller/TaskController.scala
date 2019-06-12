package de.thm.ii.submissioncheck.controller

import java.net.{URLDecoder, URLEncoder}
import java.nio.charset.StandardCharsets
import java.nio.file.Paths

import org.joda.time.format.DateTimeFormat

import scala.collection.JavaConverters._
import java.util.{Base64, Date, NoSuchElementException, Timer, TimerTask}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, _}
import de.thm.ii.submissioncheck.services.{TestsystemService, _}
import javax.servlet.http.HttpServletRequest
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.common.serialization.StringDeserializer
import org.joda.time.DateTime
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.SmartInitializingSingleton
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.context.annotation.Bean
import org.springframework.core.io.{Resource, UrlResource}
import org.springframework.http.{HttpHeaders, HttpStatus, ResponseEntity}
import org.springframework.kafka.core.{DefaultKafkaConsumerFactory, KafkaTemplate}
import org.springframework.kafka.listener.{KafkaMessageListenerContainer, MessageListener}
import org.springframework.kafka.listener.config.ContainerProperties
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
  private val courseService: CourseService = null
  @Autowired
  private val courseParameterService: CourseParamService = null
  @Autowired
  private val testsystemService: TestsystemService = null

  @Value("${spring.kafka.bootstrap-servers}")
  private val kafkaURL: String = null
  private final val application_json_value = "application/json"

  private val topicTaskRequest: String = "new_task_request"
  private val LABEL_SUCCESS = "success"
  private var container: KafkaMessageListenerContainer[String, String] = _
  private var newTaskAnswerContainer: KafkaMessageListenerContainer[String, String] = _
  private var plagiatTaskCheckerContainer: KafkaMessageListenerContainer[String, String] = _
  private var plagiatScriptAnswerContainer: KafkaMessageListenerContainer[String, String] = _
  private def consumerConfigScala: Map[String, Object] = Map("bootstrap.servers" -> kafkaURL, "group.id" -> "jcg-group")

  @Value("${cas.client-host-url}")
  private val CLIENT_HOST_URL: String = null

  @Value("${compile.production}")
  private val compile_production: Boolean = true

  private val plagiatchecker_thread_interval = 60000
  /** Path variable Label ID*/
  final val LABEL_ID = "id"
  /** JSON variable taskid ID*/
  final val LABEL_TASK_ID = "taskid"
  /** JSON variable userid ID*/
  final val LABEL_USER_ID = "userid"
  /** JSON variable submissionid ID*/
  final val LABEL_SUBMISSION_ID = "submissionid"
  /** JSON variable courseid*/
  final val LABEL_COURSE_ID = "courseid"
  /** JSON variable submissionid ID*/
  final val LABEL_DATA = "data"
  private final val LABEL_FILE = "file"
  private final val LABEL_NAME = "name"
  private final val LABEL_DESCRIPTION = "description"
  private final val LABEL_FILENAME = "filename"
  private final val LABEL_UPLOAD_URL = "upload_url"
  private final val LABEL_JWT_TOKEN = "jwt_token"
  private val LABEL_RELOAD = "reload"
  private val LABEL_SUBMIT_TYP = "submit_typ"
  private val LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER = "Checker Service did not provide all parameters"
  private val LABEL_DOWNLOAD_NOT_PERMITTED = "Download is not permitted. Please provide a valid jwt."

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val topicName: String = "check_request"

  private var storageService: StorageService = null

  /**
    * Using autowired configuration, they will be loaded after self initialization
    */
  def configurateStorageService(): Unit = {
    this.storageService = new StorageService(compile_production)
  }

  /**
    * After autowiring start Kafka Listener
    * @return kafka Listener Method
    */
  @Bean
  def importProcessor: SmartInitializingSingleton = () => {
    /** wait 30 seconds before the kafka listeners are loaded to be sure everything is connected like it should*/
    val bean_delay = 3000
    new Timer().schedule(new TimerTask() {
      override def run(): Unit = {
        kafkaReloadService
        kafkaReloadNewTaskAnswerService
        configurateStorageService
        kafkaLoadPlagiatCheckerService
        sendTaskToPlagiatChecker
        kafkaLoadPlagiatScriptAnswerService
      }
    }, bean_delay)
  }

  /**
    * Print all results, if any,from a given task
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{id}/result"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTaskResultByTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): List[Map[String, Any]] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty) {
      throw new UnauthorizedException
    }
    taskService.getTaskResults(taskid, requestingUser.get)
  }

  /**
    * Print all results, if any,from a given task
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("courses/{courseid}/tasks/result"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTaskResultAllTaskByCourse(@PathVariable courseid: Int, request: HttpServletRequest): List[Map[String, Any]] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !courseService.isSubscriberForCourse(courseid, requestingUser.get)) {
      throw new UnauthorizedException
    }
    var bigTaskList: List[Map[String, Any]] = List()
    var line = Map()
    for(line <- taskService.getTasksByCourse(courseid))
    {
      var taskDetails: Map[String, Any] = taskService.getTaskDetails(line(TaskDBLabels.taskid).asInstanceOf[Int]).getOrElse(Map.empty)
      taskDetails += ("results" -> taskService.getTaskResults(line(TaskDBLabels.taskid).asInstanceOf[Int], requestingUser.get))

      bigTaskList = taskDetails :: bigTaskList
    }
    bigTaskList
  }

  /**
    * upload url for plagiat checker script
    * @param courseid unique course id
    * @param file multipart binary file in a form data format
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("courses/{courseid}/plagiatchecker/upload"), method = Array(RequestMethod.POST))
  def handlePlagiatScriptFileUpload(@PathVariable courseid: Int,
                                 @RequestParam(LABEL_FILE) file: MultipartFile, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)

    if (requestingUser.isEmpty || !courseService.isPermittedForCourse(courseid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    var message: Boolean = false
    var filename: String = ""
    try {
      storageService.storePlagiatScript(file, courseid)
      filename = file.getOriginalFilename

      val tasksystem_id = "plagiarismchecker"
      var kafkaMap = Map(LABEL_COURSE_ID -> courseid, LABEL_USER_ID -> requestingUser.get.username)
      kafkaMap += ("fileurl" -> this.taskService.getURLOfPlagiatScriptForCourse(courseid))
      kafkaMap += (LABEL_SUBMIT_TYP -> LABEL_FILE, LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(tasksystem_id))
      val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
      logger.info(jsonResult)
      val topic = taskService.connectKafkaTopic(tasksystem_id, "script_request")
      kafkaTemplate.send(topic, jsonResult)
      logger.info(topic)
      kafkaTemplate.flush()
      message = true

    } catch {
      case e: Exception => {}
    }
    Map(LABEL_SUCCESS -> message, LABEL_FILENAME -> filename)
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
  def submitTask(@PathVariable(LABEL_ID) taskid: Integer, @RequestBody jsonNode: JsonNode, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.hasSubscriptionForTask(taskid, requestingUser.get)) throw new UnauthorizedException
    val taskDetailsOpt = taskService.getTaskDetails(taskid)
    if(taskDetailsOpt.isEmpty) throw new ResourceNotFoundException
    val taskDetails = taskDetailsOpt.get
    var upload_url: String = null
    var kafkaMap: Map[String, Any] = Map(LABEL_TASK_ID -> taskid.toString, LABEL_USER_ID -> requestingUser.get.username)
    val dataNode = jsonNode.get(LABEL_DATA)
      var submissionId: Int = -1
      if(dataNode != null) {
        val tasksystem_id = this.taskService.getTestsystemTopicByTaskId(taskid)
        // Check submission, if to late, return error, if no time set, it is unlimited
        if(taskDetails(TaskDBLabels.deadline) != null){
          val taskDeadline = taskDetails(TaskDBLabels.deadline).toString
          val formatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss.S")
          val dt: DateTime = formatter.parseDateTime(taskDeadline)
          val currTimestamp = new Date().getTime
          // Calculate overdue time
          val diff = (dt.getMillis) - currTimestamp
          if (diff < 0){
            throw new BadRequestException("Deadline for task " + taskid.toString + " is overdue since " + (diff/1000*(-1)).toString + " seconds.")
          }
        }
        // If submission was only data we send Kafka directly
        val data = dataNode.asText
        submissionId = taskService.submitTaskWithData(taskid, requestingUser.get, data)
        kafkaMap += (LABEL_DATA -> data)
        kafkaMap += (LABEL_SUBMISSION_ID -> submissionId.toString)
        kafkaMap += (LABEL_SUBMIT_TYP -> "data", LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(tasksystem_id))
        kafkaMap += ("course_parameter" -> courseParameterService.getAllCourseParamsForUser(
          taskDetailsOpt.get(TaskDBLabels.courseid).asInstanceOf[Int], requestingUser.get))
        val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
        logger.warn(taskService.connectKafkaTopic(tasksystem_id, topicName))
        logger.warn(jsonResult)
        kafkaTemplate.send(taskService.connectKafkaTopic(tasksystem_id, topicName), jsonResult)
        kafkaTemplate.flush()
        taskService.setSubmissionFilename(submissionId, "string_submission.txt")
        // Save submission as file
        storageService.storeTaskSubmission(data, taskid, submissionId)
      }
      else {
        submissionId = taskService.submitTaskWithFile(taskid, requestingUser.get)
        upload_url = CLIENT_HOST_URL + "/api/v1/" + "tasks/" + taskid.toString + "/submissions/" + submissionId.toString + "/file/upload"
      }

      Map(LABEL_SUCCESS -> true, LABEL_TASK_ID -> taskid, LABEL_SUBMISSION_ID -> submissionId, LABEL_UPLOAD_URL -> upload_url)
    }

  /**
    * serve a route to upload a submission file to a given submissionid
    * @author grokonez.com, Benjamin Manns
    * @param taskid unique identification for a task
    * @param submissionid unique identification for a submission
    * @param file multipart binary file in a form data format
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{taskid}/submissions/{submissionid}/file/upload"), method = Array(RequestMethod.POST))
  def handleSubmissionFileUpload(@PathVariable taskid: Int, @PathVariable submissionid: Int,
                                 @RequestParam(LABEL_FILE) file: MultipartFile, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.hasSubscriptionForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    var message: Boolean = false
    var filename: String = ""
    try {
      storageService.storeTaskSubmission(file, taskid, submissionid)

      filename = file.getOriginalFilename
      taskService.setSubmissionFilename(submissionid, filename)
      val tasksystem_id = this.taskService.getTestsystemTopicByTaskId(taskid)
      var kafkaMap = Map(LABEL_TASK_ID -> taskid.toString, LABEL_USER_ID -> requestingUser.get.username)
      kafkaMap += ("fileurl" -> this.taskService.getURLOfSubmittedTestFile(taskid, submissionid))
      kafkaMap += (LABEL_SUBMISSION_ID -> submissionid.toString)
      kafkaMap += (LABEL_SUBMIT_TYP -> "file", LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(tasksystem_id))
      val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
      logger.warn(jsonResult)
      kafkaTemplate.send(taskService.connectKafkaTopic(tasksystem_id, topicName), jsonResult)
      kafkaTemplate.flush()
      message = true

     } catch {
       case e: Exception => {}
     }
    Map(LABEL_SUCCESS -> message, LABEL_FILENAME -> filename)
  }

  /**
    * implement REST route to get students task submission
    *
    * @author Benjamin Manns
    * @param taskid unique task identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{id}/submissions"), method = Array(RequestMethod.GET), consumes = Array(application_json_value))
  @ResponseBody
  def seeAllSubmissions(@PathVariable(LABEL_ID) taskid: Integer,
                        request: HttpServletRequest): List[Map[String, String]] = {
    val user = userService.verifyUserByHeaderToken(request)
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
  def getTaskDetails(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.hasSubscriptionForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }
    taskService.getTaskDetails(taskid, Some(requestingUser.get.userid)).getOrElse(Map.empty)
  }

  /**
    * Print infos for a given Task
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{id}/info"), method = Array(RequestMethod.GET))
  def getTaskInfos(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.hasSubscriptionForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }
    taskService.getTaskDetails(taskid, None).getOrElse(Map.empty)
  }

  // Useful hint for Angular cooperation:
  // https://stackoverflow.com/questions/47886695/current-request-is-not-a-multipart-requestangular-4spring-boot
  /**
    * serve a route to upload a file to a given taskid
    * @author grokonez.com
    *
    * @param taskid unique identification for a task
    * @param files an array of multipart binary file in a form data format
    * @param request Request Header containing Headers
    * @return HTTP Response with Status Code
    */
  @RequestMapping(value = Array("tasks/{id}/testfile/upload"), method = Array(RequestMethod.POST))
  def handleFileUpload(@PathVariable(LABEL_ID) taskid: Int, @RequestParam(LABEL_FILE) files: Array[MultipartFile],
                       request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.isPermittedForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    var message: Boolean = false
    var filename: String = ""
    for((file, j) <- files.zipWithIndex){
      // TODO check if all required files are uploaded
      filename += file.getOriginalFilename + (if (j < files.length-1) "," else "")
      storageService.storeTaskTestFile(file, taskid)
    }
    taskService.setTaskFilename(taskid, filename)
    taskService.resetTaskTestStatus(taskid)
    try {
      val tasksystem_id = taskService.getTestsystemTopicByTaskId(taskid)
      val jsonMsg: Map[String, Any] = Map("testfile_urls" -> this.taskService.getURLsOfTaskTestFiles(taskid),
        LABEL_TASK_ID -> taskid.toString,
        LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(tasksystem_id))

      message = true

      val jsonStringMsg = JsonParser.mapToJsonStr(jsonMsg)
      logger.warn(jsonStringMsg)
      kafkaTemplate.send(taskService.connectKafkaTopic(tasksystem_id, topicTaskRequest), jsonStringMsg)
      logger.warn(taskService.connectKafkaTopic(tasksystem_id, topicTaskRequest))
      kafkaTemplate.flush()

      Map(LABEL_SUCCESS -> message, LABEL_FILENAME -> filename)

    } catch {
      case _: NoSuchElementException => throw new ResourceNotFoundException()
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
  @ResponseStatus(HttpStatus.CREATED)
  def createTask(@PathVariable(LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.courseService.isPermittedForCourse(courseid, user.get)) {
      throw new BadRequestException("User with role `student` and no edit rights can not create a task.")
    }
    try {
      val name = jsonNode.get(LABEL_NAME).asText()
      val description = jsonNode.get(LABEL_DESCRIPTION).asText()
      val deadline = if (jsonNode.get(TaskDBLabels.deadline) != null) jsonNode.get(TaskDBLabels.deadline).asText() else null
      val testsystem_id = jsonNode.get(TestsystemLabels.id).asText()
      // Test if testsystem exists
      if (testsystemService.getTestsystem(testsystem_id).isEmpty){
        throw new BadRequestException("Provided testsystem_id (" + testsystem_id + ") is invalid")
      }
      var taskInfo: Map[String, Any] = this.taskService.createTask(name, description, courseid, deadline, testsystem_id)
      val taskid: Int = taskInfo(LABEL_TASK_ID).asInstanceOf[Int]

      taskInfo += (LABEL_UPLOAD_URL -> getUploadUrlForTaskTestFile(taskid))
      taskInfo
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: name, description and testsystem_id. Deadline is optional")
      }
    }
  }

  private def getUploadUrlForTaskTestFile(taskid: Int): String = {
    CLIENT_HOST_URL + "/api/v1/tasks/" + taskid.toString +  "/testfile/upload"
  }

  /**
    * delete Task by its ID
    * @param taskid unique identification for a task
    * @param request contain request information
    * @return JSON
    */
  @RequestMapping(value = Array("/tasks/{id}"), method = Array(RequestMethod.DELETE))
  def deleteTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): Map[String, AnyVal] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.taskService.isPermittedForTask(taskid, user.get)) {
      throw new UnauthorizedException("User can not delete a task.")
    }
    this.taskService.deleteTask(taskid)
  }

  /**
    * Update a task for a given course
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @param request contain request information
    * @param jsonNode JSON Parameter from request
    * @return JSON
    */
  @RequestMapping(value = Array("/tasks/{id}"), method = Array(RequestMethod.PUT), consumes = Array(application_json_value))
  def updateTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.taskService.isPermittedForTask(taskid, user.get)) {
      throw new UnauthorizedException("User has no edit rights and can not update a task.")
    }

    val name = if (jsonNode.get(LABEL_NAME) != null) jsonNode.get(LABEL_NAME).asText() else null
    val description = if (jsonNode.get(LABEL_DESCRIPTION) != null) jsonNode.get(LABEL_DESCRIPTION).asText() else null
    val deadline = if (jsonNode.get(TaskDBLabels.deadline) != null) jsonNode.get(TaskDBLabels.deadline).asText() else null
    val testsystem_id = if (jsonNode.get(TestsystemLabels.id) != null) jsonNode.get(TestsystemLabels.id).asText() else null
    if (testsystem_id != null && testsystemService.getTestsystem(testsystem_id).isEmpty){
      throw new BadRequestException("Provided testsystem_id (" + testsystem_id + ") is invalid")
    }

    val success = this.taskService.updateTask(taskid, name, description, deadline, testsystem_id)

    Map(LABEL_SUCCESS -> success, LABEL_UPLOAD_URL -> getUploadUrlForTaskTestFile(taskid))
  }

  /**
    * Get a zipfile of all submission user made for a task
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @param request contain request information
    * @return File Ressource to download
    */
  @RequestMapping(value = Array("tasks/{taskid}/submission/users/zip"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getZipOfSubmissionsOfUsersOfOneTask(@PathVariable taskid: Integer,
                                          request: HttpServletRequest): ResponseEntity[UrlResource] = {
    val user = userService.verifyUserByHeaderToken(request)

    if ((user.isEmpty || !taskService.isPermittedForTask(taskid, user.get)) && testsystemService.verfiyTestsystemByHeaderToken(request).isEmpty) {
      throw new UnauthorizedException
    }

    val resource = new UrlResource(Paths.get(taskService.zipOfSubmissionsOfUsersFromTask(taskid)).toUri)

    if (resource.exists || resource.isReadable) {
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, httpResponseHeaderValue(resource)).body(resource)
    } else {
      throw new RuntimeException("Zip file could not be found.")
    }
  }

  private def httpResponseHeaderValue(resource: Resource) = "attachment; filename=\"" + resource.getFilename + "\""

  // TODO please not as route but as threat
  /**
    * Deprecated Route, to use as threat
    * @param taskid feedback course
    * @param request Request Header containing Headers
    * @return JSON
    */
  @deprecated("0", "0")
  @RequestMapping(value = Array("tasks/{taskid}/plagiarismchecker"), method = Array(RequestMethod.GET))
  def updateTask(@PathVariable taskid: Integer, request: HttpServletRequest): Map[String, Any] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.taskService.isPermittedForTask(taskid, user.get)) {
      throw new UnauthorizedException("User has no edit rights and can not update a task.")
    }

    /*val submissionMatrix = taskService.getSubmissionsByTask(taskid)
    val tasksystem_id = "plagiarismchecker"
    val kafkaMap: Map[String, Any] = Map("task_id" -> taskid, "download_zip_url" ->
      (this.taskService.getUploadBaseURL() + "/api/v1/tasks/" + taskid.toString + "/submission/users/zip"),
      "jwt_token" ->  testsystemService.generateTokenFromTestsystem(tasksystem_id),
      "submissionmatrix" -> submissionMatrix)
    val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
    val kafka_topic = tasksystem_id + "_check_request"
    logger.warn(kafka_topic)
    logger.warn(jsonResult)
    kafkaTemplate.send(kafka_topic, jsonResult)
    kafkaTemplate.flush()*/

    Map(LABEL_SUCCESS -> true)
  }

  /**
    * for every non checked but expired task, send this task to the plagiat check system
    */
  def sendTaskToPlagiatChecker(): Unit = {
    val tasks = taskService.getExpiredTasks()
    if (tasks.nonEmpty) {
      for (task <- tasks) {
        val taskid: Int = task(TaskDBLabels.taskid).asInstanceOf[Int]
        val submissionMatrix = taskService.getSubmissionsByTask(taskid)
        val tasksystem_id = "plagiarismchecker"
        val kafkaMap: Map[String, Any] = Map("task_id" -> taskid, "download_zip_url" ->
          (this.taskService.getUploadBaseURL() + "/api/v1/tasks/" + taskid.toString + "/submission/users/zip"),
          "jwt_token" ->  testsystemService.generateTokenFromTestsystem(tasksystem_id),
          "submissionmatrix" -> submissionMatrix)
        val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
        val kafka_topic = tasksystem_id + "_check_request"
        logger.warn(kafka_topic)
        logger.warn(jsonResult)
        kafkaTemplate.send(kafka_topic, jsonResult)
        kafkaTemplate.flush()
      }
    }
  }

  /**
    * plagiat checker background process will be started here
    */
  val plagiatCheckerThread = new Thread {
    override def run {
      logger.debug("Hello, Thread is started and looks for some task to check")
      for(i <- Stream.from(1)) {
        sendTaskToPlagiatChecker()
        Thread.sleep(plagiatchecker_thread_interval)
      }
    }
  }

  plagiatCheckerThread.start

  /**
    * provide a GET URL to download testfiles for a task
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param filename requested filename which should be a stored file
    * @param request contain request information
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{id}/files/testfile/{filename}"))
  @ResponseBody def getTestFileByTask(@PathVariable(LABEL_ID) taskid: Int, @PathVariable filename: String, request: HttpServletRequest):
  ResponseEntity[Resource] = {
    val testystem = testsystemService.verfiyTestsystemByHeaderToken(request)
    if (testystem.isEmpty) {
      throw new UnauthorizedException(LABEL_DOWNLOAD_NOT_PERMITTED)
    }
    val parsedFilename = URLDecoder.decode(filename, StandardCharsets.UTF_8.toString)
    try {
      val file = storageService.loadFile(parsedFilename, taskid)
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, httpResponseHeaderValue(file)).body(file)
    } catch {
      case _: RuntimeException => throw new ResourceNotFoundException
    }
  }

  /**
    * provide a GET URL to download submitted files for a submission
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param subid unique subid identification
    * @param request contain request information
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{id}/files/submissions/{subid}"))
  @ResponseBody def getSubmitFileByTask(@PathVariable(LABEL_ID) taskid: Int, @PathVariable subid: Int,
                                       request: HttpServletRequest): ResponseEntity[Resource] = {
    val testystem = testsystemService.verfiyTestsystemByHeaderToken(request)
    if (testystem.isEmpty) {
      throw new UnauthorizedException(LABEL_DOWNLOAD_NOT_PERMITTED)
    }
    val filename = taskService.getSubmittedFileBySubmission(subid)
    val file = storageService.loadFileBySubmission(filename, taskid, subid)
    ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, httpResponseHeaderValue(file)).body(file)
  }

  /**
    * JWT protected download url for plagiarism checker scripts
    * @param courseid unique course identification
    * @param request contain request information
    * @return HTTP Response contain file
    */
  @GetMapping(Array("course/{courseid}/files/plagiatscript"))
  @ResponseBody def getSubmitFileByTask(@PathVariable courseid: Int,
                                        request: HttpServletRequest): ResponseEntity[Resource] = {
    val testystem = testsystemService.verfiyTestsystemByHeaderToken(request)
    if (testystem.isEmpty) {
      throw new UnauthorizedException(LABEL_DOWNLOAD_NOT_PERMITTED)
    }
    val file = storageService.loadPlagiatScript(courseid)
    ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, httpResponseHeaderValue(file)).body(file)
  }

  /**
    * reload kafka listeners that database changes can are respeceted
    * @author Benjamin Manns
    * based on https://stackoverflow.com/questions/41533391/how-to-create-separate-kafka-listener-for-each-topic-dynamically-in-springboot
    * @param request contain request information
    * @return JSON
    */
  @RequestMapping(value = Array("kafka/listener/reload"), method = Array(RequestMethod.GET))
  def kafkaReloadListeners(request: HttpServletRequest): Map[String, AnyVal] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 2) { // TODO Admin or else?
      throw new UnauthorizedException
    }
    this.kafkaReloadService
    this.kafkaReloadNewTaskAnswerService
    this.kafkaLoadPlagiatCheckerService
  }

  private def kafkaReloadService: Map[String, AnyVal] = {
    val consumerConfigJava = consumerConfigScala.asJava
    val kafkaConsumerFactory: DefaultKafkaConsumerFactory[String, String] =
      new DefaultKafkaConsumerFactory[String, String](consumerConfigJava, new StringDeserializer, new StringDeserializer)

    // TODO fire this method after updates on Testsystem!
    val kafkaTopicCheckAnswer: List[String] = testsystemService.getTestsystemsTopicLabelsByTopic("check_answer")

    kafkaTopicCheckAnswer.foreach(s => logger.warn(s))
    val containerProperties: ContainerProperties = new ContainerProperties(kafkaTopicCheckAnswer: _*)
    if (container != null) {
      container.stop()
    }
    container = new KafkaMessageListenerContainer(kafkaConsumerFactory, containerProperties)

    container.setupMessageListener(new MessageListener[Int, String]() {
      /**
        * onMessage process incoming kafka messages
        * @author Benjamin Manns
        * @param data kafka message
        */
      override def onMessage(data: ConsumerRecord[Int, String]): Unit = {
        kafkaReceivedDebug(data)
        // TODO switch data.topic and save for each then!!

        val answeredMap = JsonParser.jsonStrToMap(data.value())
        try {
          logger.warn(answeredMap.toString())
          taskService.setResultOfTask(Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String]),
            Integer.parseInt(answeredMap(LABEL_SUBMISSION_ID).asInstanceOf[String]),
            answeredMap(LABEL_DATA).asInstanceOf[String], answeredMap("passed").asInstanceOf[String],
            Integer.parseInt(answeredMap("exitcode").asInstanceOf[String]))
        } catch {
          case _: NoSuchElementException => logger.warn(LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER)
        }
      }
    })
    container.start
    Map(LABEL_RELOAD -> true)
  }

  private def kafkaReloadNewTaskAnswerService: Map[String, AnyVal] = {
    val consumerConfigJava = consumerConfigScala.asJava
    val kafkaConsumerFactory: DefaultKafkaConsumerFactory[String, String] =
      new DefaultKafkaConsumerFactory[String, String](consumerConfigJava, new StringDeserializer, new StringDeserializer)

    // TODO fire this method after updates on Testsystem!
    val kafkaTopicNewTaskAnswer: List[String] = testsystemService.getTestsystemsTopicLabelsByTopic("new_task_answer")

    kafkaTopicNewTaskAnswer.foreach(s => logger.warn(s))
    val containerProperties: ContainerProperties = new ContainerProperties(kafkaTopicNewTaskAnswer: _*)
    if (newTaskAnswerContainer != null) {
      newTaskAnswerContainer.stop()
    }
    newTaskAnswerContainer = new KafkaMessageListenerContainer(kafkaConsumerFactory, containerProperties)

    newTaskAnswerContainer.setupMessageListener(new MessageListener[Int, String]() {
      /**
        * onMessage process incoming kafka messages
        * @author Benjamin Manns
        * @param data kafka message
        */
      override def onMessage(data: ConsumerRecord[Int, String]): Unit = {
        kafkaReceivedDebug(data)
        // TODO switch data.topic and save for each then!!

        val answeredMap = JsonParser.jsonStrToMap(data.value())
        try {
          logger.warn(answeredMap.toString())
          val taskId = Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String])
          val accept = answeredMap("accept").asInstanceOf[Boolean]
          val error = answeredMap("error").asInstanceOf[String]
          taskService.setTaskTestFileAcceptedState(taskId, accept, error)
        } catch {
          case _: NoSuchElementException => logger.warn(LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER)
        }
      }
    })
    newTaskAnswerContainer.start
    Map(LABEL_RELOAD -> true)
  }

  private def kafkaLoadPlagiatCheckerService: Map[String, AnyVal] = {
    val consumerConfigJava = consumerConfigScala.asJava
    val kafkaConsumerFactory: DefaultKafkaConsumerFactory[String, String] =
      new DefaultKafkaConsumerFactory[String, String](consumerConfigJava, new StringDeserializer, new StringDeserializer)

    // TODO fire this method after updates on Testsystem!
    val kafkaTopicNewTaskAnswer: List[String] = List("plagiarismchecker_answer")

    kafkaTopicNewTaskAnswer.foreach(s => logger.warn(s))
    val containerProperties: ContainerProperties = new ContainerProperties(kafkaTopicNewTaskAnswer: _*)
    if (plagiatTaskCheckerContainer != null) {
      plagiatTaskCheckerContainer.stop()
    }
    plagiatTaskCheckerContainer = new KafkaMessageListenerContainer(kafkaConsumerFactory, containerProperties)

    plagiatTaskCheckerContainer.setupMessageListener(new MessageListener[Int, String]() {
      /**
        * onMessage process incoming kafka messages
        * @author Benjamin Manns
        * @param data kafka message
        */
      override def onMessage(data: ConsumerRecord[Int, String]): Unit = {
        kafkaReceivedDebug(data)
        val answeredMap = JsonParser.jsonStrToMap(data.value())
        try {
          logger.warn(answeredMap.toString())
          val workedOut = answeredMap(LABEL_SUCCESS).asInstanceOf[Boolean]
          val taskId = Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String])

          val submissionlist = answeredMap("submissionlist").asInstanceOf[List[Map[String, Boolean]]]
          for (submission <- submissionlist) {
            taskService.setPlagiatPassedForSubmission(submission.keys.head, submission.values.head)
          }

          // If every data is saved correctly
          taskService.updateTask(taskId, null, null, null, null, true)

        } catch {
          case _: NoSuchElementException => logger.warn(LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER)
        }
      }
    })
    plagiatTaskCheckerContainer.start
    Map(LABEL_RELOAD -> true)
  }

  private def kafkaLoadPlagiatScriptAnswerService: Map[String, AnyVal] = {
    val consumerConfigJava = consumerConfigScala.asJava
    val kafkaConsumerFactory: DefaultKafkaConsumerFactory[String, String] =
      new DefaultKafkaConsumerFactory[String, String](consumerConfigJava, new StringDeserializer, new StringDeserializer)

    val kafkaTopicNewTaskAnswer: List[String] = List("plagiarismchecker_script_answer")

    kafkaTopicNewTaskAnswer.foreach(s => logger.warn(s))
    val containerProperties: ContainerProperties = new ContainerProperties(kafkaTopicNewTaskAnswer: _*)
    if (plagiatScriptAnswerContainer != null) {
      plagiatScriptAnswerContainer.stop()
    }
    plagiatScriptAnswerContainer = new KafkaMessageListenerContainer(kafkaConsumerFactory, containerProperties)

    plagiatScriptAnswerContainer.setupMessageListener(new MessageListener[Int, String]() {
      /**
        * onMessage process incoming kafka messages
        * @author Benjamin Manns
        * @param data kafka message
        */
      override def onMessage(data: ConsumerRecord[Int, String]): Unit = {
        kafkaReceivedDebug(data)
        val answeredMap = JsonParser.jsonStrToMap(data.value())
        try {
          logger.warn(answeredMap.toString())
          val workedOut = answeredMap(LABEL_SUCCESS).asInstanceOf[Boolean]
          val courseid = answeredMap(LABEL_COURSE_ID).asInstanceOf[BigInt]

          courseService.setPlagiarismScriptStatus(courseid.toInt, workedOut)
        } catch {
          case _: NoSuchElementException => logger.warn(LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER)
        }
      }
    })
    plagiatScriptAnswerContainer.start
    Map(LABEL_RELOAD -> true)
  }

  private def kafkaReceivedDebug(data: ConsumerRecord[Int, String]): Unit = logger.debug("received message from topic '" + data.topic + "': " + data.value())
}
