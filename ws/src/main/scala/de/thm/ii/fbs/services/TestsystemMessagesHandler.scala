package de.thm.ii.fbs.services
import java.io.{File, FileOutputStream}
import java.util.Base64

import de.thm.ii.fbs.util.{FileOperations, JsonParser}
import org.apache.commons.io.FileUtils
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component

/**
  * Class / Service which handles incoming message with payload of a testsytem
  */
@Component
class TestsystemMessagesHandler {
  @Value("${compile.production}")
  private val compile_production: Boolean = true
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val taskExtensionService: TaskExtensionService = null
  private val LABEL_TASK_ID = "taskid"
  private val LABEL_USER_ID = "userid"
  private val logger: Logger = LoggerFactory.getLogger(classOf[TestsystemMessagesHandler])
  private val LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER = "Checker Service did not provide all parameters"
  private var storageService: StorageService = null

  /**
    * Using autowired configuration, they will be loaded after self initialization
    */
  def configurateStorageService(): Unit = {
    if (this.storageService == null) this.storageService = new StorageService(compile_production)
  }

  private def base64Decode(raw: String, output: File) = {
    val decoded = Base64.getDecoder.decode(raw)
    val out = new FileOutputStream(output)
    try out.write(decoded)
    finally if (out != null) out.close()
  }

  /**
    * handles incoming zip file of plagiat processing
    * @param testsystem testsystemid
    * @param data payload
    * @param msgID message has an id (name of shared messages folder)
    */
  def plagiatPackedZipHandler(testsystem: String, data: String, msgID: String): Unit = {
    configurateStorageService
    val answeredMap = JsonParser.jsonStrToMap(data)
    val userid = answeredMap(LABEL_USER_ID).toString.toInt
    val taskid = answeredMap(LABEL_TASK_ID).toString.toInt
    val filename = answeredMap("filename").toString

    // copy file from shared maessages folder
    val dirPath = storageService.getAndMakeTaskExtensionsPath(userid, "plagiat_zip", taskid)
    val zipPath = dirPath.resolve("plagiat_zip.zip")
    FileUtils.copyFile(storageService.sharedMessagedPath.resolve(msgID).resolve(filename).toFile, zipPath.toFile)

    // store info in DB
    taskExtensionService.setTaskExtension(taskid, userid, "plagiatPackedZip", zipPath.toString, "file")
  }

  /**
    * handles plagiat markers
    * @param testsystem testsystemid
    * @param data payload
    * @param msgID message has an id (name of shared messages folder)
    * @return nothing
    */
  def plagiarismcheckerAnswerHandler(testsystem: String, data: String, msgID: String): AnyVal = {
    val answeredMap = JsonParser.jsonStrToMap(data)

    try {
      logger.warn(answeredMap.toString())

      val submissionlist = answeredMap("submissionlist").asInstanceOf[List[Map[String, Boolean]]]
      for (submission <- submissionlist) {
        taskService.setPlagiatPassedForSubmission(submission.keys.head, submission.values.head)
      }
    } catch {
      case _: NoSuchElementException => logger.warn(LABEL_CHECKER_SERVICE_NOT_ALL_PARAMETER)
    }
  }

  /**
    * shared messages main folder do not need to stored, remove and everything inside
    * @param msgID message has an id (name of shared messages folder)
    * @return if tidy up succeeded
    */
  def tidyUpFile(msgID: String): Boolean = {
    configurateStorageService()
    val mainFolder = storageService.sharedMessagedPath.resolve(msgID).toFile
    if (mainFolder.exists()) FileOperations.rmdir(mainFolder) else true
  }
}
