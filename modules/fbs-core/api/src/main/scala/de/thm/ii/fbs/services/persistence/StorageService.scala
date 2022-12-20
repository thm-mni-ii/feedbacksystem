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
  @Autowired
  private val ccs: CheckrunnerConfigurationService = null

  @Value("${storage.uploadDir}")
  private val uploadDir: String = null

  private def uploadDirPath: Path = Path.of(uploadDir)

  private def tasksDir(tid: Int) = uploadDirPath.resolve(storageBucketName.CHECKER_CONFIGURATION_BUCKET).resolve(String.valueOf(tid))

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

  /**
    * Store (replace if exists) the main file of a task
    *
    * @param tid Task id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeMainFile(tid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(tasksDir(tid)).resolve(storageFileName.MAIN_FILE), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the secondary file of a task
    *
    * @param tid Task id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSecondaryFile(tid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(tasksDir(tid)).resolve(storageFileName.SECONDARY_FILE), StandardCopyOption.REPLACE_EXISTING)

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
    * Gets the Content of the subtask file
    *
    * @param ccid Checkrunner id
    * @return
    */
  def getSubTaskFromBucket(ccid: Int): String = getFileContentBucket(storageBucketName.SUBMISSIONS_BUCKET, ccid, storageFileName.SUBTASK_FILE)

  /**
    * Delete the Configuration Folder with all Files inside
    *
    * @param ccid Checker Configuration id
    * @return True if deteled, false if not Directory exists
    * @throws IOException If the i/o operation fails
    */
  def deleteConfigurationFromBucket(ccid: Int): Unit = {
    minioService.deleteObject(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid.toString)
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
    minioService.deleteObject(storageBucketName.SUBMISSIONS_BUCKET, sid.toString)
    true
  }

  /**
    * Deletes the configuration files from minio or FS and the DB entry
    *
    * @param tid  task id
    * @param cid  course id
    * @param ccid checker config id
    * @param cc   checker config cc.id == ccid ??
    * @throws IOException If the i/o operation fails
    * @return
    */
  @throws[IOException]
  def deleteAllConfigurations(tid: Int, cid: Int, ccid: Int, cc: CheckrunnerConfiguration): Boolean = {
    try {
      if (ccs.delete(cid, tid, ccid)) {
        if (cc.isInBlockStorage) {
          deleteConfigurationFromBucket(ccid)
        } else {
          deleteConfiguration(ccid)
        }
        notifyCheckerDelete(tid, cc)
      }
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
  def getFileContentStream(pathFn: Int => Option[Path])(isInBlockStorage: Boolean, ccid: Int, tid: Int, fileName: String): InputStream = {
    if (isInBlockStorage) {
      new ByteArrayInputStream(minioService.getObjectAsBytes(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getFilePath(tid, fileName)))
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
}
