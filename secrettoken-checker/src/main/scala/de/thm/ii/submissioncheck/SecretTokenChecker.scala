package de.thm.ii.submissioncheck
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

  /*
  val shtest1 = new ShExec("./script.sh", "abc")
  //execute script with arguments and save exit code (successful (0) or not (not 0) )
  val exit2 = shtest1.exec()
  val shmessage1 = shtest1.output
  */

  def getShTestOut(sName : String, token : String): String = {
    val shtest = new ShExec(sName, token)
    shtest.exec()

    return shtest.output
  }

  def getBashTestOut(sName : String, token : String): String = {
    val bashtest = new BashExec(sName, token)
    bashtest.exec()

    return bashtest.output
  }

}
