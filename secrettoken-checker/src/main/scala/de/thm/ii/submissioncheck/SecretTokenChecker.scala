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
import java.io._
import java.util.NoSuchElementException
import java.net.{HttpURLConnection, URL, URLDecoder}
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Path, Paths, StandardCopyOption}
import java.security.cert.X509Certificate

import javax.net.ssl._
import JsonHelper._
import de.thm.ii.submissioncheck.bash.{BashExec, ShExec}

/**
  * Bypasses both client and server validation.
  */
object TrustAll extends X509TrustManager {
  /** turn off SSL Issuer list */
  val getAcceptedIssuers = null

  /**
    * bypass client SSL Checker
    * @param x509Certificates which certificates should be trusted
    * @param s server / url
    */
  override def checkClientTrusted(x509Certificates: Array[X509Certificate], s: String): Unit = {}

  /**
    * bypass server SSL Checker
    * @param x509Certificates which certificates should be trusted
    * @param s server / url
    */
  override def checkServerTrusted(x509Certificates: Array[X509Certificate], s: String): Unit = {}
}

/**
  * Verifies all host names by simply returning true.
  */
object VerifiesAllHostNames extends HostnameVerifier {
  /**
    * method which verifies a SSL Session. Always return true, so no check is done. This is for development mode only
    * @param s url
    * @param sslSession https ssl session
    * @return Boolean, always true
    */
  def verify(s: String, sslSession: SSLSession): Boolean = true
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
  /** used in naming */
  final val ULDIR = "upload-dir/"

  private val LABEL_AUTHORIZATION = "Authorization"
  private val LABEL_BEARER = "Bearer: "
  private val LABEL_CONNECTION = "Connection"
  private val LABEL_CLOSE = "close"

// +++++++++++++++++++++++++++++++++++++++++++
//               Kafka Settings
// +++++++++++++++++++++++++++++++++++++++++++

  private val SYSTEMIDTOPIC = "secrettokenchecker"
  private val CHECK_REQUEST_TOPIC = SYSTEMIDTOPIC + "_check_request"
  private val CHECK_ANSWER_TOPIC = SYSTEMIDTOPIC + "_check_answer"
  private val TASK_REQUEST_TOPIC = SYSTEMIDTOPIC + "_new_task_request"
  private val TASK_ANSWER_TOPIC = SYSTEMIDTOPIC + "_new_task_answer"

  private implicit val system: ActorSystem = ActorSystem("akka-system")
  private implicit val materializer: Materializer = ActorMaterializer()
  private implicit val ec: ExecutionContextExecutor = system.dispatcher

  private val LABEL_ERROR_DOWNLOAD = "Error when downloading file!"
  private val logger = system.log
  private val LABEL_TASKID = "taskid"
  private val LABEL_ACCEPT = "accept"
  private val LABEL_ERROR = "error"

  private val producerSettings = ProducerSettings(system, new StringSerializer, new StringSerializer)
  private val consumerSettings = ConsumerSettings(system, new StringDeserializer, new StringDeserializer)

