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

import scala.io.Source
import sys.process._
import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.util.{Failure, Success}
import java.io.File
import java.util.NoSuchElementException
import java.net.{HttpURLConnection, URL}
import java.security.cert.X509Certificate
import javax.net.ssl._

import JsonHelper._
import de.thm.ii.submissioncheck.bash.{BashExec, ShExec}

// Bypasses both client and server validation.
object TrustAll extends X509TrustManager {
  val getAcceptedIssuers = null

  def checkClientTrusted(x509Certificates: Array[X509Certificate], s: String) = {}

  def checkServerTrusted(x509Certificates: Array[X509Certificate], s: String) = {}
}


// Verifies all host names by simply returning true.
object VerifiesAllHostNames extends HostnameVerifier {
  def verify(s: String, sslSession: SSLSession) = true
}
/**
  * Application for running a script with username and token as parameters
  *
  * @author Vlad Sokyrskyy
  */
object SecretTokenChecker extends App {
  /** used in naming */
  final val TASKID = "taskid"
  /** used in naming */
  final val DATA = "data"

  // +++++++++++++++++++++++++++++++++++++++++++
  //               Kafka Settings
  // +++++++++++++++++++++++++++++++++++++++++++
  private val CHECK_REQUEST_TOPIC = "secrettokenchecker_check_request"
  private val CHECK_ANSWER_TOPIC = "secrettokenchecker_check_answer"

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

  private def sendMessage(record: ProducerRecord[String, String]): Future[Done] =
    akka.stream.scaladsl.Source.single(record).runWith(Producer.plainSink(producerSettings))
  private def sendMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](CHECK_ANSWER_TOPIC, message))

  // +++++++++++++++++++++++++++++++++++++++++
  //                Network Settings
  // +++++++++++++++++++++++++++++++++++++++++
  

  private def onMessageReceived(record: ConsumerRecord[String, String]): Unit = {
    // Hack by https://stackoverflow.com/a/29914564/5885054
    val jsonMap: Map[String, Any] = record.value()
    try {
      val submit_type: String = jsonMap("submit_typ").asInstanceOf[String]
      val submissionid: String = jsonMap("submissionid").asInstanceOf[String]
      var arguments: String = ""
      if(submit_type.equals("file")){
        val url: String = jsonMap("fileurl").asInstanceOf[String]
        val sslContext = SSLContext.getInstance("SSL")
        sslContext.init(null, Array(TrustAll), new java.security.SecureRandom())
        HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory)
        HttpsURLConnection.setDefaultHostnameVerifier(VerifiesAllHostNames)
        //new URL(url) #> new File("submit.txt") !!
        val s: String = scala.io.Source.fromURL(url).mkString
        logger.info(s)
        arguments = s
      }
      else if (submit_type.equals(DATA)){
        arguments = jsonMap(DATA).asInstanceOf[String]
      }
      val userid: String = jsonMap("userid").asInstanceOf[String]
      val taskid: String = jsonMap(TASKID).asInstanceOf[String]

      val (output, code) = bashTest(userid, arguments)
      sendMessage(JsonHelper.mapToJsonStr(Map(
        DATA -> output,
        "exitcode" -> code.toString,
        "userid" -> userid,
        "taskid" -> taskid,
        "submissionid" -> submissionid
      )))
    } catch {
      case e: NoSuchElementException => {
        sendMessage(JsonHelper.mapToJsonStr(Map(
          "Error" -> "Please provide valid parameters"
        )))
      }
    }
  }

  /**
    * Name of the md5 test script
    */
  val script = "md5-script.sh"

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

  def downloadFiletoString(urlname: String): String = {
    var s: String = ""
    val timeout = 5000
    val url = new java.net.URL(urlname)
    val connection = url.openConnection().asInstanceOf[HttpURLConnection]
    connection.setConnectTimeout(timeout)
    connection.setReadTimeout(timeout)
    connection.connect()

    if(connection.getResponseCode >= 400){
      logger.error("Error when downloading file!")
    }
    else {
      val src = scala.io.Source.fromURL(urlname)
      s = src.mkString
    }
    s
  }
}
