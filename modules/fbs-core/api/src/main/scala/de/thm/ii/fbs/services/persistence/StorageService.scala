package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.model.CheckrunnerConfiguration
import de.thm.ii.fbs.services.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.checker.`trait`.CheckerServiceOnDelete

import java.io.{ByteArrayInputStream, File, FileOutputStream, IOException}
import java.nio.file._
import org.apache.commons.io.FileUtils
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component
import io.minio.{BucketExistsArgs, DownloadObjectArgs, GetObjectArgs, MakeBucketArgs, RemoveBucketArgs, RemoveObjectArgs, StatObjectArgs, UploadObjectArgs}
import org.springframework.web.multipart.MultipartFile

import scala.io.Source

/**
  * Handles file of tasks and submissions.
  */
@Component
class StorageService extends App {
  @Autowired
  private val minioService: MinioService = null
  @Autowired
  private val checkerService: CheckerServiceFactoryService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val ccs: CheckerConfigurationService = null


  @Value("${storage.uploadDir}")
  private val uploadDir: String = null
  @Value("${minio.url}") private val minioUrl: String = null
  @Value("${minio.user}") private val minioUser: String = null
  @Value("${minio.password}") private val minioPassword: String = null

  private def uploadDirPath: Path = Path.of(uploadDir)

  private def tasksDir(tid: Int) = uploadDirPath.resolve("tasks").resolve(String.valueOf(tid))

  private def submissionDir(sid: Int) = uploadDirPath.resolve("submissions").resolve(String.valueOf(sid))

  private def getFileContent(path: Option[Path]): String = {
    if (path.isDefined) {
      val source = Source.fromFile(path.get.toFile)

      try {
        source.mkString
      } finally {
        source.close()
      }
    } else {
      ""
    }
  }

  /**
    * Store (replace if exists) the main file of a task
    *
    * @param tid Task id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeMainFile(tid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(tasksDir(tid)).resolve("main-file"), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the secondary file of a task
    *
    * @param tid Task id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSecondaryFile(tid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(tasksDir(tid)).resolve("secondary-file"), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the solution file a submission
    *
    * @param sid Submission id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSolutionFile(sid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(submissionDir(sid)).resolve("solution-file"), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the solution file a submission
    *
    * @param sid Submission id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSolutionFileInBucket(sid: Int, file: MultipartFile): Unit = {
    val bucketName = "submissions"
    if (!minioService.minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
      minioService.minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build())
    }
    val tempDesc = Files.createTempFile("solution-file", ".tmp")
    file.transferTo(tempDesc)
    minioService.minioClient.uploadObject(UploadObjectArgs.builder().bucket(bucketName).`object`(s"$sid/solution-file").filename(tempDesc.toString).build())
  }


  /**
    * Get the path to the main file of a task
    *
    * @param tid Task id
    * @return The path to the file
    */
  def pathToMainFile(tid: Int): Option[Path] = Option(tasksDir(tid).resolve("main-file")).filter(Files.exists(_))

  /**
    * Get the path to the secondary file of a task
    *
    * @param tid Task id
    * @return The path to the file
    */
  def pathToSecondaryFile(tid: Int): Option[Path] = Option(tasksDir(tid).resolve("secondary-file")).filter(Files.exists(_))

  /**
    * Get the path to the solution file of a submission
    *
    * @param sid Submission id
    * @return The path to the file
    */
  def pathToSolutionFile(sid: Int): Option[Path] = Option(submissionDir(sid).resolve("solution-file")).filter(Files.exists(_))

  /**
    * Get the path to the subtask file of a submission
    *
    * @param sid Submission id
    * @return The path to the file
    */
  def pathToSubTaskFile(sid: Int): Option[Path] = Option(submissionDir(sid).resolve("subtask-file"))

  /**
    * Gets the Content of the solution file
    *
    * @param sid Submission id
    * @return The Solution file content
    */
  def getSolutionFile(sid: Int): String = getFileContent(pathToSolutionFile(sid))

  /**
    * Gets the Content of the main file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getMainFile(ccid: Int): String = getFileContent(pathToMainFile(ccid))

  /**
    * Gets the Content of the secondary file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getSecondaryFile(ccid: Int): String = getFileContent(pathToSecondaryFile(ccid))

  /**
    * Delete a main file
    *
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteMainFile(tid: Int): Boolean = pathToMainFile(tid).exists(Files.deleteIfExists)

  /**
    * Delete a secondary file
    *
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteSecondaryFile(tid: Int): Boolean = pathToSecondaryFile(tid).exists(Files.deleteIfExists)

  /**
    * Delete the Configuration Folder with all Files inside
    *
    * @param tid Task id
    * @return True if deteled, false if not Directory exists
    * @throws IOException If the i/o operation fails
    */
  def deleteConfiguration(tid: Int): Boolean = {
    deleteFolder(tasksDir(tid))
  }

