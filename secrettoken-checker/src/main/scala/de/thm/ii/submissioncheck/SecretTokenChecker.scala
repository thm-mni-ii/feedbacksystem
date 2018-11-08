package de.thm.ii.submissioncheck

import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.serialization.{LongDeserializer, StringDeserializer}
import java.util.Properties
import java.util.Collections
/*
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.kafka.core.KafkaTemplate
*/

/**
  * So far only some small tests
  *
  * @author Vlad Sokyrskyy
  */
object SecretTokenChecker extends App {

  //private var kafkaTemplate: KafkaTemplate[String, String] = null

  //code for testing out
  /*
  val bashtest1 = new BashExec("./script.sh", "abc");
  val exit1 = bashtest1.exec()
  val bashmessage1 = bashtest1.output
  */

  /**
    * Instance of Check Consumer which runs in a loop and try to pull information
    */
  val cons = new KafkaCheckConsumer()
  cons.runConsumer(shTest)

  /**
    * shTest is used by Kafka Example
    * @param token String from User
    * @return String Answer from Script
    */
  def shTest(token:String): String = {
    val shtest1 = new ShExec("./script.sh", token)
    //execute script with arguments and save exit code (successful (0) or not (not 0) )
    val exit2 = shtest1.exec()
    val shmessage1 = shtest1.output
    shmessage1
  }

  /**
    * getShTestOut
    * @param sName shell script name
    * @param token shell parameter
    * @return Output of script
    */
  def getShTestOut(sName : String, token : String): String = {
    val shtest = new ShExec(sName, token)
    shtest.exec()

    shtest.output
  }

  /**
    * getBashTestOut
    * @param sName bash script name
    * @param token bash parameter
    * @return Output of script
    */
  def getBashTestOut(sName : String, token : String): String = {
    val bashtest = new BashExec(sName, token)
    bashtest.exec()
    bashtest.output
  }

}
