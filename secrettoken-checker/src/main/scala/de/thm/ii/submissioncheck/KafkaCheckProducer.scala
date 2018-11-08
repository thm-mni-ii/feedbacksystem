package de.thm.ii.submissioncheck

import java.util.Properties

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.producer.{KafkaProducer, ProducerConfig, ProducerRecord, RecordMetadata}
import org.apache.kafka.common.serialization.StringSerializer
import org.springframework.kafka.support.serializer.JsonSerializer

/**
  * KafkaCheckProducer
  * @author Benjamin Manns
  */
class KafkaCheckProducer {
  private val TOPIC = "check_answer"
  private val BOOTSTRAP_SERVERS = "localhost:9092"

  /**
    * instance variable producer
    */
  val producer: KafkaProducer[String, String] = createProducer()

  /**
    * instance variable messageIndex
    */
  var messageIndex: Integer = 0

  /**
    * createProducer
    * @return a KafkaProducer
    */
  def createProducer(): KafkaProducer[String, String] ={
    val props: Properties = new Properties
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, BOOTSTRAP_SERVERS)
    props.put(ProducerConfig.CLIENT_ID_CONFIG, "KafkaExampleProducer")
    props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, classOf[StringSerializer].getName)
    props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, classOf[JsonSerializer[String]].getName)

    new KafkaProducer[String, String](props)
  }

  /**
    * runProducer sends to check_answer
    * @param message String of informations
    * @return producer output
    */
  def runProducer(message: String):Any = {

    val producerRecord:ProducerRecord[String,String] = new ProducerRecord(TOPIC,messageIndex.toString,message)

    //val metadata:RecordMetadata=
    producer.send(producerRecord)
    producer.flush
    //producer.close
    messageIndex += 1

  }
}
