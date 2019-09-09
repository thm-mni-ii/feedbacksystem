package de.thm.ii.submissioncheck.checker

import java.io.{File, FileInputStream, FileOutputStream}
import java.nio.file.{FileAlreadyExistsException, Files, Path, Paths}
import java.util.zip.ZipInputStream

import akka.Done
import de.thm.ii.submissioncheck.{JsonHelper, SecretTokenChecker}
import de.thm.ii.submissioncheck.SecretTokenChecker.{DATA, LABEL_ACCEPT, LABEL_ERROR, LABEL_ISINFO, LABEL_SUBMISSIONID,
  LABEL_TASKID, LABEL_TOKEN, LABEL_USE_EXTERN, NODE_TASK_ANSWER_TOPIC, ULDIR, downloadSubmittedFileToFS, logger, saveStringToFile,
  sendMessage, NODE_CHECK_ANSWER_TOPIC}
import de.thm.ii.submissioncheck.bash.GitCheckExec.{LABEL_CONFIGFILE, LABEL_STRUCTUREFILE, logger, sendGitTaskAnswer}
import org.apache.kafka.clients.producer.ProducerRecord
import org.slf4j.LoggerFactory

import scala.concurrent.Future
import scala.sys.process.{Process, ProcessLogger}

/** Excpetion wrapper for Node Checker purpose
  * @param message an exception message
  * */
class NodeCheckerException(message: String) extends RuntimeException(message)

/**
  * Check submissions with javascript / node, like express servers, but check also frontend with "puppeteer"
  * @param submission_id users submission id
  * @param taskid submissions task id
  * @param submission_path_url path of folder with js content
  * @param compile_production if is in production we need different relative paths
  * @param isInfo execute info procedure for given task
  */
class NodeCheckExec(val submission_id: String, val taskid: Any, val submission_path_url: String, val compile_production: Boolean,
                    isInfo: Boolean) {
  private val logger = LoggerFactory.getLogger(this.getClass)
  /** save the output of our execution */
  var output: String = ""
  private val startCode = -99
  /** save the success of our execution */
  var success: Boolean = false
  /** save the exit code of our execution */
  var exitCode: Int = startCode

  private val __option_v = "-v"
  private val __slash = "/"
  private val __colon = ":"

  /**
    * give a usefull debug information
    * @return deccription of current state
    */
  override def toString: String = {
    s"NodeCheckExec(exitcode=${exitCode}, success=${success}, output=${output})"
  }

  /**
    * execute on node docker
    * @return exitcode
    */
  def exec(): Int = {
    logger.info("Execute Node Checker")
    val nodeDockerImage = "feedbacksystem_nodeenv:latest" // "thmmniii/node"
    val interpreter = "npm"
    var seq: Seq[String] = null
    val dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    val baseFilePath = Paths.get(ULDIR).resolve(taskid.toString)
    val infoArgument = if (isInfo) "info" else ""
    val nodeTestPath = NodeCheckExec.getFullNPMPath(Paths.get(ULDIR).resolve(taskid.toString).resolve(NodeCheckExec.LABEL_NODETEST).toString)
    val insideDockerNodeTestPath = "/usr/src/app"
    val insideDockerNodeResPath = "/usr/src/results"
    val relatedSubPath = NodeCheckExec.getFullSubPath(Paths.get(ULDIR).resolve(taskid.toString).resolve(submission_id).resolve("unzip").toString)
    val resultsPath = Paths.get(ULDIR).resolve(taskid.toString).resolve(submission_id).resolve("results")

    // prepare a folder to put the results in (submission specific)
    try {
      Files.createDirectories(resultsPath)
    }
    catch {
      case e: FileAlreadyExistsException => { }
    }

    if (compile_production){
      seq = Seq("run", "--rm", __option_v, relatedSubPath.toString + __slash + nodeTestPath + __colon + nodeTestPath, __option_v,
        relatedSubPath + __colon + nodeTestPath + __slash + "src", nodeDockerImage, interpreter, "test", infoArgument)
    } else {
      val absSubPath = Paths.get(relatedSubPath).toAbsolutePath.toString
      val absNodeTestPath = Paths.get(nodeTestPath).toAbsolutePath.toString
      seq = Seq("run", "--rm", __option_v, absNodeTestPath + __colon + insideDockerNodeTestPath, __option_v,
        absSubPath + __colon + insideDockerNodeTestPath + __slash + "src", __option_v,
        resultsPath.toAbsolutePath.toString() + __colon +  insideDockerNodeResPath, nodeDockerImage, "bash", "/usr/src/script/run.sh", infoArgument)
    }

    val stdoutStream = new StringBuilder; val stderrStream = new StringBuilder
    val procLogger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))
    this.exitCode = Process("docker", seq).!(procLogger)
    val resultFile = new File(resultsPath.resolve("test.results.json").toString)
    output = if (resultFile.isFile) {
      scala.io.Source.fromFile(resultsPath.resolve("test.results.json").toString).mkString
    } else {
      stdoutStream.toString() + "\n" + stderrStream.toString()
    }
    if (this.exitCode == 0) {
      success = true
    } else {
      logger.debug("Exit with non-zero code: " + this.exitCode)
    }

    this.exitCode
  }
}

