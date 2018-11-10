package de.thm.ii.submissioncheck
import java.util

import scala.collection.JavaConversions._
import java.util.{Collections, NoSuchElementException, Properties}
import collection.JavaConverters._
import com.fasterxml.jackson.databind.ObjectMapper
import org.apache.kafka.clients.consumer.{ConsumerConfig, ConsumerRecord, KafkaConsumer}
import org.apache.kafka.common.serialization.{LongDeserializer, StringDeserializer, StringSerializer}
import org.springframework.kafka.support.serializer.JsonDeserializer
import org.json4s._
import org.json4s.jackson.JsonMethods._

/**
  * KafkaCheckConsumer: Example from http://cloudurable.com/blog/kafka-tutorial-kafka-consumer/index.html
  * @author Benjamin Manns
  */
class KafkaCheckConsumer{

  private val BOOTSTRAP_SERVERS = "localhost:9092"

  private val TOPIC = "check_request"

  /**
    * createConsumer simply return a KafkaCheckConsumer
    *
    * @author Benjamin Manns
    * @return kafka consumer
    */
  def createConsumer(): KafkaConsumer[Nothing, Nothing] = {

    val props: Properties = new Properties
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, BOOTSTRAP_SERVERS)
    props.put(ConsumerConfig.GROUP_ID_CONFIG, "KafkaExampleConsumer")
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, classOf[StringDeserializer].getName)
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, classOf[JsonDeserializer[String]].getName)

    val consumer = new KafkaConsumer(props)

    consumer.subscribe(Collections.singletonList(TOPIC))

    consumer
  }

  // TODO refactor in other class
  /**
    * jsonStrToMap use json4s to parse a json string
    *
    * @author Benjamin Manns
    * @param jsonStr a json String
    * @return Scala Map
    */
  def jsonStrToMap(jsonStr: String): Map[String, Any] = {
    implicit val formats = org.json4s.DefaultFormats

    parse(jsonStr).extract[Map[String, Any]]
  }

  // TODO refactor in other class
  /**
    * mapToJsonStr use Object Mapper
    *
    * @author Benjamin Manns
    * @param jsonMap a Scala Map
    * @return Json String
    */
  def mapToJsonStr(jsonMap: Map[String, String]):String = {
    val map:util.Map[String,String] = jsonMap.asJava
    val mapper = new ObjectMapper
    val jsonResult = mapper.writerWithDefaultPrettyPrinter.writeValueAsString(map)
    jsonResult
  }

  /**
    * runConsumer
    * @param callback a method with is called on incoming data
    */
  def runConsumer(callback:(String)=>String):Unit = {

    val producer = new KafkaCheckProducer()

    val consumer = createConsumer()
    var endlessLoop = true
    val millisec = 5000
    val timeout = 1000
    for (i <- 1 to 100) {
      Thread.sleep(millisec)
      val consumerRecords = consumer.poll(timeout)
      for (record <- consumerRecords.iterator()) {

        // Hack by https://stackoverflow.com/a/29914564/5885054
        val jsonRaw:String = record.value()
        val jsonMap = jsonStrToMap(jsonRaw)
        try{
          val userid:String = jsonMap("userid").asInstanceOf[String]
          val data:String = jsonMap("data").asInstanceOf[String]
          val taskid:String = jsonMap("taskid").asInstanceOf[String]
          val submisisonid:String = jsonMap("submissionid").asInstanceOf[String]
          val callbackAnswer: String = callback(data)
          producer.runProducer(mapToJsonStr(Map("data"->callbackAnswer,"userid"->userid,"taskid" -> taskid, "submissionid" -> submisisonid)))

        }
        catch{
          case e : NoSuchElementException => {
            producer.runProducer("Please provide valid parameter")

          }
        }
      }
    }
    runConsumer(callback)
  }
}
