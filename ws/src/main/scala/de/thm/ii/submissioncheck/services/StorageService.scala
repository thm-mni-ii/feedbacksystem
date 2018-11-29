package de.thm.ii.submissioncheck.services

import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import java.net.MalformedURLException

import org.springframework.util.FileSystemUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.nio.file.Paths
import org.springframework.web.multipart.MultipartFile
import java.io.{BufferedOutputStream, FileOutputStream, IOException}
import java.nio.file.Files
import de.thm.ii.submissioncheck.model.User

/**
  * More or less copy paste from https://grokonez.com/frontend/angular/angular-4-uploadget-multipartfile-tofrom-spring-boot-server
  * and integrate own task logic
  *
  * @author grokonez.com
  */
class StorageService {
  /** StorageService logger*/
  val log: Logger = LoggerFactory.getLogger(this.getClass.getName)
  /** upload folder name */
  final val UPLOAD_FOLDER: String = "upload-dir"

  private val rootLocation = Paths.get(UPLOAD_FOLDER)

  private final val FILE_NOT_STORED_MSG = "File could not be stored on disk"

  private def getTaskTestFilePath(taskid: Int): String = UPLOAD_FOLDER + "/" + taskid.toString

  /**
    * store a MultipartFile stream into a file on disk
    *
    * @author grokonez.com
    * @param file a file stream
    * @param taskid the connecting task
    */
  def storeTaskTestFile(file: MultipartFile, taskid: Int): Unit = {
    try {
      val storeLocation = Paths.get(getTaskTestFilePath(taskid))
      Files.createDirectory(storeLocation)
      Files.copy(file.getInputStream, storeLocation.resolve(file.getOriginalFilename))
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
    */
  def storeTaskTestFile(dataBytes: Array[Byte], filename: String, taskid: Int): Unit = {
    try {
      val storeLocation = Paths.get(getTaskTestFilePath(taskid))
      Files.createDirectory(storeLocation)
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
    * store a task submission file of a user to the local syste
    * @author Benjamin Manns
    * @param dataBytes requetes file as byte array
    * @param taskid unique identification for a task
    * @param filename filename of user request
    * @param submission_id unique identification for a submission
    */
  def storeTaskSubmission(dataBytes: Array[Byte], taskid: Int, filename: String, submission_id: Int): Unit = {
    try {
      val storeLocation = Paths.get(UPLOAD_FOLDER + "/" + taskid.toString + "/submits/" + submission_id.toString)
      Files.createDirectories(storeLocation)
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
    * @return File Resource
    */
  def loadFile(filename: String, taskid: Int): Resource = try {
    val storeLocation = Paths.get(getTaskTestFilePath(taskid))
    val file = storeLocation.resolve(filename)
    val resource = new UrlResource(file.toUri)
    if (resource.exists || resource.isReadable) {resource}
    else {throw new RuntimeException("Resource does not exist.")}
  } catch {
    case e: MalformedURLException =>
      throw new RuntimeException("File URL is Malformed.")
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
    val storeLocation = Paths.get("upload-dir/" + taskid.toString + "/submits/" + submission_id.toString)
    val file = storeLocation.resolve(filename)
    val resource = new UrlResource(file.toUri)
    if (resource.exists || resource.isReadable) {resource}
    else {throw new RuntimeException("Resource does not exist.")}
  } catch {
    case e: MalformedURLException =>
      throw new RuntimeException("File URL is Malformed.")
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
