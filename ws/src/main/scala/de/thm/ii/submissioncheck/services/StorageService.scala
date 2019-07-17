package de.thm.ii.submissioncheck.services

import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import java.net.MalformedURLException

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.nio.file._

import org.springframework.web.multipart.MultipartFile
import java.io.{BufferedOutputStream, ByteArrayInputStream, FileOutputStream, IOException}

/**
  * More or less copy paste from https://grokonez.com/frontend/angular/angular-4-uploadget-multipartfile-tofrom-spring-boot-server
  * and integrate own task logic
  *
  * @param compile_production different upload direction
  * @author grokonez.com
  */
class StorageService(compile_production: Boolean) {
  /** StorageService logger*/
  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)

  private val __slash = "/"
  /** upload folder name */
  final val UPLOAD_FOLDER: String = (if (compile_production) __slash else "") + "upload-dir/"

  private val rootLocation = Paths.get(UPLOAD_FOLDER)
  private final val PLAGIAT_SCRIPT_NAME = "plagiatcheck.sh"
  private final val FILE_NOT_STORED_MSG = "File could not be stored on disk"
  private final val LABEL_RESOURCE_NOT_EXIST = "Resource does not exist."
  private final val LABEL_URL_MALFORMED = "File URL is Malformed."
  private def getTaskTestFilePath(taskid: Int, testsystem_id: String): String = UPLOAD_FOLDER + __slash + taskid.toString + __slash + testsystem_id

  /**
    * Delete a submission File
    * @param taskid the task where submissions is stored
    * @param submissionid the concerning submission from one unser
    * @param filename the submitted file
    */
  def deleteSubmission(taskid: Int, submissionid: Int, filename: String): Unit = {
    val storeLocation = this.storeLocation(taskid, submissionid)
    var filePath = storeLocation
    if(filename != null){
      filePath = storeLocation.resolve(filename)
    }
    try{
      Files.delete(filePath)
    }
    catch {
      case _: NoSuchFileException => {}
    }
  }

  /**
    * store a MultipartFile stream into a file on disk
    *
    * @author grokonez.com
    * @param file a file stream
    * @param taskid the connecting task
    * @param testsystem_id testsystem id
    */
  def storeTaskTestFile(file: MultipartFile, taskid: Int, testsystem_id: String): Unit = {
    try {
      val storeLocation = Paths.get(getTaskTestFilePath(taskid, testsystem_id))
    try {
      Files.createDirectories(storeLocation)
    }
    catch {
      case _: FileAlreadyExistsException => {}
    }
      Files.copy(file.getInputStream, storeLocation.resolve(file.getOriginalFilename), StandardCopyOption.REPLACE_EXISTING)
    }
    catch {
      case e: Exception =>
        throw new RuntimeException(FILE_NOT_STORED_MSG)
    }
  }

  private def storeLocation(taskid: Int, submission_id: Int): Path = {
    Paths.get(UPLOAD_FOLDER + "/" + taskid.toString + "/submits/" + submission_id.toString)
  }

  /**
    * store a file to its belonging submission
    * @author Benjamin Manns
    * @param file file stream from users upload
    * @param taskid the connecting task
    * @param submission_id the beloning submission, what has been done
    */
  def storeTaskSubmission(file: MultipartFile, taskid: Int, submission_id: Int): Unit = {
    try {
      val storeLocation = this.storeLocation(taskid, submission_id)
      try {
        Files.createDirectories(storeLocation)
      }
      catch {
        case _: FileAlreadyExistsException => {}
      }
      try {
        Files.copy(file.getInputStream, storeLocation.resolve(file.getOriginalFilename), StandardCopyOption.REPLACE_EXISTING)
      }
      catch {
        case _: FileAlreadyExistsException => {}
      }
    }
    catch {
      case e: Exception =>
        throw new RuntimeException(FILE_NOT_STORED_MSG)
    }
  }

  /**
    * load the requested plagiat checker script
    * @param courseid unique course id
    * @return File Resource
    */
  def loadPlagiatScript(courseid: Int): Resource = try {
    val file = getPlagiatCheckerRootPath.resolve(courseid.toString).resolve(PLAGIAT_SCRIPT_NAME)
    val resource = new UrlResource(file.toUri)
    if (resource.exists || resource.isReadable) {resource}
    else {throw new RuntimeException(LABEL_RESOURCE_NOT_EXIST)}
  } catch {
    case e: MalformedURLException =>
      throw new RuntimeException(LABEL_URL_MALFORMED)
  }

  private def getPlagiatCheckerRootPath = Paths.get(UPLOAD_FOLDER).resolve("PLAGIAT_CHECKER")

  /**
    * simply store a plagiat script
    * @param file file stream from users upload
    * @param course_id the corresponding course
    */
  def storePlagiatScript(file: MultipartFile, course_id: Int): Unit = {
    try {
      val storeLocation = getPlagiatCheckerRootPath.resolve(course_id.toString)
      try {
        Files.createDirectories(storeLocation)
      }
      catch {
        case _: FileAlreadyExistsException => {}
      }
      try {
        var originalFilename = file.getOriginalFilename
        // TODO let it be dynamic
        originalFilename = PLAGIAT_SCRIPT_NAME
        Files.copy(file.getInputStream, storeLocation.resolve(originalFilename), StandardCopyOption.REPLACE_EXISTING)
      }
      catch {
        case _: FileAlreadyExistsException => {}
      }
    }
    catch {
      case e: Exception =>
        throw new RuntimeException(FILE_NOT_STORED_MSG)
    }
  }

  /**
    * store a simple string submission to its belonging submission
    * @author Benjamin Manns
    * @param file file stream from users upload
    * @param taskid the connecting task
    * @param submission_id the beloning submission, what has been done
    */
  def storeTaskSubmission(file: String, taskid: Int, submission_id: Int): Unit = {
    try {
      val storeLocation = this.storeLocation(taskid, submission_id)
      try {
        Files.createDirectories(storeLocation)
      }
      catch {
        case _: FileAlreadyExistsException => {}
      }
      try {
        val is = new ByteArrayInputStream(file.getBytes)
        Files.copy(is, storeLocation.resolve("string_submission.txt"), StandardCopyOption.REPLACE_EXISTING)
      }
      catch {
        case _: FileAlreadyExistsException => {}
      }
    }
    catch {
      case e: Exception =>
        throw new RuntimeException(FILE_NOT_STORED_MSG)
    }
  }

  /**
    * store an Array of Bytes into a file on disk
    *
    * @author Benjamin Manns
    * @param dataBytes an array of bytes which contains a file
    * @param filename the name of the requested file
    * @param taskid the connecting task
    * @param testsystem_id testsystem id
    */
  def storeTaskTestFile(dataBytes: Array[Byte], filename: String, taskid: Int, testsystem_id: String): Unit = {
    try {
      val storeLocation = Paths.get(getTaskTestFilePath(taskid, testsystem_id))
      try {
        Files.createDirectories(storeLocation)
      }
      catch {
        case _: FileAlreadyExistsException => {}
      }
      // this three lines by https://gist.github.com/tomer-ben-david/1f2611db1d0851a65d43
      val bos = new BufferedOutputStream(new FileOutputStream(storeLocation.resolve(filename).toAbsolutePath.toString))
      Stream.continually(bos.write(dataBytes))
      bos.close() // You may end up with 0 bytes file if not calling close.
    }
    catch {
      case e: Exception =>
        throw new RuntimeException(FILE_NOT_STORED_MSG)
    }
  }

  /**
    * load a file by filename and taskid
    *
    * @author grokonez.com
    * @param filename UNIX filename
    * @param taskid unique identification for a task
    * @param testsystem_id testsystem id
    * @return File Resource
    */
  def loadFile(filename: String, taskid: Int, testsystem_id: String): Resource = try {
    val storeLocation = Paths.get(getTaskTestFilePath(taskid, testsystem_id))
    val file = storeLocation.resolve(filename)
    val resource = new UrlResource(file.toUri)
    if (resource.exists || resource.isReadable) {resource}
    else {throw new RuntimeException(LABEL_RESOURCE_NOT_EXIST)}
  } catch {
    case e: MalformedURLException =>
      throw new RuntimeException(LABEL_URL_MALFORMED)
  }

  /**
    * load the submitted file of a user
    * @author grokonez.com + Benjamin Manns
    * @param filename get the filename
    * @param taskid unique identification for a task
    * @param submission_id unique identification for a submission
    * @return File Resource
    */
  def loadFileBySubmission(filename: String, taskid: Int, submission_id: Int): Resource = try {
    val storeLocation = Paths.get(UPLOAD_FOLDER + taskid.toString + "/submits/" + submission_id.toString)
    val file = storeLocation.resolve(filename)
    val resource = new UrlResource(file.toUri)
    if (resource.exists || resource.isReadable) {resource}
    else {throw new RuntimeException(LABEL_RESOURCE_NOT_EXIST)}
  } catch {
    case e: MalformedURLException =>
      throw new RuntimeException(LABEL_URL_MALFORMED)
  }

  /**
    * prepare folder for saving all files
    *
    * @author grokonez.com
    */
  def init(): Unit = {
    try
      Files.createDirectory(rootLocation)
    catch {
      case e: IOException =>
        throw new RuntimeException("Could not initialize storage!")
    }
  }
}
