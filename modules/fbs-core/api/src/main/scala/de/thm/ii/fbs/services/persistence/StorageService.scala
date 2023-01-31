package de.thm.ii.fbs.services.persistence

import _root_.org.apache.commons.io.FileUtils
import _root_.org.springframework.beans.factory.annotation.{Autowired, Value}
import _root_.org.springframework.stereotype.Component
import _root_.org.springframework.web.multipart.MultipartFile
import de.thm.ii.fbs.controller.exception.ResourceNotFoundException
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, storageBucketName, storageFileName}
import de.thm.ii.fbs.services.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.checker.`trait`.CheckerServiceOnDelete

import java.io._
import java.nio.file._
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

  @Value("${storage.uploadDir}")
  private val uploadDir: String = null

  private def uploadDirPath: Path = Path.of(uploadDir)

  private def tasksDir(tid: Int) = uploadDirPath.resolve(storageBucketName.CHECKER_CONFIGURATION_FOLDER).resolve(String.valueOf(tid))

  private def submissionDir(sid: Int) = uploadDirPath.resolve(storageBucketName.SUBMISSIONS_BUCKET).resolve(String.valueOf(sid))

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

  @throws[IOException]
  def storeConfigurationFile(tid: Int, src: Path, fileName: String): Unit =
    Files.move(src, Files.createDirectories(tasksDir(tid)).resolve(fileName), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the solution file a submission
    *
    * @param sid Submission id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSolutionFile(sid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(submissionDir(sid)).resolve(storageFileName.SOLUTION_FILE), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the solution file a submission
    *
    * @param sid  Submission id
    * @param file the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSolutionFileInBucket(sid: Int, file: MultipartFile): Unit =
    minioService.putObject(file, storageFileName.getSolutionFilePath(sid), storageBucketName.SUBMISSIONS_BUCKET)

  @throws[IOException]
  def storeConfigurationFileInBucket(ccid: Int, file: MultipartFile, fileName: String): Unit =
    minioService.putObject(file, storageFileName.getFilePath(ccid, fileName), storageBucketName.CHECKER_CONFIGURATION_BUCKET)

  /**
    * Get the path to the main file of a task
    *
    * @param tid Task id
    * @return The path to the file
    */
  def pathToMainFile(tid: Int): Option[Path] = Option(tasksDir(tid).resolve(storageFileName.MAIN_FILE)).filter(Files.exists(_))

  /**
    * Get the path to the secondary file of a task
    *
    * @param tid Task id
    * @return The path to the file
    */
  def pathToSecondaryFile(tid: Int): Option[Path] = Option(tasksDir(tid).resolve(storageFileName.SECONDARY_FILE)).filter(Files.exists(_))

  /**
    * Get the path to the solution file of a submission
    *
    * @param sid Submission id
    * @return The path to the file
    */
  def pathToSolutionFile(sid: Int): Option[Path] = Option(submissionDir(sid).resolve(storageFileName.SOLUTION_FILE)).filter(Files.exists(_))

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

  def deleteSolution(sid: Int): Boolean = {
    deleteSolutionFileFromBucket(sid) || deleteSolutionFile(sid)
  }

  def getFileContentBucket(bucketName: String, id: Int, fileName: String): String = {
    minioService.getObjectAsString(bucketName, s"$id/$fileName")
  }

  def getFileFromBucket(bucketName: String, objName: String): File =
    minioService.getObjectAsFile(bucketName, objName)

  /**
    * gets the content of a the main File
    *
    * @param cc the Checkerunner Configuration
    */
  def getMainFileContent(cc: CheckrunnerConfiguration): String = {
    if (cc.isInBlockStorage) {
      getMainFileFromBucket(cc.id)
    } else {
      getMainFile(cc.id)
    }
  }

  /**
    * gets the content of a the secondary File
    *
    * @param cc the Checkerunner Configuration
    */
  def getSecondaryFileContent(cc: CheckrunnerConfiguration): String = {
    if (cc.isInBlockStorage) {
      getSecondaryFileFromBucket(cc.id)
    } else {
      getSecondaryFile(cc.id)
    }
  }

  /**
    * gets the content of a file depending on the source
    *
    * @param isInBlockStorage True if the content is the Minio
    * @param submissionId     submission id
    * @return
    */
  def getSolutionFileContent(isInBlockStorage: Boolean, submissionId: Int): String = {
    if (isInBlockStorage) {
      getSolutionFileFromBucket(submissionId)
    } else {
      getSolutionFile(submissionId)
    }
  }

  /**
    * Gets the Content of the solution file
    *
    * @param sid Submission id
    * @return The Solution file content
    */
  def getSolutionFileFromBucket(sid: Int): String = getFileContentBucket(storageBucketName.SUBMISSIONS_BUCKET, sid, storageFileName.SOLUTION_FILE)

  /**
    * Gets the Content of the main file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getMainFileFromBucket(ccid: Int): String = getFileContentBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid, storageFileName.MAIN_FILE)

  /**
    * Gets the Content of the secondary file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getSecondaryFileFromBucket(ccid: Int): String = getFileContentBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid, storageFileName.SECONDARY_FILE)

  /**
    * Delete the Configuration Folder with all Files inside
    *
    * @param ccid Checker Configuration id
    * @return True if deteled, false if not Directory exists
    * @throws IOException If the i/o operation fails
    */
  private def deleteConfigurationFromBucket(ccid: Int): Unit = {
    minioService.deleteFolder(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid.toString)
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
    try {
      minioService.deleteFolder(storageBucketName.SUBMISSIONS_BUCKET, sid.toString)
      true
    } catch {
      case _: Throwable => false
    }
  }

  /**
    * Deletes the configuration files from minio or FS and the DB entry
    *
    * @param tid task id
    * @param cid course id
    * @param cc  checker configuration
    * @throws IOException If the i/o operation fails
    * @return
    */
  @throws[IOException]
  def deleteAllConfigurations(tid: Int, cid: Int, cc: CheckrunnerConfiguration): Boolean = {
    try {
      if (cc.isInBlockStorage) {
        deleteConfigurationFromBucket(cc.id)
      } else {
        deleteConfiguration(cc.id)
      }
      notifyCheckerDelete(tid, cc)
      true
    }
    catch {
      case e: Exception => false
    }
  }

  /**
    * returns a main-file depending whether it is in the bucket or not
    *
    * @param config CheckrunnerConfiguration
    * @return
    */
  def getFileMainFile(config: CheckrunnerConfiguration): File = {
    if (config.isInBlockStorage) {
      getFileFromBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getMainFilePath(config.id))
    } else {
      val path = pathToMainFile(config.id).get.toString
      new File(path)
    }
  }

  /**
    * returns a secondary-file depending whether it is in the bucket or not
    *
    * @param config CheckrunnerConfiguration
    * @return
    */
  def getFileSolutionFile(config: CheckrunnerConfiguration, sid: Int): File = {
    if (config.isInBlockStorage) {
      getFileFromBucket(storageBucketName.SUBMISSIONS_BUCKET, storageFileName.getSolutionFilePath(sid))
    } else {
      val path = pathToSolutionFile(config.id).get.toString
      new File(path)
    }
  }

  /**
    * returns a input stream depending whether it is in the bucket or not
    *
    */
  def getFileContentStream(pathFn: Int => Option[Path])(isInBlockStorage: Boolean, ccid: Int, fileName: String): InputStream = {
    if (isInBlockStorage) {
      new ByteArrayInputStream(minioService.getObjectAsBytes(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getFilePath(ccid, fileName)))
    } else {
      pathFn(ccid) match {
        case Some(mainFilePath) =>
          new FileInputStream(mainFilePath.toFile)
        case _ => throw new ResourceNotFoundException()
      }
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

  def urlToSolutionFile(submissionID: Int): String = {
    minioService.generatePresignedGetUrl(storageBucketName.SUBMISSIONS_BUCKET, storageFileName.getSolutionFilePath(submissionID))
  }

  def urlToMainFile(cc: CheckrunnerConfiguration): Option[String] = {
    if (cc.mainFileUploaded) {
      val url = minioService.generatePresignedGetUrl(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getMainFilePath(cc.id))
      Option(url)
    } else {
      None
    }
  }

  def urlToSecondaryFile(cc: CheckrunnerConfiguration): Option[String] = {
    if (cc.secondaryFileUploaded) {
      val url = minioService.generatePresignedGetUrl(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getSecondaryFilePath(cc.id))
      Option(url)
    } else {
      None
    }
  }

  /**
    * Stores the Configuration File
    *
    * @param cc       the Check runner Configuration
    * @param file     the File to Store
    * @param fileName the name of the file
    */
  def storeConfigurationFile(cc: CheckrunnerConfiguration, file: MultipartFile, fileName: String): Unit = {
    if (cc.isInBlockStorage) {
      this.storeConfigurationFileInBucket(cc.id, file, fileName)
    } else {
      val tempDesc = Files.createTempFile("fbs", ".tmp")
      file.transferTo(tempDesc)
      this.storeConfigurationFile(cc.id, tempDesc, fileName)
    }
  }
}
