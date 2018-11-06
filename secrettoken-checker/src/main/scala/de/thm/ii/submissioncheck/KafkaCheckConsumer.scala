package de.thm.ii.submissioncheck
import scala.collection.JavaConversions._
import java.util.{Collections, Properties}


import org.apache.kafka.clients.consumer.{ConsumerConfig, ConsumerRecord, KafkaConsumer}
import org.apache.kafka.common.serialization.{LongDeserializer, StringDeserializer}
import org.springframework.kafka.annotation.KafkaListener

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
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, classOf[LongDeserializer].getName)
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, classOf[StringDeserializer].getName)

    val consumer = new KafkaConsumer(props)

    consumer.subscribe(Collections.singletonList(TOPIC))

    consumer
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
      //prrintln("____________RECORDS_______________________")
      for (record <- consumerRecords.iterator()) {
        //prrintln(s"Here's your $record")
        val callbackAnswer: String = callback(record.value())
        //prrintln("Funny: " + callbackAnswer)
        producer.runProducer(callbackAnswer)
      }
      //prrintln("__________________________________________")
    }

    runConsumer(callback)

  }
}