package de.thm.ii.submissioncheck.checker

import java.io.{BufferedReader, File, FileInputStream, FileOutputStream, InputStream, InputStreamReader}
import java.net.HttpURLConnection
import java.nio.file.{FileAlreadyExistsException, Files, Path, Paths}
import java.util.zip.ZipInputStream

import akka.Done
import de.thm.ii.submissioncheck.{JsonHelper, SecretTokenChecker}
import de.thm.ii.submissioncheck.SecretTokenChecker.{DATA, LABEL_ACCEPT, LABEL_ERROR, LABEL_ISINFO, LABEL_SUBMISSIONID, LABEL_TASKID, LABEL_TOKEN,
  LABEL_USE_EXTERN, ULDIR, compile_production, downloadSubmittedFileToFS, logger, saveStringToFile, sendMessage}
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.slf4j.LoggerFactory
import org.apache.kafka.clients.producer.ProducerRecord

import scala.concurrent.Future
/** Excpetion wrapper for Base Checker purpose
  *
  * @param message an exception message
  */
class CheckerException(message: String) extends RuntimeException(message)

/**
  * Base Checker Class to easily write a checker which workes smooth with the feedbacksystem
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class BaseChecker(val compile_production: Boolean) {
  /** the unique identification of a checker, will extended to "basechecker" */
  val checkername = "base"
  private val LABEL_PASSED = "passed"
  private val LABEL_EXITCODE = "exitcode"

  /** LABEL -v*/
  val __option_v = "-v"
  /** LABEL "/" */
  val __slash = "/"
    /** LABEL : */
  val __colon = ":"

  /** define which configuration files the checker need - to be overwritten */
  val configFiles: List[String] = List()
  /** define allowed submission types - to be overwritten */
  val allowedSubmissionTypes: List[String] = List("data", "file", "extern")
  /** define which external file is needed - to be overwritten */
  val externSubmissionFilename = "submission.txt"

  /**
    * kafka topic submission request
    * @return string kafka topic
    */
  def checkerSubmissionRequestTopic: String = checkername + "checker_check_request"

  /**
    * kafka topic submission answer
    * @return string kafka topic
    */
  def checkerSubAnswerTopic: String = checkername + "checker_check_answer"

  /**
    * kafka topic task request
    * @return string kafka topic
    */
  def checkerTaskRequestTopic: String = checkername + "checker_new_task_request"

  /**
    * kafka topic task answer
    * @return string kafka topic
    */
  def checkerTaskAnswerTopic: String = checkername + "checker_new_task_answer"

  private def sendCheckerTaskAnswer(message: String): Future[Done] = {
    logger.warning(message)
    sendMessage(new ProducerRecord[String, String](checkerTaskAnswerTopic, message))
  }

  private def sendCheckerTaskExceptionAnswer(exception: String, taskid: Option[Int]): Future[Done] = {
    if (taskid.isDefined) {
      sendCheckerTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR -> exception, LABEL_TASKID -> taskid.get.toString)))
    } else {
      sendCheckerTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR -> exception)))
    }
  }

  private def sendCheckerTaskAcceptAnswer(taskid: Int): Future[Done] = {
      sendCheckerTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> true, LABEL_ERROR -> "", LABEL_TASKID -> taskid.toString)))
  }

  private def sendCheckerSubmissionAnswer(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](checkerSubAnswerTopic, message))

  private def sendCheckerExceptionAnswer(exception: String, taskid: Option[Int], submissionid: Option[Int]): Future[Done] = {
    val zero = "0"
    if (taskid.isDefined && submissionid.isDefined) {
      sendCheckerSubmissionAnswer(JsonHelper.mapToJsonStr(Map(
        LABEL_PASSED -> zero,
        LABEL_EXITCODE -> "42",
        LABEL_TASKID -> taskid.get.toString,
        LABEL_SUBMISSIONID -> submissionid.get.toString,
        DATA -> exception
      )))
    } else {
      sendCheckerSubmissionAnswer(JsonHelper.mapToJsonStr(Map(
        LABEL_PASSED -> zero,
        LABEL_EXITCODE -> "42",
        DATA -> exception
      )))
    }
  }

  /**
    * load the full congig path of checker
    * @param taskid the requested taskid
    * @return base path and config path
    */
  def loadCheckerConfig(taskid: String): (Path, List[Path]) = {
    logger.warning(s"Load ${checkername} Checker Config")
    val baseFilePath = Paths.get(ULDIR).resolve(taskid)
    val configfiles = configFiles.map(f => baseFilePath.resolve(f))
    (baseFilePath, configfiles)
  }

  /**
    * perform a check of request, will be executed after processing the kafka message
    * @param taskid submissions task id
    * @param submissionid submitted submission id
    * @param submittedFilePath path of submitted file (if zip or something, it is also a "file"
    * @param isInfo execute info procedure for given task
    * @param use_extern include an existing file, from previous checks
    * @param jsonMap complete submission payload
    * @return check succeeded, output string, exitcode
    */
  def exec(taskid: String, submissionid: String, submittedFilePath: String, isInfo: Boolean, use_extern: Boolean, jsonMap: Map[String, Any]):
  (Boolean, String, Int) = {
    (false, "output", 42)
  }

  /**
    * on kafka new task message receive
    * @param record a kafka message
    */
  def taskReceiver(record: ConsumerRecord[String, String]): Unit = {
    logger.warning(s"${checkername} Checker Received Message")
    val jsonMap: Map[String, Any] = JsonHelper.jsonStrToMap(record.value())
    onCheckerTaskReceived(jsonMap)
  }

  /**
    * on kafka new submission message receive
    * @param record a kafka message
    */
  def submissionReceiver(record: ConsumerRecord[String, String]): Unit = {
    logger.warning(s"${checkername} Checker Received Task Message")
    val jsonMap: Map[String, Any] = JsonHelper.jsonStrToMap(record.value())
    onCheckSubmissionReceived(jsonMap)
  }

  private def onCheckerTaskReceived(jsonMap: Map[String, Any]): Unit = {
    try {
      logger.warning(s"${checkername} Task received")
      val urls: List[String] = jsonMap("testfile_urls").asInstanceOf[List[String]]
      val taskid: String = jsonMap(LABEL_TASKID).asInstanceOf[String]
      val jwt_token: String = jsonMap(LABEL_TOKEN).asInstanceOf[String]
      onCheckerTaskReceivedHandler(Integer.parseInt(taskid), urls, jwt_token)
    } catch {
      case e: Exception => sendCheckerTaskExceptionAnswer(e.getMessage, None)
    }
  }

  private def onCheckerTaskReceivedHandler(task_id: Int, fileurls: List[String], jwt_token: String) = {
    try {
      logger.warning(s"${checkername} Task Receiver")
      if (fileurls.length != configFiles.length) {
        throw new CheckerException(s"${checkername} Checker does only accept one config file")
      }
      val sentFileNames = SecretTokenChecker.downloadFilesToFS(fileurls, jwt_token, task_id.toString)
      for(configfile <- configFiles) {
        if (!sentFileNames.contains(configfile)) throw new CheckerException(s"${checkername} Checker need '${configfile}' configfile")
      }
      taskReceiveExtendedCheck(task_id, sentFileNames)
      sendCheckerTaskAcceptAnswer(task_id)
    } catch {
      case e: Exception => sendCheckerTaskExceptionAnswer(e.getMessage, Some(task_id))
    }
  }

  /**
    * create a connection with authorization and by method
    * @author Benjamin Manns
    * @param download_url the url where to download from
    * @param authorization jwt token
    * @param method the request method
    * @return HTTP Code, Response, parsed JSON
    */
  def apiCall(download_url: String, authorization: String, method: String): (Int, String, Any) = {
    try {
      val LABEL_AUTHORIZATION = "Authorization"

    val LABEL_BEARER = "Bearer: "

    val timeout = 1000
    val url = new java.net.URL(download_url)
    val connection = url.openConnection().asInstanceOf[HttpURLConnection]
    connection.setRequestProperty(LABEL_AUTHORIZATION, LABEL_BEARER + authorization)
    connection.setConnectTimeout(timeout)
    connection.setReadTimeout(timeout)
    connection.setRequestMethod(method)
    connection.setRequestProperty("Connection", "close")
    connection.connect()
    val in: InputStream = connection.getInputStream
    val br: BufferedReader = new BufferedReader(new InputStreamReader(in))
    val s = Iterator.continually(br.readLine()).takeWhile(_ != null).mkString("\n")
    (connection.getResponseCode, s, JsonHelper.jsonStrToAny(s))
    } catch {
      case e: Exception => (400, e.toString, Map())
    }
  }

  /**
    * handle incoming submissions
    * @param jsonMap a kafka record
    */
  def onCheckSubmissionReceived(jsonMap: Map[String, Any]): Unit = {
    var task_id: Any = null
    var submission_id: Any = null
    try {
      logger.warning(s"${checkername} Submission Received")
      task_id = jsonMap(LABEL_TASKID)
      submission_id = jsonMap(LABEL_SUBMISSIONID).asInstanceOf[String]
      val use_extern: Boolean = jsonMap(LABEL_USE_EXTERN).asInstanceOf[Boolean]
      val submit_type: String = jsonMap("submit_typ").asInstanceOf[String]
      val isInfo = if (jsonMap.contains(LABEL_ISINFO)) jsonMap(LABEL_ISINFO).asInstanceOf[Boolean] else false
      var submittedFilePath: String = ""
      if (use_extern && !allowedSubmissionTypes.contains("extern")) throw new CheckerException(s"${checkername} Checker does not allow extern check")
      if (!allowedSubmissionTypes.contains(submit_type)) throw new CheckerException(s"${checkername} Checker does not allow ${submit_type} submission type")

      if (use_extern) {
        val path = Paths.get(ULDIR).resolve(task_id.toString).resolve(submission_id.toString).resolve(externSubmissionFilename)
        submittedFilePath = path.toAbsolutePath.toString

      } else if (submit_type.equals("file")) {
        val url: String = jsonMap("fileurl").asInstanceOf[String]
        val jwt_token: String = jsonMap(LABEL_TOKEN).asInstanceOf[String]

        submittedFilePath = downloadSubmittedFileToFS(url, jwt_token, task_id.toString, submission_id.toString).toAbsolutePath.toString
        logger.warning(submittedFilePath)
      }
      else if (submit_type.equals(DATA)) {
        submittedFilePath = saveStringToFile(jsonMap(DATA).asInstanceOf[String], task_id.toString, submission_id.toString).toAbsolutePath.toString
      }

      val (success, output, exitcode) = exec(task_id.toString, submission_id.toString, submittedFilePath, isInfo, use_extern, jsonMap)

      sendCheckerSubmissionAnswer(JsonHelper.mapToJsonStr(Map(
        LABEL_PASSED -> (if (success) "1" else "0"),
        LABEL_EXITCODE ->  exitcode.toString,
        LABEL_TASKID -> task_id.toString,
        LABEL_SUBMISSIONID -> submission_id.toString,
        DATA -> output
      )))
    } catch {
      case e: Exception => {
        val (taskSome, subSome) = if (task_id != null && submission_id != null) {
          (Some(task_id.toString.toInt), Some(submission_id.toString.toInt))
        } else {
          (None, None)
        }
        sendCheckerExceptionAnswer(e.getMessage + " " + e.getStackTrace.mkString("\n"), taskSome, subSome)
      }
    }
  }

  /**
    * perform some extra checks on task receive if needed, exceptions will be catched in callee
    * @param taskid submitted task id
    * @param sentFileNames list of sent files
    */
  def taskReceiveExtendedCheck(taskid: Int, sentFileNames: List[String]): Unit = {}

  /**
    * Delets a dir recursively deleting anything inside it.
    * @author https://stackoverflow.com/users/306602/naikus by https://stackoverflow.com/a/3775864/5885054
    * @param dir The dir to delete
    * @return true if the dir was successfully deleted
    */
  def deleteDirectory(dir: File): Boolean = {
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

  /** a bit based on https://stackoverflow.com/a/30642526
    * It is more a JAVA way
    *
    * @param zipFile      downloaded zip path
    * @param outputFolder where to extract
    */
  def unzip(zipFile: String, outputFolder: Path): Unit = {
    val one_K_size = 1024
    val fis = new FileInputStream(zipFile)
    val zis = new ZipInputStream(fis)
    Stream.continually(zis.getNextEntry).takeWhile(_ != null).foreach { file =>
      val fullFilePath = outputFolder.resolve(file.getName)
      if (file.isDirectory) {
        try {
          Files.createDirectories(fullFilePath)
        }
        catch {
          case e: FileAlreadyExistsException => { }
        }
      } else {
        val fout = new FileOutputStream(fullFilePath.toString)
        val buffer = new Array[Byte](one_K_size)
        Stream.continually(zis.read(buffer)).takeWhile(_ != -1).foreach(fout.write(buffer, 0, _))
      }
    }
  }
}
