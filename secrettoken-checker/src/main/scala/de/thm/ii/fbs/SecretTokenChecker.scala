package de.thm.ii.fbs

import akka.Done
import akka.actor.ActorSystem
import akka.kafka.{ConsumerSettings, ProducerSettings, Subscriptions}
import akka.stream.{ActorMaterializer, Materializer}
import akka.kafka.scaladsl.{Consumer, Producer}
import org.apache.kafka.clients.producer.ProducerRecord
import org.apache.kafka.common.serialization.{StringDeserializer, StringSerializer}

import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.util.{Failure, Success, Try}
import java.io._
import java.net.{HttpURLConnection, URLDecoder}
import java.nio.charset.StandardCharsets
import java.nio.file._
import java.security.cert.X509Certificate
import java.util.zip.ZipInputStream

import javax.net.ssl._
import com.typesafe.config.ConfigFactory
import de.thm.ii.fbs.checker.{GitCheckExec, GitstatsCheckExec, HelloworldCheckExec, MultiplechoiceCheckExec,
  NodeCheckExec, PlagiatCheckExec, SecrettokenCheckExec}

import scala.io.Source

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

  /** 1 = Execute a user submission */
  val BASH_EXEC_MODE_CHECK = 1
  /** 2 = calculates a info message*/
  val BASH_EXEC_MODE_INFO = 2
  /** 3 = test a submitted task*/
  val BASH_EXEC_MODE_TASK = 3

// +++++++++++++++++++++++++++++++++++++++++++
//               Kafka Settings
// +++++++++++++++++++++++++++++++++++++++++++

  private val PLAGIARISM_SYSTEMIDTOPIC = "plagiarismchecker"
  /** label for PLAGIARISM_SCRIPT_ANSWER_TOPIC */
  val PLAGIARISM_SCRIPT_ANSWER_TOPIC = PLAGIARISM_SYSTEMIDTOPIC + "_script_answer"

  private val __slash = "/"

  private val appConfig = ConfigFactory.parseResources("application.conf")
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
  /** Connection to Multiplechoice Checker  */
  val multiplechoiceCheckExec = new MultiplechoiceCheckExec(compile_production)
  /**  the secrettoken check instance*/
  val secrettokenCheckExec = new SecrettokenCheckExec(compile_production)
  /**  the secrettoken check instance*/
  val gitCheckExec = new GitCheckExec(compile_production)
  /**  the gitstats check instance*/
  val gitstatsCheckExec = new GitstatsCheckExec(compile_production)

  private val control_submission = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(secrettokenCheckExec.checkerSubmissionRequestTopic))
    .runForeach(secrettokenCheckExec.submissionReceiver)

  private val control_task = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(secrettokenCheckExec.checkerTaskRequestTopic))
    .runForeach(secrettokenCheckExec.taskReceiver)

  private val control_plagiarismchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(plagiatCheckExec.checkerSubmissionRequestTopic))
    .runForeach(plagiatCheckExec.submissionReceiver)

  private val control_plagiarismtaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(plagiatCheckExec.checkerTaskRequestTopic))
    .runForeach(plagiatCheckExec.taskReceiver)

  // Listen on git
  private val control_gitchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(gitCheckExec.checkerSubmissionRequestTopic))
    .runForeach(gitCheckExec.submissionReceiver)

  private val control_gittaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(gitCheckExec.checkerTaskRequestTopic))
    .runForeach(gitCheckExec.taskReceiver)

  // Listen on nodechecker
  private val control_nodechecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(nodeCheckExec.checkerSubmissionRequestTopic))
    .runForeach(nodeCheckExec.submissionReceiver)

  private val control_nodetaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(nodeCheckExec.checkerTaskRequestTopic))
    .runForeach(nodeCheckExec.taskReceiver)

  private val control_helloworldchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(helloworldCheckExec.checkerSubmissionRequestTopic))
    .runForeach(helloworldCheckExec.submissionReceiver)

  private val control_helloworldtaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(helloworldCheckExec.checkerTaskRequestTopic))
    .runForeach(helloworldCheckExec.taskReceiver)

  private val control_multiplechoicechecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(multiplechoiceCheckExec.checkerSubmissionRequestTopic))
    .runForeach(multiplechoiceCheckExec.submissionReceiver)

  private val control_multiplechoicetaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(multiplechoiceCheckExec.checkerTaskRequestTopic))
    .runForeach(multiplechoiceCheckExec.taskReceiver)

  private val control_gitstatschecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(gitstatsCheckExec.checkerSubmissionRequestTopic))
    .runForeach(gitstatsCheckExec.submissionReceiver)

  private val control_gitstatstaskchecker = Consumer
    .plainSource(consumerSettings, Subscriptions.topics(gitstatsCheckExec.checkerTaskRequestTopic))
    .runForeach(gitstatsCheckExec.taskReceiver)

  // Correctly handle Ctrl+C and docker container stop
  control_submission.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_task.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_plagiarismchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_plagiarismchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_plagiarismtaskchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_gitchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_gittaskchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_multiplechoicechecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_multiplechoicetaskchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_nodechecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_nodetaskchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_helloworldchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_helloworldtaskchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_gitstatschecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  control_gitstatstaskchecker.onComplete {
    case Success(_) => logger.info(EXITING_MSG)
    case Failure(err) => logger.warning(err.getMessage)
  }
  sys.addShutdownHook({
    logger.info("Checker is shutting down!")
  })

  /**
    * sends a kafka Message
    *
    * @param record kafka record
    * @return Done object
    */
  def sendMessage(record: ProducerRecord[String, String]): Future[Done] =
    akka.stream.scaladsl.Source.single(record).runWith(Producer.plainSink(producerSettings))

  // +++++++++++++++++++++++++++++++++++++++++
  //                Network Settings
  // +++++++++++++++++++++++++++++++++++++++++
  private val sslContext = SSLContext.getInstance("SSL")
  sslContext.init(null, Array(TrustAll), new java.security.SecureRandom())
  HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory)
  HttpsURLConnection.setDefaultHostnameVerifier(VerifiesAllHostNames)

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
    LazyList.continually(zis.getNextEntry).takeWhile(_ != null).foreach { file =>
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
      LazyList.continually(zis.read(buffer)).takeWhile(_ != -1).foreach(fout.write(buffer, 0, _))
    }
  }
}
