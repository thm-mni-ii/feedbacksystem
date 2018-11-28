package de.thm.ii.submissioncheck.controller

import java.util
import java.util.NoSuchElementException
import com.fasterxml.jackson.databind.JsonNode
import collection.JavaConverters._
import de.thm.ii.submissioncheck.misc.{BadRequestException, JsonParser, UnauthorizedException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.services.{ClientService, StorageService, TaskService, UserService}
import javax.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.Resource
import org.springframework.http.{HttpHeaders, HttpStatus, ResponseEntity}
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation._

/**
  * TaskController implement routes for submitting task and receiving results
  *
  * @author Benjamin Manns
  */
@RestController
@RequestMapping(path = Array("/api/v1/tasks"))
class TaskController {
  /** holds connection to TaskService*/
  val taskService = new TaskService()

  /** hold Stoare conection */
  val storageService = new StorageService()

  /** holds connection to TaskService*/
  val userService = new UserService()

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
  /** JSON variable testfile_url ID*/
  final val LABEL_TESTFILE_URL = "testfile_url"
  /** JSON variable course_id ID*/
  final val LABEL_COURSEID = "course_id"

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val checkTopic: String = "check_request"
  private val newTaskTopic: String = "new_task_request"

  /**
    * Print all results, if any,from a given task
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/result"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTaskResultByTask(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): util.List[util.Map[String, String]] = {
    val requestingUser: User = userService.verfiyUserByHeaderToken(request)
    if (requestingUser == null) {
      throw new UnauthorizedException
    }
    taskService.getTaskResults(taskid, requestingUser)
  }

  /**
    * Submit data for a given task
    * @param taskid unique identification for a task
    * @param jsonNode request body containing "data" parameter
    * @param request Request Header containing Headers
    * @return JSON
    */
  @ResponseStatus(HttpStatus.ACCEPTED)
  @RequestMapping(value = Array("{id}/submit"), method = Array(RequestMethod.POST), consumes = Array("application/json"))
  @ResponseBody
  def submitTask(@PathVariable(LABEL_ID) taskid: Integer, @RequestBody jsonNode: JsonNode, request: HttpServletRequest): util.Map[String, String] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)

    if (requestingUser == null) {
      throw new UnauthorizedException
    }
    try {
      val data = jsonNode.get(LABEL_DATA).asText()

      val submissionId = taskService.submitTask(taskid, requestingUser, data)

      val jsonResult = JsonParser.mapToJsonStr(Map(LABEL_TASK_ID -> taskid.toString, LABEL_USER_ID -> requestingUser.username, LABEL_DATA->data,
        LABEL_SUBMISSION_ID -> submissionId.toString))
      logger.warn(jsonResult)
      kafkaTemplate.send(checkTopic, jsonResult)
      kafkaTemplate.flush()

      // TODO move it to "createTask" and replace course id
      val jsonMessageNewTaskTopic = JsonParser.mapToJsonStr(Map(LABEL_TASK_ID -> taskid.toString,
        LABEL_COURSEID -> "1", LABEL_TESTFILE_URL -> taskService.getURLbyTask(taskid))) // LABEL_USER_ID -> requestingUser.username
      logger.warn(jsonMessageNewTaskTopic)
      kafkaTemplate.send(newTaskTopic, jsonResult)
      kafkaTemplate.flush()

      Map("success" -> "true", LABEL_TASK_ID -> taskid.toString, LABEL_SUBMISSION_ID -> submissionId.toString).asJava
    } catch {
      case e: NullPointerException => {
        throw new BadRequestException("Please provide a data parameter.")
      }
    }
  }

  /**
    * Print details for a given Task
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.GET))
  def getTaskDetails(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): util.Map[String, String] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)

    if (requestingUser == null) {
      throw new UnauthorizedException
    }
    taskService.getTaskDetails(taskid, requestingUser)
  }

  /**
    * Serve requested files from url
    *
    * @param filename a valid filename
    * @param taskid unique identification for a task
    * @return HTTP Answer containing the whole file
    */
  @GetMapping(Array("{id}/files/{filename:.+}"))
  @ResponseBody def getFile(@PathVariable(LABEL_ID) taskid: Int, @PathVariable filename: String): ResponseEntity[Resource] = {
    val file = storageService.loadFile(filename, taskid)
    ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename + "\"").body(file)
  }

  /**
    * Listen on "check_answer"
    * @param msg Answer from service
    */
  @KafkaListener(topics = Array("check_answer"))
  def listener(msg: String): Unit = {
    logger.warn("Get: " + msg)
    val answeredMap = JsonParser.jsonStrToMap(msg)
    try {
      logger.warn(answeredMap.toString())
      this.taskService.setResultOfTask(
        Integer.parseInt(answeredMap(LABEL_TASK_ID).asInstanceOf[String]), Integer.parseInt(answeredMap(LABEL_SUBMISSION_ID).asInstanceOf[String]),
        answeredMap(LABEL_DATA).asInstanceOf[String], answeredMap("exitcode").asInstanceOf[String])

    } catch {
      case e: NoSuchElementException => {
        logger.warn("Checker Service did not provide all parameters")
      }
    }
  }
}
