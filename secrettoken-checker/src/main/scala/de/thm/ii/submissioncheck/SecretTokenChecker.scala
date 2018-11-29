package de.thm.ii.submissioncheck

import akka.Done
import akka.actor.ActorSystem
import akka.kafka.{ConsumerSettings, ProducerSettings, Subscriptions}
import akka.stream.{ActorMaterializer, Materializer}
import akka.stream.scaladsl.{Keep, Sink, Source}
import akka.kafka.scaladsl.{Consumer, Producer}
import akka.kafka.scaladsl.Consumer.DrainingControl
import org.apache.kafka.clients.producer.ProducerRecord
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.common.serialization.{StringDeserializer, StringSerializer}

import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}
import java.util.NoSuchElementException

import JsonHelper._
import de.thm.ii.submissioncheck.bash.{BashExec, ShExec}

/**
  * Application for running a script with username and token as parameters
  *
  * @author Vlad Sokyrskyy
  */
object SecretTokenChecker extends App {
  // +++++++++++++++++++++++++++++++++++++++++++
  //               Kafka Settings
  // +++++++++++++++++++++++++++++++++++++++++++
  private val CHECK_REQUEST_TOPIC = "check_request"
  private val CHECK_ANSWER_TOPIC = "check_answer"

  private implicit val system: ActorSystem = ActorSystem("akka-system")
  private implicit val materializer: Materializer = ActorMaterializer()
  private implicit val ec: ExecutionContextExecutor = system.dispatcher

  private val logger = system.log

  private val producerSettings = ProducerSettings(system, new StringSerializer, new StringSerializer)
  private val consumerSettings = ConsumerSettings(system, new StringDeserializer, new StringDeserializer)

  private val control = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(CHECK_REQUEST_TOPIC))
    .toMat(Sink.foreach(onMessageReceived))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  // Correctly handle Ctrl+C and docker container stop
  sys.addShutdownHook({
    control.shutdown().onComplete {
        case Success(_) => logger.info("Exiting ...")
        case Failure(err) => logger.warning(err.getMessage)
      }
  })

  private def sendMessage(record: ProducerRecord[String, String]): Future[Done] = Source.single(record).runWith(Producer.plainSink(producerSettings))
  private def sendMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](CHECK_ANSWER_TOPIC, message))

  private def onMessageReceived(record: ConsumerRecord[String, String]): Unit = {
    // Hack by https://stackoverflow.com/a/29914564/5885054
    val jsonMap: Map[String, Any] = record.value()
    try {
      val userid: String = jsonMap("userid").asInstanceOf[String]
      val data: String = jsonMap("data").asInstanceOf[String]
      val taskid: String = jsonMap("taskid").asInstanceOf[String]
      val submissionid: String = jsonMap("submissionid").asInstanceOf[String]

      val (output, code) = bashTest(userid, data)
      sendMessage(Map(
        "data" -> output,
        "exitcode" -> code.toString,
        "userid" -> userid,
        "taskid" -> taskid,
        "submissionid" -> submissionid
      ))
    } catch {
      case e: NoSuchElementException => {
        sendMessage("Please provide valid parameter")
      }
    }
  }

  /**
    * Name of the md5 test script
    */
  val script = "script.sh"

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
  def shTest(token: String): String = {
    val shtest1 = new ShExec("./script.sh", token)
    //execute script with arguments and save exit code (successful (0) or not (not 0) )
    shtest1.exec()
    val shmessage1 = shtest1.output
    shmessage1
  }

  /**
    * getShTestOut
    * @param sName shell script name
    * @param token shell parameter
    * @return Output of script
    */
  def getShTestOut(sName: String, token: String): String = {
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
  def getBashTestOut(sName: String, username: String, token: String): String = {
    val bashtest = new BashExec(sName, username, token)
    bashtest.exec()
    bashtest.output
  }
}
