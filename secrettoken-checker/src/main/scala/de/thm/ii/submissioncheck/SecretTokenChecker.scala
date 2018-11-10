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
  * Application for running a script with username and token as parameters
  *
  * @author Vlad Sokyrskyy
  */
object SecretTokenChecker extends App {

  //code for testing out
  /*
  val bashtest1 = new BashExec("script.sh", "a", "0cc175b9c0f1b6a831c399e269772661");
  val exit1 = bashtest1.exec()
  val bashmessage1 = bashtest1.output
  print("exitcode: " + bashtest1.exitcode + "\n")
  */
  /**
    * Name of the md5 test script
    */
  val script = "script.sh"

  /**
    * Instance of Check Consumer which runs in a loop and try to pull information
    */
  val cons = new KafkaCheckConsumer()
  cons.runConsumer(bashTest)

  /**
    * Method for the callback function
    * @param name username
    * @param token md5hash
    * @return message and exitcode
    */
  def bashTest(name: String, token: String): (String, Int) = {
    val bashtest1 = new BashExec(script, name, token)
    val exit1 = bashtest1.exec()
    val message1 = bashtest1.output

    (message1, exit1)
  }

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
    * @param username parameter
    * @param token parameter
    * @return Output of script
    */
  def getBashTestOut(sName : String, username: String, token : String): String = {
    val bashtest = new BashExec(sName, username, token)
    bashtest.exec()
    bashtest.output
  }

}
