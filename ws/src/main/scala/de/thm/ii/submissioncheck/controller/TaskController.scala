package de.thm.ii.submissioncheck.controller

import scala.collection.JavaConverters._
import java.util.{Base64, NoSuchElementException}
import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, JsonParser, UnauthorizedException}
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
  /** JSON variable testfile_url ID*/
  final val LABEL_TESTFILE_URL = "testfile_url"
  /** JSON variable course_id ID*/
  final val LABEL_COURSEID = "course_id"

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val checkTopic: String = "check_request"
  private val newTaskTopic: String = "new_task_request"

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
        val filename = jsonNode.get(LABEL_FILENAME).asText()
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
      kafkaTemplate.send(checkTopic, jsonResult)
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

    if (requestingUser.isEmpty || taskService.isPermittedForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    taskService.getTaskDetails(taskid).getOrElse(Map.empty)
  }

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
  def createTask(@PathVariable(LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, AnyVal] = {
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
      val filename = jsonNode.get(LABEL_FILENAME).asText()
      val file = jsonNode.get(LABEL_FILE).asText()
      val dataBytes: Array[Byte] = Base64.getDecoder.decode(file)
      val test_type = jsonNode.get("test_type").asText()
      // TODO until we finilaize this parameters set a default if none is given
      val testsystem_id = if (jsonNode.get(TestsystemLabels.id) != null) jsonNode.get(TestsystemLabels.id).asText() else testsystemLabel1
      val taskInfo = this.taskService.createTask(name, description, courseid, filename, test_type, testsystem_id)
      val taskid: Int = taskInfo(LABEL_TASK_ID).asInstanceOf[Int]
      val jsonMsg: Map[String, String] = Map("testfile_url" -> this.taskService.getURLOfTaskTestFile(taskid),
        LABEL_TASK_ID -> taskid.toString)

      storageService.storeTaskTestFile(dataBytes, filename, taskid)

      val jsonStringMsg = JsonParser.mapToJsonStr(jsonMsg)
      logger.warn(jsonStringMsg)
      kafkaTemplate.send(taskService.getTestsystemTopicByTaskId(taskid) + topicTaskRequest, jsonStringMsg)
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
    if (this.taskService.isPermittedForTask(taskid, user.get)) {
      throw new BadRequestException("User can not delete a task.")
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
  def updateTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, AnyVal] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (this.taskService.isPermittedForTask(taskid, user.get)) {
      throw new BadRequestException("User with role `student` and no edit rights can not update a task.")
    }
    try {
      val name = jsonNode.get("name").asText()
      val description = jsonNode.get("description").asText()
      val filename = jsonNode.get(LABEL_FILENAME).asText()
      val file = jsonNode.get(LABEL_FILE).asText()
      val dataBytes: Array[Byte] = Base64.getDecoder.decode(file)
      val test_type = jsonNode.get("test_type").asText()
      // TODO get from route, we have to discuss this
      // TODO until we finilaize this parameters set a default if none is given
      val testsystem_id = if (jsonNode.get(TestsystemLabels.id) != null) jsonNode.get(TestsystemLabels.id).asText() else testsystemLabel1
      val success = this.taskService.updateTask(taskid, name, description, filename, test_type, testsystem_id)

      val jsonMsg: Map[String, String] = Map(
        "testfile_url" -> this.taskService.getURLOfTaskTestFile(taskid),
        LABEL_TASK_ID -> taskid.toString)

      storageService.storeTaskTestFile(dataBytes, filename, taskid)

      val jsonStringMsg = JsonParser.mapToJsonStr(jsonMsg)
      logger.warn(jsonStringMsg)
      kafkaTemplate.send(taskService.getTestsystemTopicByTaskId(taskid) + "update_task", jsonStringMsg)
      kafkaTemplate.flush()
      Map("success" -> success)
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
