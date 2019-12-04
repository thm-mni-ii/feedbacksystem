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
import java.lang.System.Logger
import java.lang.module.Configuration
import java.util.NoSuchElementException
import java.net.{HttpURLConnection, URL, URLDecoder}
import java.nio.charset.StandardCharsets
import java.nio.file._
import java.security.cert.X509Certificate
import java.util.zip.{ZipEntry, ZipInputStream}

import javax.net.ssl._
import JsonHelper._
import com.typesafe.config.{Config, ConfigFactory}
import de.thm.ii.submissioncheck.checker.{BashExec, GitCheckExec, HelloworldCheckExec, NodeCheckExec, PlagiatCheckExec}

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
  /** provides a Label for data*/
  final val DATA = "data"

  private val LABEL_AUTHORIZATION = "Authorization"
  private val LABEL_BEARER = "Bearer: "
  private val LABEL_CONNECTION = "Connection"
  private val LABEL_CLOSE = "close"
  /** JSON Config isinfo label*/
  val LABEL_ISINFO = "isinfo"
  /** provides a Label for jwt_token*/
  val LABEL_TOKEN = "jwt_token"
  private val LABEL_CHECK_REQUEST = "_check_request"
  private val LABEL_CHECK_ANSWER = "_check_answer"
  private val LABEL_TASK_REQUEST = "_new_task_request"
  private val LABEL_TASK_ANSWER = "_new_task_answer"

  private val LABEL_ONLY_TEST_TASK_SUBMISSION_ID = "-2"
  private val LABEL_ONLY_TEST_TASK_DATA = "empty data"

  /** 1 = Execute a user submission */
  val BASH_EXEC_MODE_CHECK = 1
  /** 2 = calculates a info message*/
  val BASH_EXEC_MODE_INFO = 2
  /** 3 = test a submitted task*/
  val BASH_EXEC_MODE_TASK = 3

