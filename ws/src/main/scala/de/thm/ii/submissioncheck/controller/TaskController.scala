package de.thm.ii.submissioncheck.controller

import java.util.NoSuchElementException
import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, JsonParser, UnauthorizedException}
import de.thm.ii.submissioncheck.services.{TaskService, UserService}
import javax.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
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
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val userService: UserService = null

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

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val topicName: String = "check_request"

  /**
    * Print all results, if any,from a given task
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/result"), method = Array(RequestMethod.GET))
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
  @RequestMapping(value = Array("{id}/submit"), method = Array(RequestMethod.POST), consumes = Array("application/json"))
  @ResponseBody
  def submitTask(@PathVariable(LABEL_ID) taskid: Integer, @RequestBody jsonNode: JsonNode, request: HttpServletRequest): Map[String, String] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)
    if (requestingUser.isEmpty) {
      throw new UnauthorizedException
    }
    try {
      val data = jsonNode.get(LABEL_DATA).asText()
      val submissionId = taskService.submitTask(taskid, requestingUser.get, data)

      val jsonResult = JsonParser.mapToJsonStr(Map(
        LABEL_TASK_ID -> taskid.toString,
        LABEL_USER_ID -> requestingUser.get.username,
        LABEL_DATA->data,
        LABEL_SUBMISSION_ID -> submissionId.toString
      ))
      logger.warn(jsonResult)
      kafkaTemplate.send(topicName, jsonResult)
      kafkaTemplate.flush()

      Map("success" -> "true", LABEL_TASK_ID -> taskid.toString, LABEL_SUBMISSION_ID -> submissionId.toString)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide a data parameter.")
    }
  }

  /**
    * Print details for a given Task
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.GET))
  def getTaskDetails(@PathVariable(LABEL_ID) taskid: Integer, request: HttpServletRequest): Map[String, String] = {
    val requestingUser = userService.verfiyUserByHeaderToken(request)

    if (requestingUser.isEmpty) {
      throw new UnauthorizedException
    }

    taskService.getTaskDetails(taskid, requestingUser.get).getOrElse(Map.empty)
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
