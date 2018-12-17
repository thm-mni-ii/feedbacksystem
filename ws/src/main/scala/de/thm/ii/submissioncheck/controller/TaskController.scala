package de.thm.ii.submissioncheck.controller

import scala.collection.JavaConverters._
import java.util.{Base64, NoSuchElementException}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, JsonParser, ResourceNotFoundException, UnauthorizedException}
import de.thm.ii.submissioncheck.services.{TestsystemService, _}
import javax.servlet.http.HttpServletRequest
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.common.serialization.StringDeserializer
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.SmartInitializingSingleton
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.core.io.Resource
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
  private val tokenService: TokenService = null
  @Autowired
  private val courseService: CourseService = null
  @Autowired
  private val testsystemService: TestsystemService = null

  private final val application_json_value = "application/json"

  private val topicTaskRequest: String = "new_task_request"

  private final val testsystemLabel1 = "secrettokenchecker"

  private var container: KafkaMessageListenerContainer[String, String] = null

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
  private final val LABEL_FILENAME = "filename"
  private final val LABEL_UPLOAD_URL = "upload_url"
  private final val LABEL_JWT_TOKEN = "jwt_token"

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val topicName: String = "check_request"

  private val storageService: StorageService = new StorageService

  /**
    * After autowiring start Kafka Listener
    * @return kafka Listener Method
    */
  @Bean
  def importProcessor: SmartInitializingSingleton = {
    () => {
      kafkaReloadService
    }
  }

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
    * Print all results, if any,from a given task
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("courses/{courseid}/tasks/result"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTaskResultAllTaskByCourse(@PathVariable courseid: Int, request: HttpServletRequest): List[Map[String, Any]] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !courseService.isSubscriberForCourse(courseid, requestingUser.get)) {
      throw new UnauthorizedException
    }
    var bigTaskList: List[Map[String, Any]] = List()
    var line = Map()
    for(line <- taskService.getTasksByCourse(courseid))
    {
      var taskDetails: Map[String, Any] = taskService.getTaskDetails(line(TaskDBLabels.taskid).toInt).getOrElse(Map.empty)
      taskDetails += ("results" -> taskService.getTaskResults(line(TaskDBLabels.taskid).toInt, requestingUser.get))

      bigTaskList = taskDetails :: bigTaskList
    }
    bigTaskList
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
    if (!taskService.hasSubscriptionForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    val taskDetailsOpt = taskService.getTaskDetails(taskid)
    if(taskDetailsOpt.isEmpty){
      throw new ResourceNotFoundException
    }
    val taskDetails = taskDetailsOpt.get
    var upload_url: String = null
    var kafkaMap = Map(LABEL_TASK_ID -> taskid.toString, LABEL_USER_ID -> requestingUser.get.username)
    val dataNode = jsonNode.get(LABEL_DATA)
    try {
      var submissionId: Int = -1
        if(dataNode != null) {
          val tasksystem_id = this.taskService.getTestsystemTopicByTaskId(taskid)
          // If submission was only data we send Kafka directly
          val data = dataNode.asText
          submissionId = taskService.submitTaskWithData(taskid, requestingUser.get, data)
          kafkaMap += (LABEL_DATA -> data)
          kafkaMap += (LABEL_SUBMISSION_ID -> submissionId.toString)
          kafkaMap += ("submit_typ" -> "data", LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(tasksystem_id))
          val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
          logger.warn(jsonResult)
          kafkaTemplate.send(tasksystem_id + "_" + topicName, jsonResult)
          kafkaTemplate.flush()
        }
        else {
          submissionId = taskService.submitTaskWithFile(taskid, requestingUser.get)
          upload_url = "https://localhost:8080/api/v1/tasks/" + taskid.toString + "/submissions/" + submissionId.toString + "/file/upload"
        }

      Map("success" -> "true", LABEL_TASK_ID -> taskid.toString, LABEL_SUBMISSION_ID -> submissionId.toString, LABEL_UPLOAD_URL -> upload_url)
    } catch {
      case _: NullPointerException => throw new BadRequestException("This test needs a: " + taskDetails(TaskDBLabels.test_type) + ". Please provide this.")
    }
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
    val requestingUser = userService.verfiyUserByHeaderToken(request)
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
      kafkaMap += ("submit_typ" -> "file", LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(tasksystem_id))
      val jsonResult = JsonParser.mapToJsonStr(kafkaMap)
      logger.warn(jsonResult)
      kafkaTemplate.send(tasksystem_id + "_" + topicName, jsonResult)
      kafkaTemplate.flush()
      message = true

     } catch {
       case e: Exception => {}
     }
    Map("submission_upload_success" -> message, LABEL_FILENAME -> filename)
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
    if (requestingUser.isEmpty || !taskService.hasSubscriptionForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    taskService.getTaskDetails(taskid).getOrElse(Map.empty)
  }

  // Useful hint for Angular cooperation:
  // https://stackoverflow.com/questions/47886695/current-request-is-not-a-multipart-requestangular-4spring-boot
  /**
    * serve a route to upload a file to a given taskid
    * @author grokonez.com
    *
    * @param taskid unique identification for a task
    * @param file a multipart binary file in a form data format
    * @param request Request Header containing Headers
    * @return HTTP Response with Status Code
    */
  @RequestMapping(value = Array("tasks/{id}/testfile/upload"), method = Array(RequestMethod.POST))
  def handleFileUpload(@PathVariable(LABEL_ID) taskid: Int, @RequestParam(LABEL_FILE) file: MultipartFile, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.isPermittedForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    var message: Boolean = false
    var filename: String = ""
    storageService.storeTaskTestFile(file, taskid)
    filename = file.getOriginalFilename
    taskService.setTaskFilename(taskid, filename)
    val tasksystem_id = taskService.getTestsystemTopicByTaskId(taskid)
    val jsonMsg: Map[String, String] = Map("testfile_url" -> this.taskService.getURLOfTaskTestFile(taskid),
      LABEL_TASK_ID -> taskid.toString,
      LABEL_JWT_TOKEN -> testsystemService.generateTokenFromTestsystem(tasksystem_id))

    message = true

    val jsonStringMsg = JsonParser.mapToJsonStr(jsonMsg)
    logger.warn(jsonStringMsg)
    kafkaTemplate.send(tasksystem_id + topicTaskRequest, jsonStringMsg)
    kafkaTemplate.flush()

    Map("upload_success" -> message, LABEL_FILENAME -> filename)
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
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.courseService.isPermittedForCourse(courseid, user.get)) {
      throw new BadRequestException("User with role `student` and no edit rights can not create a task.")
    }
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      //val filename = jsonNode.get(LABEL_FILENAME).asText()
      //val file = jsonNode.get(LABEL_FILE).asText()
      //val dataBytes: Array[Byte] = Base64.getDecoder.decode(file)
      val test_type = jsonNode.get("test_type").asText()
      // TODO until we finalize this parameters set a default if none is given
      val testsystem_id = if (jsonNode.get(TestsystemLabels.id) != null) jsonNode.get(TestsystemLabels.id).asText() else testsystemLabel1
      var taskInfo: Map[String, Any] = this.taskService.createTask(name, description, courseid, test_type, testsystem_id)
      val taskid: Int = taskInfo(LABEL_TASK_ID).asInstanceOf[Int]

      taskInfo += (LABEL_UPLOAD_URL -> getUploadUrlForTastTestFile(taskid))
      taskInfo
    }
    catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide: name, description, filename, test_type and a file")
      }
    }
  }

  private def getUploadUrlForTastTestFile(taskid: Int): String = {
    "https://localhost:8080/api/v1/tasks/" + taskid.toString +  "/testfile/upload"
  }

  /**
    * delete Task by its ID
    * @param taskid unique identification for a task
    * @param request contain request information
    * @param jsonNode JSON Parameter from request
    * @return JSON
    */
  @RequestMapping(value = Array("/tasks/{id}"), method = Array(RequestMethod.DELETE), consumes = Array(application_json_value))
  def deleteTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, AnyVal] = {
    val user = userService.verfiyUserByHeaderToken(request)
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
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.taskService.isPermittedForTask(taskid, user.get)) {
      throw new UnauthorizedException("User has no edit rights and can not update a task.")
    }
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val test_type = jsonNode.get("test_type").asText()

      // TODO until we finilaize this parameters set a default if none is given
      val testsystem_id = if (jsonNode.get(TestsystemLabels.id) != null) jsonNode.get(TestsystemLabels.id).asText() else testsystemLabel1
      val success = this.taskService.updateTask(taskid, name, description, test_type, testsystem_id)

      Map("success" -> success, LABEL_UPLOAD_URL -> getUploadUrlForTastTestFile(taskid))
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
    * @param request contain request information
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{id}/files/testfile/{token}"))
  @ResponseBody def getTestFileByTask(@PathVariable(LABEL_ID) taskid: Int, @PathVariable token: String, request: HttpServletRequest):
  ResponseEntity[Resource] = {
    // TODO JWT Authorization
    logger.warn(testsystemService.verfiyUserByHeaderToken(request).toString)
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
    * @param request contain request information
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{id}/files/submissions/{subid}/{token}"))
  @ResponseBody def getSubmitFileByTask(@PathVariable(LABEL_ID) taskid: Int, @PathVariable subid: Int,
                                        @PathVariable token: String, request: HttpServletRequest): ResponseEntity[Resource] = {
    // TODO JWT Authorization
    logger.warn(testsystemService.verfiyUserByHeaderToken(request).toString)
    var filename = taskService.getSubmittedFileBySubmission(subid)
    val file = storageService.loadFileBySubmission(filename, taskid, subid)
    ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename + "\"").body(file)
  }

  /**
    * reload kafka listeners that database changes can are respeceted
    * @author Benjamin Manns
    * based on https://stackoverflow.com/questions/41533391/how-to-create-separate-kafka-listener-for-each-topic-dynamically-in-springboot
    * @param request contain request information
    * @param jsonNode JSON Parameter from request
    * @return JSON
    */
  @RequestMapping(value = Array("kafka/listener/reload"), method = Array(RequestMethod.GET), consumes = Array(application_json_value))
  def kafkaReloadListeners(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, AnyVal] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 2) { // TODO Admin or else?
      throw new UnauthorizedException
    }
    this.kafkaReloadService
  }

  private def kafkaReloadService: Map[String, AnyVal] = {
    // TODO load from properties config
    val consumerConfigScala: Map[String, Object] = Map("bootstrap.servers" -> "localhost:9092", "group.id" -> "jcg-group")
    val consumerConfigJava = consumerConfigScala.asJava
    val kafkaConsumerFactory: DefaultKafkaConsumerFactory[String, String] =
      new DefaultKafkaConsumerFactory[String, String](consumerConfigJava, new StringDeserializer, new StringDeserializer)

    // TODO fire this method after updates on Testsystem!
    val kafkaTopicCheckAnswer: Array[String] = testsystemService.getTestsystemsTopicLabelsByTopic("check_answer")
    logger.warn("Registered Listener Topic: ")
    kafkaTopicCheckAnswer.map(s => logger.warn(s))
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
        logger.debug("received message from topic '" + data.topic + "': " + data.value())
        // TODO switch data.topic and save for each then!!

        val answeredMap = JsonParser.jsonStrToMap(data.value())
        try {
          logger.warn(answeredMap.toString())
          taskService.setResultOfTask(Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String]),
            Integer.parseInt(answeredMap(LABEL_SUBMISSION_ID).asInstanceOf[String]),
            answeredMap(LABEL_DATA).asInstanceOf[String], answeredMap("exitcode").asInstanceOf[String])
        } catch {
          case _: NoSuchElementException => logger.warn("Checker Service did not provide all parameters")
        }
      }
    })
    container.start
    Map("reload" -> true)
  }
}
