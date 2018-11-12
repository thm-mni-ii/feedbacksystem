package de.thm.ii.submissioncheck.controller

import java.util
import java.util.NoSuchElementException

import collection.JavaConverters._
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.submissioncheck.misc.{JsonParser, UnauthorizedException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.services.{ClientService, TaskService, UserService}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
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
class TaskController{

  /** holds connection to TaskService*/
  val taskService = new TaskService()

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

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val topicName: String = "check_request"

  /**
    * Print all results, if any,from a given task
    * @param taskid unique identification for a task
    * @param jwt_token JWT
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/result"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getTaskResultByTask(@PathVariable(LABEL_ID) taskid:Integer, jwt_token: String): util.List[util.Map[String, String]] = {
    val user:User = userService.verfiyUserByToken(jwt_token)
    taskService.getTaskResults(taskid,user)
  }

  /**
    * Submit data for a given task
    * @param taskid unique identification for a task
    * @param data Students solution to a given question
    * @param jwt_token JWT
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/submit"), method = Array(RequestMethod.POST))
  @ResponseBody
  def submitTask(@PathVariable(LABEL_ID) taskid: Integer, data: String, jwt_token: String):util.Map[String, String] = {
    val requestingUser = userService.verfiyUserByToken(jwt_token)

    if(requestingUser == null)
    {
      throw new UnauthorizedException
    }

    val submissionId = taskService.submitTask(taskid,requestingUser)

    val jsonResult = JsonParser.mapToJsonStr(Map(LABEL_TASK_ID -> taskid.toString, LABEL_USER_ID -> requestingUser.username,"data" ->data,
      LABEL_SUBMISSION_ID -> submissionId.toString))
    logger.warn(jsonResult)
    kafkaTemplate.send(topicName, jsonResult)
    kafkaTemplate.flush()

    Map("success" -> "true",LABEL_TASK_ID -> taskid.toString,LABEL_SUBMISSION_ID -> submissionId.toString).asJava
  }

  /**
    * Print details for a given Task
    * @param taskid unique identification for a task
    * @param jwt_token JWT
    * @return JSON
    */
  @RequestMapping(value = Array("{id}"), method = Array(RequestMethod.GET))
  def getTaskDetails(@PathVariable(LABEL_ID) taskid: Integer, jwt_token: String): util.Map[String, String] = {
    val requestingUser = userService.verfiyUserByToken(jwt_token)

    if(requestingUser == null)
    {
      throw new UnauthorizedException
    }
    taskService.getTaskDetails(taskid,requestingUser)
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
        answeredMap("data").asInstanceOf[String], answeredMap("exitcode").asInstanceOf[String])

    }
    catch {
      case e: NoSuchElementException => {
        logger.warn("Checker Service did not provide all parameters")

      }

    }
  }
}
