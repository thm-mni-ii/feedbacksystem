package de.thm.ii.submissioncheck.bash

import java.io._
import java.nio.file.{Files, Path, Paths, StandardCopyOption}

import akka.Done
import de.thm.ii.submissioncheck.JsonHelper
import de.thm.ii.submissioncheck.SecretTokenChecker.{LABEL_ERROR_DOWNLOAD,
  LABEL_TOKEN, PLAGIARISM_SCRIPT_ANSWER_TOPIC, ULDIR, download, logger, sendMessage}
import org.apache.kafka.clients.producer.ProducerRecord
import org.slf4j.LoggerFactory

import scala.concurrent.Future
import scala.sys.process.Process

/**
  * Class for executing Plagiat scripts
  *
  * @author Benjamin Manns
  * @param courseid of submitted task
  * @param plagiatCheckBasePath users submission saved all in a folder
  */
class PlagiatCheckExec(val courseid: String, val plagiatCheckBasePath: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private val __option_v = "-v"
  private val __slash = "/"
  private val __colon = ":"
  private val startCode = -99
  /** save the success of our execution */
  var success: Boolean = false
  /** save the exit code of our execution */
  var exitCode: Int = startCode
  /** save the output of our execution */
  var output: String = ""
  /**
    * simply display some usefull status information
    * @return string describing PlagiatCheckExec
    */
  override def toString: String = s"PlagiatCheckExec(success=$success,exitCode=$exitCode,output=$output) [" + super.toString + "]"

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

    val plagiatWorkingDir = Paths.get(s"$dockerRelPath/PLAGIAT_CHECK/$courseid/").toAbsolutePath.toString
    val plagiatScriptPath = s"$plagiatWorkingDir/plagiatscript.sh"
    val localScriptPath = Paths.get(s"$ULDIR/PLAGIAT_CHECK/$courseid/scriptfile.sh").toAbsolutePath.toString
    val unzipedDir = plagiatWorkingDir + "/unzip"
    val stdoutStream = new ByteArrayOutputStream

    var seq: Seq[String] = null

    seq = Seq("run", "--rm", __option_v, s"$plagiatScriptPath:$localScriptPath", __option_v, s"$unzipedDir:$unzipedDir", "--env",
        "USERS_SUBMISSION_DIR=" + unzipedDir, "bash:4.4", "bash", localScriptPath)

    val exitCode = Process("docker", seq).#>(stdoutStream).run().exitValue()

    output = stdoutStream.toString

    if (exitCode == 0) {
      success = true
    } else {
      logger.debug("Exit with non-zero code: " + exitCode)
      success = false
    }
    this.exitCode = exitCode
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