  /**
    * Delete a solution file
    *
    * @param sid Submission id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteSolutionFile(sid: Int): Boolean = deleteFolder(submissionDir(sid))

  private def deleteFolder(path: Path) = {
    val confDir = path.toFile

    if (confDir.exists() && confDir.isDirectory) {
      FileUtils.deleteDirectory(confDir)
      true
    } else {
      false
    }
  }

  def getFileContentBucket(bucketName: String, id: Int, fileName: String): String = {
    // muss ein bucket angelegt werden oder geschieht dies automatisch beim hinzufügen zu einem bucketName
    if (!minioService.minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
      ""
    } else {
      val concat = id.toString + "/" + fileName
      get(bucketName, concat)
    }
  }

  /**
    * Get object from minio storage
    *
    * @param bucket bucket name
    * @param id     object it
    */
  private def get(bucket: String, id: String): String = {
    // get object as byte array
    try {
      val stream = minioService.minioClient.getObject(GetObjectArgs.builder().bucket(bucket).`object`(id).build())
      val content = stream.readAllBytes()
      val t = content.map(_.toChar)
      t.mkString
    } catch {
      case e: Exception => ""
    }
  }

  def getFileFromBucket(bucketName: String, objName: String, tmpFile: String): Unit = {
/*
    val tmpFile = new File("temp-file")
    minioService.minioClient.downloadObject(DownloadObjectArgs.builder.bucket(bucketName).`object`(objName).filename("temp-file").build)
    tmpFile
*/

    minioService.minioClient.downloadObject(DownloadObjectArgs.builder.bucket(bucketName).`object`(objName).filename(tmpFile).build)
  }

  /**
    * Gets the Content of the solution file
    *
    * @param sid Submission id
    * @return The Solution file content
    */
  def getSolutionFileFromBucket(sid: Int): String = getFileContentBucket("submissions", sid, "solution-file")

  /**
    * Gets the Content of the main file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getMainFileFromBucket(ccid: Int): String = getFileContentBucket("tasks", ccid, "main-file")

  /**
    * Gets the Content of the secondary file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getSecondaryFileFromBucket(ccid: Int): String = getFileContentBucket("tasks", ccid, "secondary-file")

  /**
    * Delete a main file
    *
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteMainFileFromBucket(tid: Int): Boolean = {
    val str = getMainFileFromBucket(tid)
    if (!str.equals("")) {
      // remove obj from bucket
      val path = tid.toString + "/main-file"
      deleteFileFromBucket(path)
    }
    true
  }

  /**
    * Delete a secondary file
    *
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteSecondaryFileFromBucket(tid: Int): Boolean = {
    val str = getSecondaryFileFromBucket(tid)
    if (!str.equals("")) { // check ob existiert
      // remove obj from bucket
      val path = tid.toString + "/secondary-file"
      deleteFileFromBucket(path)
    }
    true
  }

  /**
    * Delete a secondary file
    *
    * @param filePath path aus id und filename
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteFileFromBucket(filePath: String): Unit = {
    // remove obj from bucket
    if (minioService.minioClient.bucketExists(BucketExistsArgs.builder().bucket("tasks").build())) {
      minioService.minioClient.removeObject(RemoveObjectArgs.builder().bucket("tasks").`object`(filePath).build())
    }
  }


  /**
    * Delete the Configuration Folder with all Files inside
    *
    * @param tid Task id
    * @return True if deteled, false if not Directory exists
    * @throws IOException If the i/o operation fails
    */
  def deleteConfigurationFromBucket(tid: Int): Boolean = {
    if (minioService.minioClient.bucketExists(BucketExistsArgs.builder().bucket("tasks").build())) {
      minioService.minioClient.removeBucket(RemoveBucketArgs.builder().bucket("tasks").build())
      true
    }
    else {
      false
    }
  }

  /**
    * Delete a solution file
    *
    * @param sid Submission id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteSolutionFileFromBucket(sid: Int): Boolean = {
    if (minioService.minioClient.bucketExists(BucketExistsArgs.builder().bucket("submissions").build())) {
      val str = getSolutionFileFromBucket(sid)
      if (!str.equals("")) {
        minioService.minioClient.removeObject(RemoveObjectArgs.builder().bucket("submissions").`object`(s"$sid/solution-file").build())
      }
      true
    }
    else {
      false
    }
  }

  /**
    * Deletes the configuration files from minio or FS and the DB entry
    *
    * @param tid  task id
    * @param cid  course id
    * @param ccid checker config id
    * @param cc   checker config cc.id == ccid ??
    * @throws
    * @return
    */
  @throws[IOException]
  def deleteAllConfigurations(tid: Int, cid: Int, ccid: Int, cc: CheckrunnerConfiguration): Boolean = {
    try {
      if (ccs.delete(cid, tid, ccid)) {
        if (cc.isInBlockStorage) {
          deleteSecondaryFileFromBucket(tid)
          deleteMainFileFromBucket(tid)
          //storageService.deleteConfigurationFromBucket(ccid)
        } else {
          // FS
          deleteSecondaryFile(tid)
          deleteMainFile(tid)
          //storageService.deleteConfiguration(ccid)
        }
        notifyCheckerDelete(tid, cc)
      }
      true
    }
    catch {
      case e: Exception => false
    }
  }

  private def notifyCheckerDelete(tid: Int, cc: CheckrunnerConfiguration): Unit = {
    val checker = checkerService(cc.checkerType)
    checker match {
      case change: CheckerServiceOnDelete =>
        change.onCheckerConfigurationDelete(taskService.getOne(tid).get, cc)
      case _ =>
    }
  }
}
