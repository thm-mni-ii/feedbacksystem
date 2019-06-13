package de.thm.ii.submissioncheck.bash
import java.io.ByteArrayOutputStream
import java.nio.file.{Files, Paths}

import akka.Done
import de.thm.ii.submissioncheck.JsonHelper
import de.thm.ii.submissioncheck.SecretTokenChecker.{GIT_CHECK_ANSWER_TOPIC, ULDIR, DATA, LABEL_TASKID, LABEL_TOKEN, LABEL_SUBMISSIONID, sendMessage}
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.clients.producer.ProducerRecord
import org.slf4j.LoggerFactory

import scala.concurrent.Future
import scala.sys.process.Process

/**
  * Provides a service to download / clone a git uri
  * @param submission_id users submission id
  * @param git_url git url
  */
class GitCheckExec(val submission_id: String, val git_url: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)
  /** save the output of our execution */
  var output: String = ""

  /**
    * run the git clone process
    * @return exitcode
    */
  def exec(): Int = {
    var dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    if (dockerRelPath == null) {
      dockerRelPath = ULDIR
    }

    dockerRelPath+="/GITCHECKER"
    val target_dir = dockerRelPath + "/" + submission_id
    logger.warn(dockerRelPath)
    logger.warn(target_dir)

    Files.createDirectories(Paths.get(target_dir))

    var seq: Seq[String] = null
    val stdoutStream = new ByteArrayOutputStream
    seq = Seq("clone", git_url, target_dir)

    val exitCode = Process("git", seq).#>(stdoutStream).run().exitValue()

    output = stdoutStream.toString

    exitCode
  }

  /**
    * get systems public key
    * @return public key
    */
  def getPublicKey(): String = {
    var seq: Seq[String] = null
    val stdoutStream = new ByteArrayOutputStream
    seq = Seq(System.getenv("HOME") + "/.ssh/id_rsa.pub")

    val exitcode = Process("cat", seq).#>(stdoutStream).run().exitValue()
    stdoutStream.toString
  }
}

/**
  * static context for GitCheckExec
  */
object GitCheckExec{
  private val logger = LoggerFactory.getLogger(this.getClass)

  /**
    * generates the correcpoding kafka answer message
    * @author Benjamin Manns
    * @param message jons string
    * @return kafka record
    */
  def sendGitCheckMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](GIT_CHECK_ANSWER_TOPIC, message))

  /**
    * Kafka Callback wen message for GitChecker is receiving
    * @author Benjamin Manns
    * @param jsonMap a kafka record
    */
  def onGitReceived(jsonMap: Map[String, Any]): Unit = {
    logger.warn("GIT Submission Received")
    val jwt_token = jsonMap(LABEL_TOKEN).asInstanceOf[String]
    val task_id = jsonMap(LABEL_TASKID)
    val git_url = jsonMap(DATA).asInstanceOf[String]
    val sumission_id = jsonMap(LABEL_SUBMISSIONID).asInstanceOf[String]
    val gitChecker = new GitCheckExec(sumission_id, git_url)
    val exitcode = gitChecker.exec()
    val passed = if (exitcode == 0) 1 else 0

    sendGitCheckMessage(JsonHelper.mapToJsonStr(Map(
      "passed" -> passed.toString,
      "exitcode" -> exitcode.toString,
      LABEL_TASKID -> task_id.toString,
      LABEL_SUBMISSIONID -> sumission_id,
      "public_key" -> gitChecker.getPublicKey,
      DATA -> gitChecker.output
    )))
  }
}
