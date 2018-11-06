package de.thm.ii.submissioncheck.controller

import java.util
import org.springframework.web.bind.annotation._
import collection.JavaConverters._
import de.thm.ii.submissioncheck.services.{ClientService, UserService}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.kafka.support.serializer.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
/**
  * CheckController
  *
  * @author Benjamin Manns
  */
@RestController
@RequestMapping(path = Array("/api/v1"))
class CheckController {

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private var kafkaTemplate: KafkaTemplate[String, String] = null

  private var topicName: String = "check_request"

  private var userService = new UserService()

  /**
    * sendCheck protoype
    * @param data Users Input
    * @param jwt_token JWT
    * @return String
    */
  @RequestMapping(value = Array("/check"), method = Array(RequestMethod.POST))
  def sendCheck(data: String, jwt_token: String): util.Map[String, String] = {

    val requestingUser = userService.verfiyUserByToken(jwt_token)

    if(requestingUser == null)
      {
        throw new UnauthorizedException
      }

    val map:util.Map[String,String] = Map("userid" -> requestingUser.username,"data" ->data).asJava
    val mapper = new ObjectMapper
    val jsonResult = mapper.writerWithDefaultPrettyPrinter.writeValueAsString(map)

    kafkaTemplate.send(topicName, jsonResult)
    kafkaTemplate.flush()
    Map("success" -> "true","fun" -> jsonResult).asJava
  }

  /**
    * Listen on "check_answer"
    * @param msg Answer from service
    */
  @KafkaListener(topics = Array("check_answer"))
  def listener(msg: String): Unit = {
    logger.warn("Get: " + msg)
  }

}
