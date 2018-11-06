package de.thm.ii.submissioncheck.controller

import org.springframework.web.bind.annotation._
import de.thm.ii.submissioncheck.services.{ClientService}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.KafkaTemplate

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

  /**
    * sendCheck protoype
    * @param data Users Input
    * @return String
    */
  @RequestMapping(value = Array("/check"), method = Array(RequestMethod.POST))
  def sendCheck(data: String): String = {

    kafkaTemplate.send(topicName, data)
    kafkaTemplate.flush()
    //Map("success" => "OK").asJava
    "OK"
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
