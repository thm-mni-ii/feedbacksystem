package de.thm.ii.submissioncheck

import java.util.Properties

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.producer.{KafkaProducer, ProducerConfig, ProducerRecord, RecordMetadata}
import org.apache.kafka.common.serialization.{IntegerSerializer, LongDeserializer, StringDeserializer, StringSerializer}

/**
  * KafkaCheckProducer
  * @author Benjamin Manns
  */
class KafkaCheckProducer {
  private val TOPIC = "check_answer"
  private val BOOTSTRAP_SERVERS = "localhost:9092"

  val producer:KafkaProducer[Integer, String] = createProducer()

  var messageIndex: Integer = 0

  /**
    * createProducer
    * @return a KafkaProducer
    */
  def createProducer(): KafkaProducer[Integer, String] ={
    val props: Properties = new Properties
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, BOOTSTRAP_SERVERS)
    props.put(ProducerConfig.CLIENT_ID_CONFIG, "KafkaExampleProducer")
    props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, classOf[IntegerSerializer].getName)
    props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, classOf[StringSerializer].getName)

    new KafkaProducer[Integer, String](props)
  }

  /**
    * runProducer sends to check_answer
    * @param message String of informations
    * @return producer output
    */
  def runProducer(message: String):Any = {

    val producerRecord:ProducerRecord[Integer,String] = new ProducerRecord(TOPIC,messageIndex,message)

    //val metadata:RecordMetadata=
    producer.send(producerRecord)
    producer.flush
    //producer.close
    messageIndex += 1

  }
}