  private val control_submission = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(CHECK_REQUEST_TOPIC))
    .toMat(Sink.foreach(onSubmissionReceived))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  private val control_task = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(TASK_REQUEST_TOPIC))
    .toMat(Sink.foreach(onTaskReceived))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  // Correctly handle Ctrl+C and docker container stop
  sys.addShutdownHook({
    control_submission.shutdown().onComplete {
        case Success(_) => logger.info("Exiting ...")
        case Failure(err) => logger.warning(err.getMessage)
      }
    control_task.shutdown().onComplete {
        case Success(_) => logger.info("Exiting ...")
        case Failure(err) => logger.warning(err.getMessage)
      }
  })

  private def sendMessage(record: ProducerRecord[String, String]): Future[Done] =
    akka.stream.scaladsl.Source.single(record).runWith(Producer.plainSink(producerSettings))
  private def sendCheckMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](CHECK_ANSWER_TOPIC, message))
  private def sendTaskMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](TASK_ANSWER_TOPIC, message))

  // +++++++++++++++++++++++++++++++++++++++++
  //                Network Settings
  // +++++++++++++++++++++++++++++++++++++++++
  private val sslContext = SSLContext.getInstance("SSL")
  sslContext.init(null, Array(TrustAll), new java.security.SecureRandom())
  HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory)
  HttpsURLConnection.setDefaultHostnameVerifier(VerifiesAllHostNames)

  private def onSubmissionReceived(record: ConsumerRecord[String, String]): Unit = {
    // Hack by https://stackoverflow.com/a/29914564/5885054
    logger.info("Submission Received")
    val jsonMap: Map[String, Any] = record.value()
    try {
      val submit_type: String = jsonMap("submit_typ").asInstanceOf[String]
      val submissionid: String = jsonMap("submissionid").asInstanceOf[String]
      val taskid: String = jsonMap(TASKID).asInstanceOf[String]
      var submittedFilePath: String = ""

      if(submit_type.equals("file")){
        val url: String = jsonMap("fileurl").asInstanceOf[String]
        //new URL(url) #> new File("submit.txt") !!
        val jwt_token: String = jsonMap("jwt_token").asInstanceOf[String]

        submittedFilePath = downloadSubmittedFileToFS(url, jwt_token, taskid, submissionid).toAbsolutePath.toString
        logger.info(submittedFilePath)
      }
      else if (submit_type.equals(DATA)){
        submittedFilePath = saveStringToFile(jsonMap(DATA).asInstanceOf[String], taskid, submissionid).toAbsolutePath.toString
      }
      var passed: Int = 0
      val userid: String = jsonMap("userid").asInstanceOf[String]

      val (output, code) = bashTest(taskid, userid, submittedFilePath)
      if(code == 0){
        passed = 1
      }
      sendCheckMessage(JsonHelper.mapToJsonStr(Map(
        DATA -> output,
        "passed" -> passed.toString,
        "exitcode" -> code.toString,
        "userid" -> userid,
        LABEL_TASKID -> taskid,
        "submissionid" -> submissionid
      )))
    } catch {
      case e: NoSuchElementException => {
        sendCheckMessage(JsonHelper.mapToJsonStr(Map(
          "Error" -> "Please provide valid parameters"
        )))
      }
    }
  }

  /**
    * Deletes a dir recursively deleting anything inside it.
    * @author https://stackoverflow.com/users/306602/naikus by https://stackoverflow.com/a/3775864/5885054
    * @param dir The dir to delete
    * @return true if the dir was successfully deleted
    */
  private def deleteDirectory(dir: File): Boolean = {
    if (!dir.exists() || !dir.isDirectory()) {
      false
    } else {
      val files = dir.list()
      for (file <- files) {
        val f = new File(dir, file)
        if (f.isDirectory()) {
          deleteDirectory(f)
        } else {
          f.delete()
        }
      }
      dir.delete()
    }
  }

  private def onTaskReceived(record: ConsumerRecord[String, String]): Unit = {
    val jsonMap: Map[String, Any] = record.value()
    try{
      logger.warning("task received")
      val sslContext = SSLContext.getInstance("SSL")
      sslContext.init(null, Array(TrustAll), new java.security.SecureRandom())
      HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory)
      HttpsURLConnection.setDefaultHostnameVerifier(VerifiesAllHostNames)

      // Here we send multiple files!!
      val urls: List[String] = jsonMap("testfile_urls").asInstanceOf[List[String]]
      val taskid: String = jsonMap(TASKID).asInstanceOf[String]
      val jwt_token: String = jsonMap("jwt_token").asInstanceOf[String]
      if (urls.length != 1 && urls.length != 2) {
        sendTaskMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
          "Please provide one or two files (testfile and scriptfile)", LABEL_TASKID -> taskid)))
      } else {
        //deleteDirectory(new File(Paths.get(ULDIR).resolve(taskid).toString))
        downloadFilesToFS(urls, jwt_token, taskid)
        sendTaskMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> true, LABEL_ERROR -> "", LABEL_TASKID -> taskid)))
      }
    } catch {
      case e: NoSuchElementException => {
        sendTaskMessage(JsonHelper.mapToJsonStr(Map(
          "error" -> "Please provide valid parameters",
          "accept" -> false,
          LABEL_TASKID -> ""
        )))
      }
    }
  }

  private val message_err = "Error: Task doesn't contain a testfile"
  /**
    * Name of the md5 test script
    */
  val dummyscript = "md5-script.sh"

  /**
    * Method for the callback function
    * @param taskid id of task
    * @param name username
    * @param filePath md5hash
    * @return message and exitcode
    */
  def bashTest(taskid: String, name: String, filePath: String): (String, Int) = {
      val bashtest1 = new BashExec(taskid, name, filePath)
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

  private def saveStringToFile(content: String, taskid: String, submissionid: String): Path = {
    new File(Paths.get(ULDIR).resolve(taskid).resolve(submissionid).toString).mkdirs()
    val path = Paths.get(ULDIR).resolve(taskid).resolve(submissionid).resolve(submissionid)
    Files.write(path, content.getBytes(StandardCharsets.UTF_8))
    path
  }

  private def downloadSubmittedFileToFS(link: String, jwt_token: String, taskid: String, submissionid: String): Path = {
    val timeout = 1000
    val url = new java.net.URL(link)
    val filename = submissionid

    val connection = url.openConnection().asInstanceOf[HttpURLConnection]
    connection.setRequestProperty(LABEL_AUTHORIZATION, LABEL_BEARER + jwt_token)
    connection.setConnectTimeout(timeout)
    connection.setReadTimeout(timeout)
    connection.setRequestProperty(LABEL_CONNECTION, LABEL_CLOSE)
    connection.connect()
    if(connection.getResponseCode >= 400){
      logger.error(LABEL_ERROR_DOWNLOAD)
    }
    else {
      new File(Paths.get(ULDIR).resolve(taskid).resolve(submissionid).toString).mkdirs()
      Files.copy(connection.getInputStream, Paths.get(ULDIR).resolve(taskid).resolve(submissionid).resolve(filename), StandardCopyOption.REPLACE_EXISTING)
    }
    Paths.get(ULDIR).resolve(taskid).resolve(filename).resolve(filename)
  }

  private def downloadFilesToFS(urlnames: List[String], jwt_token: String, taskid: String) = {
    val timeout = 1000
    for(urlname <- urlnames){
      val url = new java.net.URL(urlname)
      val urlParts = urlname.split("/")
      // syntax of testfile url allows us to get filename
      val filename = URLDecoder.decode(urlParts(urlParts.length-1), StandardCharsets.UTF_8.toString)
      val connection = url.openConnection().asInstanceOf[HttpURLConnection]
      connection.setRequestProperty(LABEL_AUTHORIZATION, LABEL_BEARER + jwt_token)
      connection.setConnectTimeout(timeout)
      connection.setReadTimeout(timeout)
      connection.setRequestProperty(LABEL_CONNECTION, LABEL_CLOSE)
      connection.connect()

      if(connection.getResponseCode >= 400){
        logger.error(LABEL_ERROR_DOWNLOAD)
      }
      else {
        new File(Paths.get(ULDIR).resolve(taskid).toString).mkdirs()
        Files.copy(connection.getInputStream, Paths.get(ULDIR).resolve(taskid).resolve(filename), StandardCopyOption.REPLACE_EXISTING)
      }
    }
  }

  /**
    * download a file and parse it to string
    * @author Vlad Sokyrskyy Benjamin Manns
    * @param urlname URL where file is located
    * @param jwt_token Authorization token
    * @return The string provided in the file
    */
  private def downloadFileToString(urlname: String, jwt_token: String): String = {
    var s: String = ""
    val timeout = 1000
    val url = new java.net.URL(urlname)

    val connection = url.openConnection().asInstanceOf[HttpURLConnection]
    connection.setRequestProperty("Authorization", "Bearer: " + jwt_token)
    connection.setConnectTimeout(timeout)
    connection.setReadTimeout(timeout)
    connection.setRequestProperty("Connection", "close")
    connection.connect()

    if(connection.getResponseCode >= 400){
      logger.error(LABEL_ERROR_DOWNLOAD)
    }
    else {
      val in: InputStream = connection.getInputStream
      val br: BufferedReader = new BufferedReader(new InputStreamReader(in))
      s = Iterator.continually(br.readLine()).takeWhile(_ != null).mkString("\n")
    }
    s
  }
}
