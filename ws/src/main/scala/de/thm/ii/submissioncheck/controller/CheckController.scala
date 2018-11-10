package de.thm.ii.submissioncheck.controller

import java.util
import org.springframework.web.bind.annotation._
import collection.JavaConverters._
import de.thm.ii.submissioncheck.services.{ClientService, UserService}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.KafkaTemplate
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.submissioncheck.misc.{BadRequestException, UnauthorizedException}
/**
  * CheckController
  *
  * @author Benjamin Manns
  */
@RestController
@RequestMapping(path = Array("/api/v1"))
@deprecated("Please use the /task/{id}/submit","0.1")
class CheckController {

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val topicName: String = "check_request"
  private val userService = new UserService()

  /**
    * sendCheck prototype
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

    // TODO Refactor in Class
    val map:util.Map[String,String] = Map("userid" -> requestingUser.username,"data" ->data).asJava
    val mapper = new ObjectMapper
    val jsonResult = mapper.writerWithDefaultPrettyPrinter.writeValueAsString(map)

    kafkaTemplate.send(topicName, jsonResult)
    kafkaTemplate.flush()
    Map("success" -> "true","fun" -> jsonResult).asJava
  }

}
