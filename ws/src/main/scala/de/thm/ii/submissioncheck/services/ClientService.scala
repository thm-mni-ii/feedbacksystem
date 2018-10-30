package de.thm.ii.submissioncheck.services

import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation.{RequestMapping, RestController}
import org.slf4j.Logger
import org.slf4j.LoggerFactory

// Wrapper class, performs in background a CAS Login to THM, based on
// https://github.com/thm-mni-ii/tals/tree/master/android/app/src/main/java/com/thm/mni/tals
import casclientwrapper.CasWrapper

@RestController
@RequestMapping(path = Array("/client"))
class ClientService {

  val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])

  @Value("${message.topic.name}")
  private var topicName: String = null

  @Autowired
  private var kafkaTemplate: KafkaTemplate[String, String] = null

  @RequestMapping(value = Array("/{name:.*\\.js}", "/{name:.*\\.css}", "/{name:.*\\.map}", "/{name:.*\\.gz}"))
  def serveMainAssets() = "todo"

  @RequestMapping(value = Array("/assets/*"))
  def serveAssets() = "todo"

  @RequestMapping(value = Array("/**"))
  def serveMain() = {
    logger.warn("TopicName: " + topicName)
    kafkaTemplate.send("java", "YoHu!")
    kafkaTemplate.flush()
    "TODO"
  }

  @KafkaListener(topics = Array("java"))
  def listener(msg: String): Unit = {
    logger.warn("Get: " + msg)
  }
}
