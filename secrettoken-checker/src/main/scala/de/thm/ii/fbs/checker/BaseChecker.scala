package de.thm.ii.fbs.checker

import java.io._
import java.net.{HttpURLConnection, URLDecoder}
import java.nio.charset.StandardCharsets
import java.nio.file._
import java.util.Base64
import java.util.zip.ZipInputStream
import akka.Done
import de.thm.ii.fbs.SecretTokenChecker.{DATA, LABEL_ACCEPT, LABEL_ERROR, LABEL_ERROR_DOWNLOAD, LABEL_ISINFO,
  LABEL_SUBMISSIONID, LABEL_TASKID, LABEL_TOKEN, LABEL_USE_EXTERN, ULDIR, downloadSubmittedFileToFS, logger, saveStringToFile, sendMessage}
import de.thm.ii.fbs.security.Secrets
import de.thm.ii.fbs.FileOperations
import de.thm.ii.fbs.{JsonHelper, ResultType}
import org.apache.commons.io.FileUtils
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.clients.producer.ProducerRecord
import scala.concurrent.Future
/** Exception wrapper for Base Checker purpose
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
  private val DATA_TYPE = "datatype"
  private val LABEL_PASSED = "passed"
  private val LABEL_EXITCODE = "exitcode"
  private val LABEL_AUTHORIZATION = "Authorization"
  private val LABEL_CONNECTION = "Connection"
  private val LABEL_CLOSE = "close"
  private val LABEL_BEARER = "Bearer: "
  private val LABEL_BEST_FIT = "choice_best_result_fit"
  private val LABEL_PRE_RESULT = "calculate_pre_result"

  /** label header for multi dim answer generation */
  val LABEL_HEADER = "header"
  /** label result for multi dim answer generation */
  val LABEL_RESULT = "result"
  /** label test for multi dim answer generation */
  val LABEL_TEST = "test"
  /** LABEL -v*/
  val __option_v = "-v"
  /** LABEL "/" */
  val __slash = "/"
  /** LABEL : */
  val __colon = ":"

  /** define which configuration files the checker need - to be overwritten */
  val configFiles: Map[String, Boolean] = Map()
  /** define allowed submission types - to be overwritten */
  val allowedSubmissionTypes: List[String] = List("data", "file", "extern")
  /** define which external file is needed - to be overwritten */
  val externSubmissionFilename = "submission.txt"

  /**
    * the unique identification of a checker, is extended to "basechecker"
    * @return checker name
    */
  def checkernameExtened: String = checkername + "checker"

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
    logger.warning(s"Load ${checkername} Checker Config at ${checkernameExtened} ")
    val baseFilePath = Paths.get(ULDIR).resolve(taskid).resolve(checkernameExtened)
    val configfiles = configFiles.keys.map(f => baseFilePath.resolve(f)).toList.filter(f => f.toFile.exists())
    (baseFilePath, configfiles)
  }

  /**
    * encode file to base64 string
    * @param filepath input file
    * @return base64 encoding
    */
  def base64Encode(filepath: Path): String = {
    val bis = new BufferedInputStream(new FileInputStream(filepath.toAbsolutePath.toString))
    val bArray: Array[Byte] = LazyList.continually(bis.read).takeWhile(_ != -1).map(_.toByte).toArray
    val output: String = Base64.getEncoder.encodeToString(bArray)
    output
  }

  /**
    * send messages (indirectly) initated fromthe testsystem to the WebService (ws), which provides i.e. additional
    * information of tasks (plagiat check) or similiar things.
    * In WS for the provided subject a handles has to exists, which process the provided data as the encoding is known.
    * Everything will be send as string, so a suitable format should be defined
    * @param subject subject where handlers are registred at
    * @param data encoded data as string
    * @param file "send" / share a file to the WS
    * @return future state of kafka message
    */
  def additionalMessagetoWS(subject: String, data: String = null, file: File = null): Future[Done] = {
    val msgId = Secrets.getSHAStringFromNow()

    var messageMap = Map(
      "subject"-> subject,
      "testsystem_id" -> checkername,
      "msg_id" -> msgId
    )

    if (data != null) messageMap += ("data" -> data)

    if (file != null) {
      val folder = sharedMessagedPath.resolve(msgId)
      FileUtils.copyFile(file, folder.resolve(file.getName).toFile)
    }

    val message = JsonHelper.mapToJsonStr(messageMap)

    logger.warning("additionalMessagetoWS: " + message)
    sendMessage(new ProducerRecord[String, String]("testsystem_message_data", message))
  }

  /**
    * dynamically get path whether it is dev or production
    * @return path to shared folder between testsystems and webservice (ws)
    */
  def sharedMessagedPath: Path = Paths.get((if (compile_production) __slash else "") + "shared-messages")

  /**
    * perform a check of request, will be executed after processing the kafka message
    * @param taskid submissions task id
    * @param submissionid submitted submission id
    * @param subBasePath, subFileame path of folder, where submitted file is in
    * @param subFilename path of submitted file (if zip or something, it is also a "file")
    * @param isInfo execute info procedure for given task
    * @param use_extern include an existing file, from previous checks
    * @param jsonMap complete submission payload
    * @return check succeeded, output string, exitcode
    */
  def exec(taskid: String, submissionid: String, subBasePath: Path, subFilename: Path, isInfo: Boolean, use_extern: Boolean, jsonMap: Map[String, Any]):
  (Boolean, String, Int, String) = {
    (false, "output", 42, ResultType.STRING)
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
    * @return Future done
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

      val sentFileNames = downloadFilesToFS(fileurls, jwt_token, task_id.toString)
      val requiredConfigFiles = configFiles.filter(f => f._2).keys
      for(configfile <- requiredConfigFiles) {
        if (!sentFileNames.contains(configfile)) throw new CheckerException(s"${checkername} Checker need '${configfile}' configfile")
      }
      taskReceiveExtendedCheck(task_id, sentFileNames)
      sendCheckerTaskAcceptAnswer(task_id)
    } catch {
      case e: Exception => sendCheckerTaskExceptionAnswer(e.getMessage, Some(task_id))
    }
  }

  private def createConnectionToFeedbacksystem(download_url: String, jwt_token: String) = {
    val url = new java.net.URL(download_url)
    val timeout = 1000
    val connection = url.openConnection().asInstanceOf[HttpURLConnection]
    connection.setRequestProperty(LABEL_AUTHORIZATION, LABEL_BEARER + jwt_token)
    connection.setConnectTimeout(timeout)
    connection.setReadTimeout(timeout)
    connection.setRequestProperty(LABEL_CONNECTION, LABEL_CLOSE)
    connection.connect()
    connection
  }

  /**
    *
    * Download taskfiles from Feedbacksystem
    * @param urlnames url
    * @param jwt_token JSON Web Token
    * @param taskid id of task
    * @return list of downloaded file names
    */
  def downloadFilesToFS(urlnames: List[String], jwt_token: String, taskid: String): List[String] = {
    var downloadFileNames: List[String] = List()
    for (urlname <- urlnames) {
      val urlParts = urlname.split(__slash)
      // syntax of testfile url allows us to get filename
      val filename = URLDecoder.decode(urlParts(urlParts.length - 1), StandardCharsets.UTF_8.toString)
      downloadFileNames = downloadFileNames ++ List(filename)
      val connection = createConnectionToFeedbacksystem(urlname, jwt_token)

      if (connection.getResponseCode >= 400) {
        logger.error(LABEL_ERROR_DOWNLOAD)
      }
      else {
        var basePath = Paths.get(ULDIR).resolve(taskid)
        basePath.toFile.mkdir()
        basePath = basePath.resolve(checkernameExtened)
        basePath.toFile.mkdir()
        Files.copy(connection.getInputStream, basePath.resolve(filename), StandardCopyOption.REPLACE_EXISTING)
      }
    }
    downloadFileNames
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
      val connection = createConnectionToFeedbacksystem(download_url, authorization)
      val in: InputStream = connection.getInputStream
      val br: BufferedReader = new BufferedReader(new InputStreamReader(in))
      val s = Iterator.continually(br.readLine()).takeWhile(_ != null).mkString("\n")
      (connection.getResponseCode, s, JsonHelper.jsonStrToAny(s))
    } catch {
      case e: Exception => (400, e.toString, Map())
    }
  }

  private val insideDockerDockerTemp = Paths.get("/dockertemp")

  /**
    * simple wrapper of java's tmp file generation
    * @param placeholder some extra infos in path
    * @return path on host and inside docker (tuple)
    */
  def getTempFile(placeholder: String = ""): Path = {
    /*val tmppath = if (System.getProperty("os.name") == "Mac OS X") {
      new File("/tmp").toPath.resolve(s"submission_${placeholder}_tmp_${Secrets.getSHAStringFromNow()}")
    } else {
      File.createTempFile(s"submission_${placeholder}_tmp_${Secrets.getSHAStringFromNow()}", "").toPath
    }*/
    val dockertemp = if (!compile_production){
      val localTmpPath = new File(  "/tmp").toPath.resolve("fb-dockertemp")
      localTmpPath.toFile.mkdirs()
      localTmpPath
    } else {
      insideDockerDockerTemp
    }

    if (!dockertemp.toFile.exists()){
      throw new CheckerException(s"Folder ${dockertemp} need to mounted / created from HOST system")
    }
    val tmpdir = s"submission_${placeholder}_tmp_${Secrets.getSHAStringFromNow()}"
    val tmppath = dockertemp.resolve(tmpdir)
    tmppath.toFile.mkdir() // generate a folder of it

    //val hostTMPDir = if (System.getenv("HOST_TMP_DIR") != null) System.getenv("HOST_TMP_DIR") else "/tmp"
    //(new File(hostTMPDir).toPath.resolve(tmpdir), )
    tmppath
  }

  /**
    * get corresponsing temp dir path of host, to get docker in docker run
    * @param appTempDir path accessable from app
    * @return path of host system, if a host exists
    */
  def getCorespondigHOSTTempDir(appTempDir: Path): Path = {
    if (compile_production) {
      Paths.get(System.getenv("HOST_TMP_DIR")).resolve(appTempDir.subpath(insideDockerDockerTemp.getNameCount, appTempDir.getNameCount))
    } else {
      throw new CheckerException("getCorespondigHOSTTempDir in local dev is not defined")
    }
  }

  private def generateAndGetTempSubmittedFilePath(originalPath: Path, subid: String) = {
    // for copy we need the folder where our app has access to
    val copyTempPath = getTempFile(subid)
    val tmpfile = copyTempPath.resolve(originalPath.toFile.getName)

    FileOperations.copy(originalPath.getParent.toFile, copyTempPath.toFile)
    (copyTempPath, tmpfile)
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
      var submittedFilePath: Path = null
      if (use_extern && !allowedSubmissionTypes.contains("extern")) throw new CheckerException(s"${checkername} Checker does not allow extern check")
      if (!allowedSubmissionTypes.contains(submit_type)) throw new CheckerException(s"${checkername} Checker does not allow ${submit_type} submission type")

      if (use_extern) {
        val path = Paths.get(ULDIR).resolve(task_id.toString).resolve(submission_id.toString).resolve(externSubmissionFilename)
        submittedFilePath = path
      } else if (submit_type.equals("file")) {
        val url: String = jsonMap("fileurl").asInstanceOf[String]
        val jwt_token: String = jsonMap(LABEL_TOKEN).asInstanceOf[String]

        submittedFilePath = downloadSubmittedFileToFS(url, jwt_token, task_id.toString, submission_id.toString)
        logger.warning(submittedFilePath.toString)
      }
      else if (submit_type.equals(DATA)) {
        submittedFilePath = saveStringToFile(jsonMap(DATA).asInstanceOf[String], task_id.toString, submission_id.toString)
      }
      val (subBasePath, subFilename) = generateAndGetTempSubmittedFilePath(submittedFilePath, submission_id.toString)
      logger.warning( (subBasePath, subFilename).toString() )
      val (success, output, exitcode, datatype) = exec(task_id.toString, submission_id.toString, subBasePath, subFilename, isInfo, use_extern, jsonMap)

      // Copy generated files, output and stuff to the original submission folder, for multichecks. The next checker needs access to this files
      FileOperations.copy(subBasePath.toFile, submittedFilePath.getParent.toFile)
      sendCheckerSubmissionAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ISINFO -> isInfo, "resubmit" -> submit_type.equals("resubmit"),
        "username" ->jsonMap("username"), LABEL_PASSED -> (if (success) "1" else "0"),
        LABEL_EXITCODE ->  exitcode.toString, LABEL_TASKID -> task_id.toString,
        LABEL_SUBMISSIONID -> submission_id.toString, DATA -> output, DATA_TYPE -> datatype,
        LABEL_BEST_FIT -> "", LABEL_PRE_RESULT -> ""
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
    LazyList.continually(zis.getNextEntry).takeWhile(_ != null).foreach { file =>
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
        LazyList.continually(zis.read(buffer)).takeWhile(_ != -1).foreach(fout.write(buffer, 0, _))
      }
    }
  }
}
