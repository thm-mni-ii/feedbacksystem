package de.thm.ii.submissioncheck.checker

import java.nio.file.{Path, Paths}

import akka.Done
import de.thm.ii.submissioncheck.{JsonHelper, SecretTokenChecker}
import de.thm.ii.submissioncheck.SecretTokenChecker.{ULDIR, compile_production, logger}
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.slf4j.LoggerFactory
import de.thm.ii.submissioncheck.SecretTokenChecker.{logger, DATA, LABEL_ACCEPT, LABEL_ERROR, LABEL_ISINFO, LABEL_SUBMISSIONID,
  LABEL_TASKID, LABEL_TOKEN, LABEL_USE_EXTERN, ULDIR, downloadSubmittedFileToFS, saveStringToFile, sendMessage}
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
    * @return check succeeded, output string, exitcode
    */
  def exec(taskid: String, submissionid: String, submittedFilePath: String, isInfo: Boolean, use_extern: Boolean): (Boolean, String, Int) = {
    (false, "output", 42)
  }

  /**
    * on kafka new task message receive
    * @param record a kafka message
    */
  def taskReceiver(record: ConsumerRecord[String, String]): Unit = {
    logger.warning(s"${checkername}  Checker Received Message")
    val jsonMap: Map[String, Any] = JsonHelper.jsonStrToMap(record.value())
    onCheckerTaskReceived(jsonMap)
  }

  /**
    * on kafka new submission message receive
    * @param record a kafka message
    */
  def submissionReceiver(record: ConsumerRecord[String, String]): Unit = {
    logger.warning(s"${checkername}  Checker Received Task Message")
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
      val sendedFileNames = SecretTokenChecker.downloadFilesToFS(fileurls, jwt_token, task_id.toString)
      for(configfile <- configFiles) {
        if (!sendedFileNames.contains(configfile)) throw new CheckerException(s"${checkername} Checker need '${configfile}' configfile")
      }
      taskReceiveExtendedCheck(task_id)
      sendCheckerTaskAcceptAnswer(task_id)
    } catch {
      case e: Exception => sendCheckerTaskExceptionAnswer(e.getMessage, Some(task_id))
    }
  }

  /**
    * handle incoming submissions
    * @param jsonMap a kafka record
    */
  def onCheckSubmissionReceived(jsonMap: Map[String, Any]): Unit = {
    try {
      logger.warning(s"${checkername} Submission Received")
      val task_id = jsonMap(LABEL_TASKID)
      val submission_id = jsonMap(LABEL_SUBMISSIONID).asInstanceOf[String]
      val use_extern: Boolean = jsonMap(LABEL_USE_EXTERN).asInstanceOf[Boolean]
      val submit_type: String = jsonMap("submit_typ").asInstanceOf[String]
      val isInfo = if (jsonMap.contains(LABEL_ISINFO)) jsonMap(LABEL_ISINFO).asInstanceOf[Boolean] else false
      var submittedFilePath: String = ""
      if (use_extern && !allowedSubmissionTypes.contains("extern")) throw new CheckerException(s"${checkername} Checker does not allow extern check")
      if (!allowedSubmissionTypes.contains(submit_type)) throw new CheckerException(s"${checkername} Checker does not allow ${submission_id} submission")

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

      val (success, output, exitcode) = exec(task_id.toString, submission_id, submittedFilePath, isInfo, use_extern)

      sendCheckerSubmissionAnswer(JsonHelper.mapToJsonStr(Map(
        LABEL_PASSED -> (if (success) "1" else "0"),
        LABEL_EXITCODE ->  exitcode.toString,
        LABEL_TASKID -> task_id.toString,
        LABEL_SUBMISSIONID -> submission_id.toString,
        DATA -> output
      )))
    } catch {
      case e: Exception => sendCheckerExceptionAnswer(e.getMessage + " " + e.getStackTrace.mkString("\n"), None, None)
    }
  }

  /**
    * perform some extra checks on task receive if needed, exceptions will be catched in callee
    * @param taskid submitted task id
    */
  def taskReceiveExtendedCheck(taskid: Int): Unit = {}

}