/**
  * static context for NodeCheckExec
  */
object NodeCheckExec {
  private val logger = LoggerFactory.getLogger(this.getClass)
  private val LABEL_PASSED = "passed"
  private val LABEL_EXITCODE = "exitcode"

  /** label for the nodetest root folder*/
  val LABEL_NODETEST = "nodetest"

  private def sendNodeTaskAnswer(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](NODE_TASK_ANSWER_TOPIC, message))

  private def sendNodeTaskExceptionAnswer(exception: String, taskid: Option[Int]): Future[Done] = {
    if (taskid.isDefined) {
      sendNodeTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR -> exception, LABEL_TASKID -> taskid.get.toString)))
    } else {
      sendNodeTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR -> exception)))
    }
  }

  private def sendNodeTaskAcceptAnswer(taskid: Int): Future[Done] = {
    sendNodeTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> true, LABEL_ERROR -> "", LABEL_TASKID -> taskid.toString)))
  }

  private def sendNodeCheckAnswer(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](NODE_CHECK_ANSWER_TOPIC, message))

  private def sendNodeCheckExceptionAnswer(exception: String, taskid: Option[Int], submissionid: Option[Int]): Future[Done] = {
    val zero = "0"
    if (taskid.isDefined && submissionid.isDefined) {
      sendNodeCheckAnswer(JsonHelper.mapToJsonStr(Map(
        LABEL_PASSED -> zero,
        LABEL_EXITCODE -> "42",
        LABEL_TASKID -> taskid.get.toString,
        LABEL_SUBMISSIONID -> submissionid.get.toString,
        DATA -> exception
      )))
    } else {
      sendNodeCheckAnswer(JsonHelper.mapToJsonStr(Map(
        LABEL_PASSED -> zero,
        LABEL_EXITCODE -> "42",
        DATA -> exception
      )))
    }
  }

  /**
    * Figure out where the test / npm path is, take the best folder inside the provided zip. If it can not be found,
    * send an error to the user that he should provide a better zip file
    *
    * @param rootPath where to start looking for the node folder
    * @return the path where a npm structure has been found
    */
  def getFullNPMPath(rootPath: String): String = {
      val d = new File(rootPath)
      val fileList = if (d.exists && d.isDirectory) {
        d.listFiles.filter(!_.toString.contains("__MACOSX")).toList
      } else {
        List[File]()
      }

      if (fileList.filter(f => {f.isFile && f.toString.contains("package.json")}).nonEmpty) {
        rootPath
      } else if (fileList.filter(_.isDirectory).nonEmpty) {
        getFullNPMPath(fileList.filter(_.isDirectory).head.toPath.toString)
      } else {
        throw new NodeCheckerException("Provided config zip file is not usefull. There are multiple main folders, " +
          "if you provide a nested folder please avoid multiple root folders")
      }
  }

  /**
    * Figure out where the main submission path is (contains just files), take the best folder inside the provided zip.
    * If it can not be found, send an error to the user that he should provide a better zip file / folder
    *
    * @param rootPath where to start looking for the node folder
    * @return the path where a npm structure has been found
    */
  def getFullSubPath(rootPath: String): String = {
    val d = new File(rootPath)
    val fileList = if (d.exists && d.isDirectory) {
      d.listFiles.filter(!_.toString.contains("__MACOSX")).toList
    } else {
      List[File]()
    }

    if (fileList.filter(f => {f.isFile}).nonEmpty) {
      rootPath
    } else if (fileList.filter(_.isDirectory).nonEmpty) {
      getFullSubPath(fileList.filter(_.isDirectory).head.toPath.toString)
    } else {
      throw new NodeCheckerException("Provided submission zip file or git folder is not usefull. There are multiple main folders, " +
        "if you provide a nested folder please avoid multiple root folders")
    }
  }

  /**
    * Delets a dir recursively deleting anything inside it.
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

  private def onNodeTaskReceivedHandler(task_id: Int, fileurls: List[String], jwt_token: String) = {
    try {
      if (fileurls.length != 1) {
        throw new NodeCheckerException("Node Checker does only accept one config file")
      }

      val sendedFileNames = SecretTokenChecker.downloadFilesToFS(fileurls, jwt_token, task_id.toString)
      // TODO need to set correct filename
      if (!sendedFileNames.contains("nodetest.zip")) throw new NodeCheckerException("Node Checker accept only 'nodetest.zip' file")

      val nodeTestPath = Paths.get(ULDIR).resolve(task_id.toString).resolve(LABEL_NODETEST)

      val nodeTestFile = new File(nodeTestPath.toAbsolutePath.toString)
      if (nodeTestFile.exists()) deleteDirectory(nodeTestFile)

      unzip(Paths.get(ULDIR).resolve(task_id.toString).resolve(sendedFileNames.head).toAbsolutePath.toString, nodeTestPath)

      sendNodeTaskAcceptAnswer(task_id)
    } catch {
      case e: Exception => sendNodeTaskExceptionAnswer(e.getMessage, Some(task_id))
    }
  }

  /** a bit based on https://stackoverflow.com/a/30642526
  * It is more a JAVA way
  *
  * @param zipFile      downloaded zip path
  * @param outputFolder where to extract
  */
  private def unzip(zipFile: String, outputFolder: Path): Unit = {
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

  /**
    * save incoming tasks settings / infos
    * @param jsonMap a kafka record
    */
  def onNodeTaskReceived(jsonMap: Map[String, Any]): Unit = {
    try {
      val urls: List[String] = jsonMap("testfile_urls").asInstanceOf[List[String]]
      val taskid: String = jsonMap(LABEL_TASKID).asInstanceOf[String]
      val jwt_token: String = jsonMap(LABEL_TOKEN).asInstanceOf[String]
      onNodeTaskReceivedHandler(Integer.parseInt(taskid), urls, jwt_token)
    } catch {
      case e: Exception => sendNodeTaskExceptionAnswer(e.getMessage, None)
    }
  }

  /**
    * handle incoming submissions
    * @param jsonMap a kafka record
    * @param compile_production run different docker command if inside docker or outside
    */
  def onNodeReceived(jsonMap: Map[String, Any], compile_production: Boolean): Unit = {
    try {
      logger.warn("NODE Submission Received")
      val jwt_token = jsonMap(LABEL_TOKEN).asInstanceOf[String]
      val task_id = jsonMap(LABEL_TASKID)
      val submission_id = jsonMap(LABEL_SUBMISSIONID).asInstanceOf[String]
      val use_extern: Boolean = jsonMap(LABEL_USE_EXTERN).asInstanceOf[Boolean]
      val submit_type: String = jsonMap("submit_typ").asInstanceOf[String]
      val isInfo = if (jsonMap.contains(LABEL_ISINFO)) jsonMap(LABEL_ISINFO).asInstanceOf[Boolean] else false

      if (submit_type == "data") {
        sendNodeCheckExceptionAnswer("Node Checker does not accept data submission type", Option(Integer.parseInt(task_id.toString)),
          Option[Int](Integer.parseInt(submission_id)))
      }

      // if use_extern it is the same path
      val nodeExecutionPath = Paths.get(ULDIR).resolve(task_id.toString).resolve(submission_id.toString).resolve("unzip").toAbsolutePath

      if (!use_extern) {
        // if it is a direct upload to node checker we need to download the provided zip file otherwise the folder is already there
        val submit_url = jsonMap("fileurl").asInstanceOf[String]
        val filename = downloadSubmittedFileToFS(submit_url, jwt_token, task_id.toString, submission_id)
        unzip(filename.toAbsolutePath.toString, nodeExecutionPath)
      }

      val nodechecker = new NodeCheckExec(submission_id, task_id, nodeExecutionPath.toString, compile_production, isInfo)
      nodechecker.exec()

      sendNodeCheckAnswer(JsonHelper.mapToJsonStr(Map(
        LABEL_PASSED -> (if (nodechecker.success) "1" else "0"),
        LABEL_EXITCODE -> nodechecker.exitCode.toString,
        LABEL_TASKID -> task_id.toString,
        LABEL_SUBMISSIONID -> submission_id.toString,
        DATA -> nodechecker.output
      )))
    } catch {
      case e: Exception => sendNodeCheckExceptionAnswer(e.getMessage + " " + e.getStackTrace.mkString("\n"), None, None)
    }
  }
}