// +++++++++++++++++++++++++++++++++++++++++++
//               Kafka Settings
// +++++++++++++++++++++++++++++++++++++++++++

  private val SYSTEMIDTOPIC = "secrettokenchecker"
  private val CHECK_REQUEST_TOPIC = SYSTEMIDTOPIC + LABEL_CHECK_REQUEST
  private val CHECK_ANSWER_TOPIC = SYSTEMIDTOPIC + LABEL_CHECK_ANSWER
  private val TASK_REQUEST_TOPIC = SYSTEMIDTOPIC + LABEL_TASK_REQUEST
  private val TASK_ANSWER_TOPIC = SYSTEMIDTOPIC + LABEL_TASK_ANSWER

  // We accept also "plagiarismchecker"
  private val PLAGIARISM_SYSTEMIDTOPIC = "plagiarismchecker"
  private val PLAGIARISM_CHECK_REQUEST_TOPIC = PLAGIARISM_SYSTEMIDTOPIC + LABEL_CHECK_REQUEST
  private val PLAGIARISM_CHECK_ANSWER_TOPIC = PLAGIARISM_SYSTEMIDTOPIC + "_answer"

  private val PLAGIARISM_SCRIPT_REQUEST_TOPIC = PLAGIARISM_SYSTEMIDTOPIC + "_script_request"
  /** label for PLAGIARISM_SCRIPT_ANSWER_TOPIC */
  val PLAGIARISM_SCRIPT_ANSWER_TOPIC = PLAGIARISM_SYSTEMIDTOPIC + "_script_answer"

  // We accept also "gitchecker"
  private val GIT_SYSTEMIDTOPIC = "gitchecker"
  private val GIT_CHECK_REQUEST_TOPIC = GIT_SYSTEMIDTOPIC + LABEL_CHECK_REQUEST
  private val GIT_TASK_REQUEST_TOPIC = GIT_SYSTEMIDTOPIC + LABEL_TASK_REQUEST

  /** provides a Label for gitchecker_answer*/
  val GIT_CHECK_ANSWER_TOPIC = GIT_SYSTEMIDTOPIC + LABEL_CHECK_ANSWER
  /** provides a Label for task answer of gitchecker*/
  val GIT_TASK_ANSWER_TOPIC = GIT_SYSTEMIDTOPIC + LABEL_TASK_ANSWER

  private val __slash = "/"

  private val appConfig = ConfigFactory.parseFile(new File(loadFactoryConfigPath()))
  private val config = ConfigFactory.load(appConfig)
  private implicit val system: ActorSystem = ActorSystem("akka-system", config)
  private implicit val materializer: Materializer = ActorMaterializer()
  private implicit val ec: ExecutionContextExecutor = system.dispatcher

  private val compile_production: Boolean = config.getBoolean("compiletype.production")

  /** used in naming */
  final val ULDIR = (if (compile_production) __slash else "") + "upload-dir/"
  /** label for Error download file */
  val LABEL_ERROR_DOWNLOAD = "Error when downloading file!"
  /** logger instance */
  val logger = system.log
  /** provides a Label for taskid*/
  val LABEL_TASKID = "taskid"
  /** provides a Label for use_extern*/
  val LABEL_USE_EXTERN = "use_extern"
  /** provides a Label for submissionid*/
  val LABEL_SUBMISSIONID = "submissionid"
  private val LABEL_COURSEID = "courseid"
  /** provide labl for accept */
  val LABEL_ACCEPT = "accept"
  /** provide labl for error */
  val LABEL_ERROR = "error"
  private val EXITING_MSG = "Exiting ..."

  private val producerSettings = ProducerSettings(system, new StringSerializer, new StringSerializer)
  private val consumerSettings = ConsumerSettings(system, new StringDeserializer, new StringDeserializer)
  /**  the hello world instance*/
  val helloworldCheckExec = new HelloworldCheckExec(compile_production)
  /**  the plagiat checker instance*/
  val plagiatCheckExec = new PlagiatCheckExec(compile_production)
  /**  the node check instance*/
  val nodeCheckExec = new NodeCheckExec(compile_production)

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

  private val control_plagiarismchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(plagiatCheckExec.checkerSubmissionRequestTopic))
    .toMat(Sink.foreach(plagiatCheckExec.submissionReceiver))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  private val control_plagiarismtaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(plagiatCheckExec.checkerTaskRequestTopic))
    .toMat(Sink.foreach(plagiatCheckExec.taskReceiver))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  // Listen on git
  private val control_gitchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(GIT_CHECK_REQUEST_TOPIC))
    .toMat(Sink.foreach(onGitReceived))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  private val control_gittaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(GIT_TASK_REQUEST_TOPIC))
    .toMat(Sink.foreach(onGitTaskReceived))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  // Listen on nodechecker
  private val control_nodechecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(nodeCheckExec.checkerSubmissionRequestTopic))
    .toMat(Sink.foreach(nodeCheckExec.submissionReceiver))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  private val control_nodetaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(nodeCheckExec.checkerTaskRequestTopic))
    .toMat(Sink.foreach(nodeCheckExec.taskReceiver))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  private val control_helloworldchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(helloworldCheckExec.checkerSubmissionRequestTopic))
    .toMat(Sink.foreach(helloworldCheckExec.submissionReceiver))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  private val control_helloworldtaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(helloworldCheckExec.checkerTaskRequestTopic))
    .toMat(Sink.foreach(helloworldCheckExec.taskReceiver))(Keep.both)
    .mapMaterializedValue(DrainingControl.apply)
    .run()

  // Correctly handle Ctrl+C and docker container stop
  sys.addShutdownHook({
    control_submission.shutdown().onComplete {
        case Success(_) => logger.info(EXITING_MSG)
        case Failure(err) => logger.warning(err.getMessage)
      }
    control_task.shutdown().onComplete {
        case Success(_) => logger.info(EXITING_MSG)
        case Failure(err) => logger.warning(err.getMessage)
      }
    control_plagiarismchecker.shutdown().onComplete {
      case Success(_) => logger.info(EXITING_MSG)
      case Failure(err) => logger.warning(err.getMessage)
    }
    control_plagiarismchecker.shutdown().onComplete {
      case Success(_) => logger.info(EXITING_MSG)
      case Failure(err) => logger.warning(err.getMessage)
    }
    control_plagiarismtaskchecker.shutdown().onComplete {
      case Success(_) => logger.info(EXITING_MSG)
      case Failure(err) => logger.warning(err.getMessage)
    }
    control_gitchecker.shutdown().onComplete {
      case Success(_) => logger.info(EXITING_MSG)
      case Failure(err) => logger.warning(err.getMessage)
    }
    control_gittaskchecker.shutdown().onComplete {
      case Success(_) => logger.info(EXITING_MSG)
      case Failure(err) => logger.warning(err.getMessage)
    }
  })

  /**
    * sends a kafka Message
    *
    * @param record kafka record
    * @return Done object
    */
  def sendMessage(record: ProducerRecord[String, String]): Future[Done] =
    akka.stream.scaladsl.Source.single(record).runWith(Producer.plainSink(producerSettings))

  private def sendCheckMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](CHECK_ANSWER_TOPIC, message))

  private def sendTaskMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](TASK_ANSWER_TOPIC, message))

  private def sendPlagiarismCheckMessage(message: String): Future[Done] =
    sendMessage(new ProducerRecord[String, String](PLAGIARISM_CHECK_ANSWER_TOPIC, message))

  // +++++++++++++++++++++++++++++++++++++++++
  //                Network Settings
  // +++++++++++++++++++++++++++++++++++++++++
  private val sslContext = SSLContext.getInstance("SSL")
  sslContext.init(null, Array(TrustAll), new java.security.SecureRandom())
  HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory)
  HttpsURLConnection.setDefaultHostnameVerifier(VerifiesAllHostNames)

  private def loadFactoryConfigPath() = {
    val dev_config_file_path = System.getenv("CONFDIR") + "/../docker-config/secrettoken/application_dev.conf"
    val prod_config_file_path = "/usr/local/appconfig/application.config"

    var config_factory_path = ""
    if (Files.exists(Paths.get(prod_config_file_path))) {
      config_factory_path = prod_config_file_path
    } else {
      config_factory_path = dev_config_file_path
    }
    config_factory_path
  }

  private def onGitReceived(record: ConsumerRecord[String, String]): Unit = {
    try {
      logger.warning("GIT Checker Received Message")
      val jsonMap: Map[String, Any] = record.value()
      GitCheckExec.onGitReceived(jsonMap)
    } catch {
      case e: Exception => {
        logger.warning("GITCHECKER Exception: " + e.getMessage)
      }
    }
  }

  private def onGitTaskReceived(record: ConsumerRecord[String, String]): Unit = {
    val jsonMap: Map[String, Any] = record.value()
    GitCheckExec.onTaskGitReceived(jsonMap)
  }

  private def onSubmissionReceived(record: ConsumerRecord[String, String]): Unit = {
    // Hack by https://stackoverflow.com/a/29914564/5885054
    logger.warning("Submission Received")
    val jsonMap: Map[String, Any] = record.value()
    try {
      val username: String = jsonMap("username").asInstanceOf[String]
      val submit_type: String = jsonMap("submit_typ").asInstanceOf[String]
      val submissionid: String = jsonMap(LABEL_SUBMISSIONID).asInstanceOf[String]
      val taskid: String = jsonMap(LABEL_TASKID).asInstanceOf[String]
      val use_extern: Boolean = jsonMap(LABEL_USE_EXTERN).asInstanceOf[Boolean]
      var submittedFilePath: String = ""
      if (use_extern) {
        val path = Paths.get(ULDIR).resolve(taskid).resolve(submissionid).resolve("submission.txt")
        submittedFilePath = path.toAbsolutePath.toString

      } else if (submit_type.equals("file")) {
          val url: String = jsonMap("fileurl").asInstanceOf[String]
          val jwt_token: String = jsonMap(LABEL_TOKEN).asInstanceOf[String]

          submittedFilePath = downloadSubmittedFileToFS(url, jwt_token, taskid, submissionid).toAbsolutePath.toString
          logger.info(submittedFilePath)
        }
        else if (submit_type.equals(DATA)) {
          submittedFilePath = saveStringToFile(jsonMap(DATA).asInstanceOf[String], taskid, submissionid).toAbsolutePath.toString
        }

      var passed: Int = 0;
      val isInfo = if (jsonMap.contains(LABEL_ISINFO)) jsonMap(LABEL_ISINFO).asInstanceOf[Boolean] else false
      val exeMode = if (isInfo) BASH_EXEC_MODE_INFO else BASH_EXEC_MODE_CHECK

      val (output, code) = bashTest(taskid, username, submittedFilePath, exeMode)
      if (code == 0) passed = 1
      var answerMap: Map[String, Any] = Map(DATA -> output, "passed" -> passed.toString, "exitcode" -> code.toString, "username" -> username,
        LABEL_TASKID -> taskid, LABEL_SUBMISSIONID -> submissionid)
      if (isInfo) answerMap += (LABEL_ISINFO -> true)
      sendCheckMessage(JsonHelper.mapToJsonStr(answerMap))
    } catch {
      case e: NoSuchElementException => {
        sendCheckMessage(JsonHelper.mapToJsonStr(Map(
          "Error" -> "Please provide valid parameters"
        )))
      }
      case e: Exception => {
        logger.warning(e.getMessage)
      }
    }
  }

  /**
    * Deletes a dir recursively deleting anything inside it.
    *
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
    try {
      logger.warning("task received")
      val sslContext = SSLContext.getInstance("SSL")
      sslContext.init(null, Array(TrustAll), new java.security.SecureRandom())
      HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory)
      HttpsURLConnection.setDefaultHostnameVerifier(VerifiesAllHostNames)

      // Here we send multiple files!!
      val urls: List[String] = jsonMap("testfile_urls").asInstanceOf[List[String]]
      val taskid: String = jsonMap(LABEL_TASKID).asInstanceOf[String]
      val jwt_token: String = jsonMap(LABEL_TOKEN).asInstanceOf[String]
      if (urls.length != 1 && urls.length != 2) {
        sendTaskMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
          "Please provide one or two files (testfile and scriptfile)", LABEL_TASKID -> taskid)))
      } else {
        //deleteDirectory(new File(Paths.get(ULDIR).resolve(taskid).toString))
        val sendedFileNames = downloadFilesToFS(urls, jwt_token, taskid)

        // validation if sent files are useful
        if (sendedFileNames.length == 1 && !sendedFileNames.contains("scriptfile")) {
          sendTaskMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR -> "Provided file should call 'scriptfile'", LABEL_TASKID -> taskid)))
        }
        else if (sendedFileNames.length == 2 && (!sendedFileNames.contains("scriptfile") || !sendedFileNames.contains("testfile"))) {
          sendTaskMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
            "Provided files should call 'scriptfile' and 'testfile'", LABEL_TASKID -> taskid)))
        } else {
          // Need to execute files to see if there are syntax errors
          val submittedFilePath = saveStringToFile(LABEL_ONLY_TEST_TASK_DATA, taskid, LABEL_ONLY_TEST_TASK_SUBMISSION_ID).toAbsolutePath.toString
          val (output, code) = bashTest(taskid, "secrettokenchecker_testname", submittedFilePath, BASH_EXEC_MODE_TASK)
          sendTaskMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> (code == 0), LABEL_ERROR -> output, LABEL_TASKID -> taskid)))
        }
      }
    } catch {
      case e: NoSuchElementException => {
        sendTaskMessage(JsonHelper.mapToJsonStr(Map(
          LABEL_ERROR -> "Please provide valid parameters",
          "accept" -> false,
          LABEL_TASKID -> ""
        )))
      }
      case e: Exception => logger.warning(s"${e.getClass.toString} with message: ${e.getMessage}")
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
    * @param executionMode 1 = Execute a user submission, 2 = calculates a info message, 3 = test a submitted task
    * @return message and exitcode
    */
  def bashTest(taskid: String, name: String, filePath: String, executionMode: Int): (String, Int) = {
    val bashtest1 = new BashExec(taskid, name, filePath, compile_production, executionMode)
    val exit1 = bashtest1.exec()
    val message1 = bashtest1.output

    (message1, exit1)
  }

  /**
    * simply convert data submissions to a file and return its path
    * @param content submitted data
    * @param taskid corresponding taskid
    * @param submissionid corresponding submissionid
    * @return path of created file
    */
  def saveStringToFile(content: String, taskid: String, submissionid: String): Path = {
    new File(Paths.get(ULDIR).resolve(taskid).resolve(submissionid).toString).mkdirs()
    val path = Paths.get(ULDIR).resolve(taskid).resolve(submissionid).resolve(submissionid)
    Files.write(path, content.getBytes(StandardCharsets.UTF_8))
    path
  }

  /**
    * prepare a download connection instance
    * @author Benjamin Manns
    * @param download_url the url where to download from
    * @param authorization jwt token
    * @return connection instance
    */
  def download(download_url: String, authorization: String): HttpURLConnection = {
    val timeout = 1000
    val url = new java.net.URL(download_url)
    val connection = url.openConnection().asInstanceOf[HttpURLConnection]
    connection.setRequestProperty(LABEL_AUTHORIZATION, LABEL_BEARER + authorization)
    connection.setConnectTimeout(timeout)
    connection.setReadTimeout(timeout)
    connection.setRequestProperty(LABEL_CONNECTION, LABEL_CLOSE)
    connection.connect()
    connection
  }

  /**
    * download a file from WS
    * @param link url / link where to download from
    * @param jwt_token JSON Web Token which protects given url
    * @param taskid submitted task id
    * @param submissionid submitted submission id
    * @return downloaded file
    */
  def downloadSubmittedFileToFS(link: String, jwt_token: String, taskid: String, submissionid: String): Path = {
    val connection = download(link, jwt_token)
    val filename = submissionid
    if (connection.getResponseCode >= 400) {
      logger.error(LABEL_ERROR_DOWNLOAD)
    }
    else {
      new File(Paths.get(ULDIR).resolve(taskid).resolve(submissionid).toString).mkdirs()
      Files.copy(connection.getInputStream, Paths.get(ULDIR).resolve(taskid).resolve(submissionid).resolve(filename), StandardCopyOption.REPLACE_EXISTING)
    }
    Paths.get(ULDIR).resolve(taskid).resolve(filename).resolve(filename)
  }

  /**
    *
    * Download a from Feedbacksystem
    * @param urlnames url
    * @param jwt_token JSON Web Token
    * @param taskid id of task
    * @param subpath optional sub path prefix
    * @return list of downloaded file names
    */
  def downloadFilesToFS(urlnames: List[String], jwt_token: String, taskid: String, subpath: String = ""): List[String] = {
    var downloadFileNames: List[String] = List()
    val timeout = 1000
    for (urlname <- urlnames) {
      val url = new java.net.URL(urlname)
      val urlParts = urlname.split(__slash)
      // syntax of testfile url allows us to get filename
      val filename = URLDecoder.decode(urlParts(urlParts.length - 1), StandardCharsets.UTF_8.toString)
      downloadFileNames = downloadFileNames ++ List(filename)
      val connection = url.openConnection().asInstanceOf[HttpURLConnection]
      connection.setRequestProperty(LABEL_AUTHORIZATION, LABEL_BEARER + jwt_token)
      connection.setConnectTimeout(timeout)
      connection.setReadTimeout(timeout)
      connection.setRequestProperty(LABEL_CONNECTION, LABEL_CLOSE)
      connection.connect()

      if (connection.getResponseCode >= 400) {
        logger.error(LABEL_ERROR_DOWNLOAD)
      }
      else {
        new File(Paths.get(ULDIR).resolve(subpath).resolve(taskid).toString).mkdirs()
        Files.copy(connection.getInputStream, Paths.get(ULDIR).resolve(subpath).resolve(taskid).resolve(filename), StandardCopyOption.REPLACE_EXISTING)
      }
    }
    downloadFileNames
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

    if (connection.getResponseCode >= 400) {
      logger.error(LABEL_ERROR_DOWNLOAD)
    }
    else {
      val in: InputStream = connection.getInputStream
      val br: BufferedReader = new BufferedReader(new InputStreamReader(in))
      s = Iterator.continually(br.readLine()).takeWhile(_ != null).mkString("\n")
    }
    s
  }

  /**
    * copied from https://stackoverflow.com/a/30642526
    * It is more a JAVA way
    *
    * @param zipFile      downloaded zip path
    * @param outputFolder where to extract
    */
  def unZipCourseSubmission(zipFile: String, outputFolder: String): Unit = {
    val one_K_size = 1024
    val fis = new FileInputStream(zipFile)
    val zis = new ZipInputStream(fis)
    Stream.continually(zis.getNextEntry).takeWhile(_ != null).foreach { file =>
      val fullFilePath = outputFolder + file.getName
      val parentFolder = Paths.get(fullFilePath).getParent.toAbsolutePath

      //output directory
      try {
        Files.createDirectories(parentFolder)
      }
      catch {
        case _: FileAlreadyExistsException => {}
      }
      val fout = new FileOutputStream(fullFilePath)
      val buffer = new Array[Byte](one_K_size)
      Stream.continually(zis.read(buffer)).takeWhile(_ != -1).foreach(fout.write(buffer, 0, _))
    }
  }
}
