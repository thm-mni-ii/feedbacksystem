package de.thm.ii.fbs.controller

import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.nio.file.Paths

import scala.jdk.CollectionConverters._
import java.util.{Date, NoSuchElementException, Timer, TimerTask}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.TaskExtension
import de.thm.ii.fbs.services.{TestsystemService, _}
import de.thm.ii.fbs.util.{BadRequestException, JsonParser, ResourceNotFoundException, UnauthorizedException, Users}
import javax.servlet.http.HttpServletRequest
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.common.serialization.StringDeserializer
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.SmartInitializingSingleton
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.context.annotation.Bean
import org.springframework.core.io.{Resource, UrlResource}
import org.springframework.http.{HttpHeaders, HttpStatus, ResponseEntity}
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.{DefaultKafkaConsumerFactory, KafkaTemplate}
import org.springframework.kafka.listener.{ContainerProperties, KafkaMessageListenerContainer, MessageListener}
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile
import de.thm.ii.fbs.util.JsonWrapper._

/**
  * TaskController implement routes for submitting task and receiving results
  *
  * @author Benjamin Manns
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1"))
class TaskController {
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private implicit val userService: UserService = null
  @Autowired
  private val courseService: CourseService = null
  @Autowired
  private val taskExtensionService: TaskExtensionService = null
  @Autowired
  private val testsystemService: TestsystemService = null
  @Autowired
  private val notificationService: NotificationService = null
  @Autowired
  private val messageHandlers: TestsystemMessagesHandler = null

  @Value("${spring.kafka.bootstrap-servers}")
  private val kafkaURL: String = null
  private final val application_json_value = "application/json"

  private val LABEL_SUCCESS = "success"
  private var container: KafkaMessageListenerContainer[String, String] = _
  private var newTaskAnswerContainer: KafkaMessageListenerContainer[String, String] = _
  private var plagiatScriptAnswerContainer: KafkaMessageListenerContainer[String, String] = _
  private def consumerConfigScala: Map[String, Object] = Map("bootstrap.servers" -> kafkaURL, "group.id" -> "jcg-group")

  @Value("${server.host}")
  private val CLIENT_HOST_URL: String = null

  @Value("${compile.production}")
  private val compile_production: Boolean = true

  /** Path variable Label ID*/
  final val LABEL_ID = "id"
  /** JSON variable taskid ID*/
  final val LABEL_TASK_ID = "taskid"
  private val LABEL_BEST_FIT = "choice_best_result_fit"
  private val LABEL_PRE_RESULT = "calculate_pre_result"
  /** JSON variable userid ID*/
  final val LABEL_USER_ID = "userid"
  /** JSON variable submissionid ID*/
  final val LABEL_SUBMISSION_ID = "submissionid"
  /** JSON variable courseid*/
  final val LABEL_COURSE_ID = "courseid"
  /** JSON variable submissionid ID*/
  final val LABEL_DATA = "data"
  private val LABEL_TYPE = "datatype"
  private final val LABEL_FILE = "file"
  private final val LABEL_SEQ = "SEQ"
  private final val LABEL_NAME = "name"
  private final val LABEL_DESCRIPTION = "description"
  private final val LABEL_FILENAME = "filename"
  private final val LABEL_UPLOAD_URL = "upload_url"
  private final val LABEL_JWT_TOKEN = "jwt_token"
  private val LABEL_RELOAD = "reload"
  private val LABEL_SUBMIT_TYP = "submit_typ"
  private val LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER = "Checker Service did not provide all parameters"
  private val LABEL_DOWNLOAD_NOT_PERMITTED = "Download is not permitted. Please provide a valid jwt."
  private val LABEL_NEW_TASK_ASNWER = "new_task_answer"
  private val logger: Logger = LoggerFactory.getLogger(classOf[TaskController])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
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
    val user = Users.claimAuthorization(request)
    taskService.getTaskResults(taskid, user)
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
    val user = Users.claimAuthorization(request)
    if (!courseService.isSubscriberForCourse(courseid, user)) {
      throw new UnauthorizedException
    }
    var bigTaskList: List[Map[String, Any]] = List()
    for(line <- taskService.getTasksByCourse(courseid)) {
      var taskDetails: Map[String, Any] = taskService.getTaskDetails(line(TaskDBLabels.taskid).asInstanceOf[Int]).getOrElse(Map.empty)
      taskDetails += ("results" -> taskService.getTaskResults(line(TaskDBLabels.taskid).asInstanceOf[Int], user))

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
    val user = Users.claimAuthorization(request)
    if (!courseService.isPermittedForCourse(courseid, user)) {
      throw new UnauthorizedException
    }

    var message: Boolean = false
    var filename: String = ""
    try {
      storageService.storePlagiatScript(file, courseid)
      filename = file.getOriginalFilename

      val tasksystem_id = "plagiarismchecker"
      val kafkaMap = Map(
        LABEL_COURSE_ID -> courseid, LABEL_USER_ID -> user.username,
        "fileurl" -> this.taskService.getURLOfPlagiatScriptForCourse(courseid),
        LABEL_SUBMIT_TYP -> LABEL_FILE, LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(tasksystem_id)
      )
      val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
      val topic = taskService.connectKafkaTopic(tasksystem_id, "script_request")
      kafkaTemplate.send(topic, jsonResult)
      kafkaTemplate.flush()
      message = true

    } catch {
      case e: Exception => throw new RuntimeException(e.getMessage)
    }
    Map(LABEL_SUCCESS -> message, LABEL_FILENAME -> filename)
  }

  /**
    * trigger task info for a given task
    * @param taskid unique identification for a task
    * @param testsystem for which testsystem we need a info
    * @param jsonNode request body containing "data" parameter
    * @param request Request Header containing Headers
    * @return JSON
    */
  @ResponseStatus(HttpStatus.ACCEPTED)
  @RequestMapping(value = Array("tasks/{id}/info/{testsystem}/trigger"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  @ResponseBody
  def triggerTaskInfoFromTestsystem(@PathVariable(LABEL_ID) taskid: Integer, @PathVariable testsystem: String,
                                    @RequestBody jsonNode: JsonNode, request: HttpServletRequest): Map[String, Any] = {
    val user = Users.claimAuthorization(request)
    if (!taskService.hasSubscriptionForTask(taskid, user)) throw new UnauthorizedException
    taskService.setExternalAnswerOfTaskByTestsytem(taskid, null, user.username, testsystem)
    taskService.sendSubmissionToTestsystem(-1, taskid, testsystem, user, "info", "")
    Map(LABEL_SUCCESS -> true)
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
    val user = Users.claimAuthorization(request)
    if (!taskService.hasSubscriptionForTask(taskid, user)) throw new UnauthorizedException
    val taskDetailsOpt = taskService.getTaskDetails(taskid)
    if(taskDetailsOpt.isEmpty) throw new ResourceNotFoundException
    val taskDetails = taskDetailsOpt.get
    var upload_url: String = null

    if (taskDetails(TaskDBLabels.deadline) != null) {
      val taskDeadline = taskDetails(TaskDBLabels.deadline).asInstanceOf[Long]
      val dt = new Date(taskDeadline)
      val currTimestamp = new Date().getTime
      // Calculate overdue time
      val diff = dt.getTime - currTimestamp
      if (diff < 0) {
        throw new BadRequestException("Deadline for task " + taskid.toString + " is overdue since " + (diff/1000*(-1)).toString + " seconds.")
      }
    }

    val dataNode = jsonNode.get(LABEL_DATA)
      var submissionId: Int = -1
      if (dataNode != null) {
        val data = dataNode.asText
        submissionId = taskService.submitTaskWithData(taskid, user, data)
        taskService.setSubmissionFilename(submissionId, "string_submission.txt")
        // Save submission as file
        storageService.storeTaskSubmission(data, taskid, submissionId)

        // Check submission, if to late, return error, if no time set, it is unlimited
        // If submission was only data we send Kafka directly

        if (this.taskService.getMultiTestModeOfTask(taskid) == LABEL_SEQ) {
          taskService.sendSubmissionToTestsystem(submissionId, taskid, this.taskService.getTestsystemTopicsByTaskId(taskid).head,
            user, LABEL_DATA, data)
        } else {
          this.taskService.getTestsystemTopicsByTaskId(taskid).foreach(tasksystem_id => {
            taskService.sendSubmissionToTestsystem(submissionId, taskid, tasksystem_id,
              user, LABEL_DATA, data)
          })
        }
      } else {
        submissionId = submissionService.submitTaskWithFile(taskid, user)
        upload_url = CLIENT_HOST_URL + "/api/v1/" + "tasks/" + taskid.toString + "/submissions/" + submissionId.toString + "/file/upload"
      }

      Map(LABEL_SUCCESS -> true, LABEL_TASK_ID -> taskid, LABEL_SUBMISSION_ID -> submissionId, LABEL_UPLOAD_URL -> upload_url)
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
    val user = Users.claimAuthorization(request)
    if (!taskService.hasSubscriptionForTask(taskid, user)) {
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
    * @param testsystem_index: the index of the testsystem for which we need config files
    * @param files an array of multipart binary file in a form data format
    * @param request Request Header containing Headers
    * @return HTTP Response with Status Code
    */
  @RequestMapping(value = Array("tasks/{id}/testfile/{testsystem_index}/upload"), method = Array(RequestMethod.POST))
  def handleFileUpload(@PathVariable(LABEL_ID) taskid: Int, @PathVariable testsystem_index: Int, @RequestParam(LABEL_FILE) files: Array[MultipartFile],
                       request: HttpServletRequest): Map[String, Any] = {
    val user = Users.claimAuthorization(request)
    if (!taskService.isPermittedForTask(taskid, user)) {
      logger.warn(s"User ${user.username} tried to create a task without having permissions.")
      throw new UnauthorizedException
    }

    var filename: String = ""

    val testsystem_id = taskService.getTestsystemIDOfTaskByIndex(taskid, testsystem_index)
    for((file, j) <- files.zipWithIndex){
      // TODO check if all required files are uploaded
      filename += file.getOriginalFilename + (if (j < files.length-1) "," else "")
      storageService.storeTaskTestFile(file, taskid, testsystem_id)
    }
    taskService.setTaskFilename(taskid, testsystem_id, filename)
    taskService.resetTaskTestStatus(taskid, testsystem_id)
    try {
      //val tasksystem_id = taskService.getTestsystemTopicByTaskId(taskid)
      Map(LABEL_SUCCESS -> taskService.sendTaskToTestsystem(taskid, testsystem_id),
        LABEL_FILENAME -> filename)
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
    val user = Users.claimAuthorization(request)
    if (!this.courseService.isPermittedForCourse(courseid, user)) {
      throw new BadRequestException("User with role `student` and no edit rights can not create a task.")
    }
    try {
      val name = jsonNode.get(LABEL_NAME).asText()
      val description = jsonNode.get(LABEL_DESCRIPTION).asText()
      val deadline = jsonNode.retrive(TaskDBLabels.deadline).asLong().map(new Date(_)).orNull
      val load_external_description = jsonNode.get(TaskDBLabels.load_external_description).asBoolean()

      // Test if testsystem exists
      var testsystems: List[String] = List()

      jsonNode.get(TaskTestsystemDBLabels.testsystems).forEach(line => {
        testsystems = line.asText() :: testsystems
      })

      testsystems = testsystems.reverse

      if (testsystems.isEmpty) throw new BadRequestException("Please provide at least one testsystem")

      // Test if testsystem exists
      testsystems.foreach(testsystem_id => {
        if (testsystemService.getTestsystem(testsystem_id).isEmpty){
          throw new BadRequestException("Provided testsystem_id (" + testsystem_id + ") is invalid")
        }
      })

      var taskInfo: Map[String, Any] = this.taskService.createTask(name, description, courseid, deadline, testsystems, load_external_description)
      val taskid: Int = taskInfo(LABEL_TASK_ID).asInstanceOf[Int]
      taskInfo += (LABEL_UPLOAD_URL -> submissionService.getUploadUrlsForTaskTestFile(CLIENT_HOST_URL, taskid))
      taskInfo
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: name, description, load_external_description and testsystems. Deadline is optional")
      }
    }
  }

  /**
    * delete Task by its ID
    * @param taskid unique identification for a task
    * @param request contain request information
    * @return JSON
    */
  @RequestMapping(value = Array("/tasks/{id}"), method = Array(RequestMethod.DELETE))
  def deleteTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): Map[String, AnyVal] = {
    val user = Users.claimAuthorization(request)
    if (!this.taskService.isPermittedForTask(taskid, user)) {
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
    val user = Users.claimAuthorization(request)
    if (!this.taskService.isPermittedForTask(taskid, user)) {
      throw new UnauthorizedException("User has no edit rights and can not update a task.")
    }

    val name = if (jsonNode.get(LABEL_NAME) != null) jsonNode.get(LABEL_NAME).asText() else null
    val description = if (jsonNode.get(LABEL_DESCRIPTION) != null) jsonNode.get(LABEL_DESCRIPTION).asText() else null
    val deadline = jsonNode.retrive(TaskDBLabels.deadline).asLong().map(new Date(_)).orNull
    val load_external_description = if (jsonNode.get(TaskDBLabels.load_external_description) != null) {
      jsonNode.get(TaskDBLabels.load_external_description).asBoolean()
    } else {
      null
    }

    val testsystem_id = if (jsonNode.get(TestsystemLabels.id) != null) jsonNode.get(TestsystemLabels.id).asText() else null
    if (testsystem_id != null){
      throw new BadRequestException("Please do not update the testsystem_id here")
    }

    val success = this.taskService.updateTask(taskid, name, description, deadline, null, load_external_description)

    Map(LABEL_SUCCESS -> success, LABEL_UPLOAD_URL -> submissionService.getUploadUrlsForTaskTestFile(CLIENT_HOST_URL, taskid))
  }

  /**
    * completely set testsystems for a given task
    * @param taskid unique identification for a task
    * @param request contain request information
    * @param jsonNode JSON Parameter from request
    * @return JSON
    */
  @RequestMapping(value = Array("/tasks/{id}/testsystems"), method = Array(RequestMethod.PUT), consumes = Array(application_json_value))
  def setTestsystemsOfTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = Users.claimAuthorization(request)
    if (!this.taskService.isPermittedForTask(taskid, user)) {
      throw new UnauthorizedException("User has no edit rights and can not update a task.")
    }

    try {
      val testsystems = jsonNode.get("testsystems").asInstanceOf[List[Map[String, Any]]]
      val success = taskService.setTestsystemsForTask(testsystems, taskid)
      Map(LABEL_SUCCESS -> success, LABEL_UPLOAD_URL -> submissionService.getUploadUrlsForTaskTestFile(CLIENT_HOST_URL, taskid))
    } catch {
      case e: Exception => throw new BadRequestException("Provided testsystems is invalid " + e.getMessage)
    }
  }

  private def httpResponseHeaderValue(resource: Resource) = "attachment; filename=\"" + resource.getFilename + "\""

  /**
    * provide a GET URL to download testfiles for a task
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param testsystem_id testsystem id
    * @param filename requested filename which should be a stored file
    * @param request contain request information
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{id}/files/testfile/{testsystem_id}/{filename}"))
  @ResponseBody def getTestFileByTask(@PathVariable(LABEL_ID) taskid: Int, @PathVariable testsystem_id: String,
                                      @PathVariable filename: String, request: HttpServletRequest):
  ResponseEntity[Resource] = {
    val testystem = testsystemService.verfiyTestsystemByHeaderToken(request)
    if (testystem.isEmpty) {
      throw new UnauthorizedException(LABEL_DOWNLOAD_NOT_PERMITTED)
    }
    val parsedFilename = URLDecoder.decode(filename, StandardCharsets.UTF_8.toString)
    try {
      val file = storageService.loadFile(parsedFilename, taskid, testsystem_id)
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, httpResponseHeaderValue(file)).body(file)
    } catch {
      case _: RuntimeException => throw new ResourceNotFoundException
    }
  }

  /**
    * download extended task info (plagiat zip, ...)
    * @param taskid task ID
    * @param subject subject / topic where data is saved as
    * @param userid user id of user where data are saved, not requesting user.
    * @param request contain request information
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{taskid}/extended/{subject}/user/{userid}/file"))
  @ResponseBody def getSubmitFileByTask(@PathVariable taskid: Int, @PathVariable subject: String, @PathVariable userid: Int,
                                        request: HttpServletRequest): ResponseEntity[Resource] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }

    if (!this.taskService.isPermittedForTask(taskid, user.get)) {
      throw new UnauthorizedException("User can not get extended information, to less rights")
    }

    val taskExtensionList = taskExtensionService.getAllExensionsByTask(taskid, userid)
    val extInfos: List[TaskExtension] = taskExtensionList.filter((ext: TaskExtension) => ext.subject == subject)

    if (extInfos.isEmpty) {
      throw new BadRequestException("No data available under subject = " + subject)
    }

    val file = storageService.loadFileByPath(Paths.get(extInfos.head.data))
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
    if (user.isEmpty || user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    this.kafkaReloadService
    this.kafkaReloadNewTaskAnswerService
  }

  private def sendNextTestJob(submission_id: Int) = {
    val user = submissionService.getUserOfSubmission(submission_id).get
    val submissionDetails = submissionService.getSubmissionDetails(submission_id)
    if (submissionDetails.isDefined) {
      val submission = submissionDetails.get
      val taskid = submission(SubmissionDBLabels.taskid).asInstanceOf[Int]
      val nextTestsystem = submissionService.getNextTestsystemFromSubmission(submission_id)
      if (nextTestsystem.isDefined){
        val testsytem_id = nextTestsystem.get
        if (submission(SubmissionDBLabels.filename) == null) {
          taskService.sendSubmissionToTestsystem(submission_id, taskid, testsytem_id,
            user, LABEL_DATA, submission(SubmissionDBLabels.submission_data).asInstanceOf[String], true)
        } else {
          taskService.sendSubmissionToTestsystem(submission_id, taskid, testsytem_id,
            user, LABEL_FILE, null, true)
        }
      }
    }
  }

  private def kafkaReloadService: Map[String, AnyVal] = {
    val consumerConfigJava = consumerConfigScala.asJava
    val kafkaConsumerFactory: DefaultKafkaConsumerFactory[String, String] =
      new DefaultKafkaConsumerFactory[String, String](consumerConfigJava, new StringDeserializer, new StringDeserializer)
    // TODO fire this method after updates on Testsystem!
    val kafkaTopicCheckAnswer: List[String] = testsystemService.getTestsystemsTopicLabelsByTopic("check_answer")

    val containerProperties: ContainerProperties = new ContainerProperties(kafkaTopicCheckAnswer: _*)
    if (container != null) container.stop()
    container = new KafkaMessageListenerContainer(kafkaConsumerFactory, containerProperties)

    container.setupMessageListener(new MessageListener[Int, String]() {
      /**
        * onMessage process incoming kafka messages
        * @author Benjamin Manns
        * @param data kafka message
        */
      override def onMessage(data: ConsumerRecord[Int, String]): Unit = {
        kafkaReceivedDebug(data)
        val answeredMap = JsonParser.jsonStrToMap(data.value())
        try {
          val testsystem = data.topic.replace("_check_answer", "")
          val submissionID = Integer.parseInt(answeredMap(LABEL_SUBMISSION_ID).asInstanceOf[String])
          if (answeredMap.contains("isinfo") && answeredMap("isinfo").asInstanceOf[Boolean]){
            taskService.setExternalAnswerOfTaskByTestsytem(Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String]),
              answeredMap(LABEL_DATA).asInstanceOf[String], answeredMap("username").toString, testsystem)
          } else if (answeredMap.contains("resubmit") && answeredMap("resubmit").asInstanceOf[Boolean]){
            submissionService.setResultOfReSubmit(submissionID, testsystem, answeredMap(LABEL_DATA).toString, answeredMap(LABEL_TYPE).toString)
          } else {
            val passed = answeredMap("passed").asInstanceOf[String]
            val taskid: Int = Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String])
            val testsystem = data.topic.replace("_check_answer", "")
            taskService.setResultOfTask(submissionID, answeredMap(LABEL_DATA).toString, answeredMap(LABEL_TYPE).toString, passed,
              answeredMap("exitcode").toString.toInt, answeredMap(LABEL_BEST_FIT).toString,
              answeredMap(LABEL_PRE_RESULT).toString, testsystem)
            // We got an answer from a test, now on success case we need to trigger next phase if modus is SEQ
            if (passed == "1" && taskService.getMultiTestModeOfTask(taskid) == LABEL_SEQ) {
              sendNextTestJob(submissionID)
            }
          }
        } catch {
          case e: NoSuchElementException => logger.warn(LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER
            + "Error: " + e.getStackTrace.toString + "Data: " + data.toString)
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
    val kafkaTopicNewTaskAnswer: List[String] = testsystemService.getTestsystemsTopicLabelsByTopic(LABEL_NEW_TASK_ASNWER)
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
          val taskId = Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String])
          val accept = answeredMap("accept").asInstanceOf[Boolean]
          val error = answeredMap("error").asInstanceOf[String]
          val testsystem = data.topic.replace(s"_${LABEL_NEW_TASK_ASNWER}", "")
          taskService.setTaskTestFileAcceptedState(taskId, accept, error, testsystem)
        } catch {
          case e: NoSuchElementException => {
              logger.warn(e.getMessage)
              logger.warn(LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER)
            }
          }
        }
    })
    newTaskAnswerContainer.start
    Map(LABEL_RELOAD -> true)
  }

  /**
    * handles messages initiated from the testsystem itself, registered handlers will be called
    * @param cr kafka payload
    * @throws Exception if data missing
    */
  @KafkaListener(topics = Array("testsystem_message_data"))
  @throws[Exception]
  def listen(cr: ConsumerRecord[Int, String]): Unit = {
    val msgMap = JsonParser.jsonStrToMap(cr.value())
    val data = msgMap("data").toString
    val msgID = msgMap("msg_id").toString
    val method = messageHandlers.getClass.getMethod(msgMap("subject").toString + "Handler", "".getClass, "".getClass, "".getClass)
    method.invoke(messageHandlers, msgMap("testsystem_id").toString, data, msgID)

    // tidy up message folder if exists
    messageHandlers.tidyUpFile(msgID)
  }

  private def notifyDocentAfterPlagiarismCheck(courseid: Int, text: String) = {
    courseService.getCourseDocent(courseid).foreach( docent => {
      notificationService.insertNotificationForUser(Integer.parseInt(docent(UserDBLabels.user_id)), text)
    })
  }

  private def kafkaLoadPlagiatScriptAnswerService: Map[String, AnyVal] = {
    val consumerConfigJava = consumerConfigScala.asJava
    val kafkaConsumerFactory: DefaultKafkaConsumerFactory[String, String] =
      new DefaultKafkaConsumerFactory[String, String](consumerConfigJava, new StringDeserializer, new StringDeserializer)

    val kafkaTopicNewTaskAnswer: List[String] = List("plagiarismchecker_script_answer")
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
