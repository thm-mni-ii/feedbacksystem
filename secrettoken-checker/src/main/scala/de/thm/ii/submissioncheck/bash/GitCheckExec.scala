package de.thm.ii.submissioncheck.bash
import java.io.{ByteArrayOutputStream, File}
import java.nio.file.{Files, Paths}

import akka.Done
import de.thm.ii.submissioncheck.{JsonHelper, SecretTokenChecker}
import de.thm.ii.submissioncheck.SecretTokenChecker.{DATA, GIT_CHECK_ANSWER_TOPIC, LABEL_ACCEPT, LABEL_ERROR, LABEL_SUBMISSIONID, LABEL_TASKID, LABEL_TOKEN, ULDIR, downloadFilesToFS, sendMessage, sendTaskMessage}
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.clients.producer.ProducerRecord
import org.slf4j.LoggerFactory

import scala.concurrent.Future
import scala.io.Source
import scala.sys.process.Process

/**
  * Provides a service to download / clone a git uri
  * @param submission_id users submission id
  * @param taskid: submissions task id
  * @param git_url git url
  */
class GitCheckExec(val submission_id: String, val taskid: Any, val git_url: String) {
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

    val basePath = Paths.get(dockerRelPath).resolve(taskid.toString)
    Files.createDirectories(Paths.get(target_dir))



    val docentFile = new File(basePath.resolve("docentfile").toString)
    val docentFilePath = docentFile.getPath
    val docentFileAbsPath: String = docentFile.getAbsolutePath

    val configFile = new File(basePath.resolve("configfile").toString)
    val configFilePathRel = configFile.getPath
    val configFileAbsPath = configFile.getAbsolutePath

    val bufferedSource = Source.fromFile(docentFileAbsPath)
    for (line <- bufferedSource.getLines) {
      println(line)
    }

    bufferedSource.close

    if (docentFile.exists() && docentFile.isFile){
      // we scan this information
    }



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
    * Kafka Callback when message for GitChecker is receiving
    *
    * @author Benjamin Manns
    * @param jsonMap a kafka record
    */
  def onTaskGitReceived(jsonMap: Map[String, Any]): Unit = {
    val urls: List[String] = jsonMap("testfile_urls").asInstanceOf[List[String]]
    val taskid: String = jsonMap(LABEL_TASKID).asInstanceOf[String]
    val jwt_token: String = jsonMap(LABEL_TOKEN).asInstanceOf[String]
    if (urls.length != 1 && urls.length != 2) {
      sendGitCheckMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
        "Please provide one or two files (configfile and docentfile)", LABEL_TASKID -> taskid)))
    } else {
      //deleteDirectory(new File(Paths.get(ULDIR).resolve(taskid).toString))
      val sendedFileNames = SecretTokenChecker.downloadFilesToFS(urls, jwt_token, taskid, "GITCHECKER")

      // validation if sent files are useful
      if (sendedFileNames.length == 1 && !sendedFileNames.contains("configfile")) {
        sendGitCheckMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
          "Provided file should call 'configfile'", LABEL_TASKID -> taskid)))
      }
      else if (sendedFileNames.length == 2 && (!sendedFileNames.contains("docentfile") || !sendedFileNames.contains("testfile"))) {
        sendGitCheckMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
          "Provided files should call 'configfile' and 'docentfile'", LABEL_TASKID -> taskid)))
      } else {
        sendGitCheckMessage(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> true, LABEL_ERROR -> "", LABEL_TASKID -> taskid)))
      }
    }
  }

  /**
    * Kafka Callback when message for GitChecker is receiving
    * @author Benjamin Manns
    * @param jsonMap a kafka record
    */
  def onGitReceived(jsonMap: Map[String, Any]): Unit = {
    logger.warn("GIT Submission Received")
    val jwt_token = jsonMap(LABEL_TOKEN).asInstanceOf[String]
    val task_id = jsonMap(LABEL_TASKID)
    val git_url = jsonMap(DATA).asInstanceOf[String]
    val sumission_id = jsonMap(LABEL_SUBMISSIONID).asInstanceOf[String]
    val gitChecker = new GitCheckExec(sumission_id, task_id, git_url)
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
