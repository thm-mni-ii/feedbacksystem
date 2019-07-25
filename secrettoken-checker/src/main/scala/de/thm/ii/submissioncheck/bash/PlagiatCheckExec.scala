package de.thm.ii.submissioncheck.bash

import java.io._
import java.nio.file.{Files, Path, Paths, StandardCopyOption}

import akka.Done
import de.thm.ii.submissioncheck.JsonHelper
import de.thm.ii.submissioncheck.SecretTokenChecker.{LABEL_ERROR_DOWNLOAD, LABEL_TOKEN, PLAGIARISM_SCRIPT_ANSWER_TOPIC, ULDIR, download, logger, sendMessage}
import org.apache.kafka.clients.producer.ProducerRecord
import org.slf4j.LoggerFactory

import scala.concurrent.Future
import scala.sys.process.Process
import scala.util.{Failure, Success}

/**
  * Class for executing Plagiat scripts
  *
  * @author Benjamin Manns
  * @param courseid of submitted task
  * @param taskid of submitted task
  * @param plagiatCheckBasePath users submission saved all in a folder
  */
class PlagiatCheckExec(val courseid: String, val taskid: String, val plagiatCheckBasePath: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private val __option_v = "-v"
  private val __slash = "/"
  private val __colon = ":"
  private val startCode = -99
  private val EXIT_CODE_1 = 1
  private val EXIT_CODE_4 = 4

  private val PLAGIAT_CHECK = "PLAGIAT_CHECK"
  /** save the passed status of each submission*/
  var submission_checks: List[Map[Int, Boolean]] = List()

  /** save if execution wa successfully */
  var execution_success: Boolean = false
  /** error message */
  var error_msg: String = ""

  /** save the exit code of our execution */
  var exitCode: Int = startCode
  /** save the output of our execution */
  var output: String = ""
  /**
    * simply display some usefull status information
    * @return string describing PlagiatCheckExec
    */
  override def toString: String = s"PlagiatCheckExec(exitCode=$exitCode,output=$output) [" + super.toString + "]"

  /**
    * exec()
    *
    * @return exit code
    */
  def exec(): Int = {
    var dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    if (dockerRelPath == null) {
      dockerRelPath = ULDIR
    }

    val plagiatWorkingDir = Paths.get(dockerRelPath).resolve(PLAGIAT_CHECK).resolve(courseid).toAbsolutePath.toString
    val plagiatScriptPath = s"$plagiatWorkingDir/plagiatscript.sh"
    val localScriptPath = Paths.get(s"$ULDIR/PLAGIAT_CHECK/$courseid/plagiatscript.sh").toAbsolutePath
    val unzipedDir = Paths.get(plagiatWorkingDir).resolve(taskid).resolve("unzip")
    val stdoutStream = new ByteArrayOutputStream
    val localScriptPathString = localScriptPath.toString

    if (!Files.exists(localScriptPath)){
      error_msg = "The plagiat script is not available. Path should be: " + localScriptPath
      exitCode = EXIT_CODE_4
    } else {
      var seq: Seq[String] = null

      val bashDockerImage = System.getenv("BASH_DOCKER")

      seq = Seq("run", "--rm", __option_v, s"$plagiatScriptPath:$localScriptPathString", __option_v, s"$unzipedDir:$unzipedDir", "--env",
        "USERS_SUBMISSION_DIR=" + unzipedDir, bashDockerImage, "bash", localScriptPathString)

      exitCode = Process("docker", seq).#>(stdoutStream).run().exitValue()
      output = stdoutStream.toString
      val parsedObject = JsonHelper.jsonStrToAny(output)

      if (parsedObject == null){
        // answer was an invalid json string
        error_msg = "Answer form plagiarism script was an invalid json string"
        exitCode = 1
      } else {
        try {
          submission_checks = parsedObject.asInstanceOf[List[Map[Int, Boolean]]]
          execution_success = true
        } catch {
          case _: Exception => {
            exitCode = 1
            error_msg = "Answer form plagiarism script has to be a JSON of format: List[Map[Int, Boolean]]"
          }
        }
      }
    }
    exitCode
  }
}

/**
  * PlagiatCheckExec static decalaration
  */
object PlagiatCheckExec{
  /**
    * generates the correcpoding kafka answer message
    * @author Benjamin Manns
    * @param message jons string
    * @return kafka record
    */
  def sendPlagiarismScriptMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](PLAGIARISM_SCRIPT_ANSWER_TOPIC, message))

  /**
    * receive and save script for plagarism check
    * @param jsonMap kafka message
    */
  def onPlagiarsimScriptReceive(jsonMap: Map[String, Any]): Unit = {
    logger.warning("Plagiarism Submission Received")
    val jwt_token = jsonMap("jwt_token").asInstanceOf[String]
    val fileurl = jsonMap("fileurl").asInstanceOf[String]
    val courseid: Int = Integer.parseInt(jsonMap("courseid").toString)
    val plagiatCheckPath = downloadPlagiatScriptFiles(fileurl, jwt_token, courseid)
    var msg = ""

    if (plagiatCheckPath.isEmpty) {
      msg = "Provided Script file for plagism check could not be downloaded"
      logger.warning(msg)
    }

    val answerMap = JsonHelper.mapToJsonStr(Map(
      "success" -> plagiatCheckPath.isDefined,
      "msg" -> msg,
      "courseid" -> courseid
    ))
    sendPlagiarismScriptMessage(answerMap)
  }

  private def downloadPlagiatScriptFiles(link: String, jwt_token: String, courseid: Int): Option[Path] = {
    val connection = download(link, jwt_token)
    if(connection.getResponseCode >= 400){
      logger.error(LABEL_ERROR_DOWNLOAD)
      Option.empty
    }
    else {
      val basePath = Paths.get(ULDIR).resolve("PLAGIAT_CHECK").resolve(courseid.toString).toString
      new File(basePath).mkdirs()
      val dest = Paths.get(basePath).resolve("plagiatscript.sh")
      Files.copy(connection.getInputStream, dest, StandardCopyOption.REPLACE_EXISTING)
      Some(dest)
    }
  }
}
