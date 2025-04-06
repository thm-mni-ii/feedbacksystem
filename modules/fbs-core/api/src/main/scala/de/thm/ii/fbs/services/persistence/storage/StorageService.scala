package de.thm.ii.fbs.services.persistence.storage

import _root_.org.springframework.beans.factory.annotation.{Autowired, Value}
import _root_.org.springframework.stereotype.Component
import _root_.org.springframework.web.multipart.MultipartFile
import de.thm.ii.fbs.controller.exception.ResourceNotFoundException
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, Submission, storageBucketName, storageFileName}
import de.thm.ii.fbs.services.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.checker.`trait`.CheckerServiceOnDelete
import de.thm.ii.fbs.services.persistence.{MinioService, TaskService}

import java.io._
import java.nio.file._

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
  private val fsStorageService: FsStorageService = null
  @Autowired
  private val minioStorageService: MinioStorageService = null

  /**
    * gets the content of a the main File
    *
    * @param cc the Checkerunner Configuration
    */
  def getMainFileContent(cc: CheckrunnerConfiguration): String = {
    if (cc.isInBlockStorage) {
      minioStorageService.getMainFileFromBucket(cc.id)
    } else {
      fsStorageService.getMainFile(cc.id)
    }
  }

  /**
    * gets the content of a the secondary File
    *
    * @param cc the Checkerunner Configuration
    */
  def getSecondaryFileContent(cc: CheckrunnerConfiguration): String = {
    if (cc.isInBlockStorage) {
      minioStorageService.getSecondaryFileFromBucket(cc.id)
    } else {
      fsStorageService.getSecondaryFile(cc.id)
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
      minioStorageService.getSolutionFileFromBucket(submissionId)
    } else {
      fsStorageService.getSolutionFile(submissionId)
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
        minioStorageService.deleteConfigurationFromBucket(cc.id)
      } else {
        fsStorageService.deleteConfiguration(cc.id)
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
      minioStorageService.getFileFromBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getMainFilePath(config.id))
    } else {
      fsStorageService.openClone(fsStorageService.pathToMainFile(config.id).get)
    }
  }

  /**
    * returns a secondary-file depending whether it is in the bucket or not
    *
    * @param config CheckrunnerConfiguration
    * @return
    */
  def getFileSecondaryFile(config: CheckrunnerConfiguration): File = {
    if (config.isInBlockStorage) {
      minioStorageService.getFileFromBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getSecondaryFilePath(config.id))
    } else {
      fsStorageService.openClone(fsStorageService.pathToSecondaryFile(config.id).get)
    }
  }

  /**
    * returns a secondary-file depending whether it is in the bucket or not
    *
    * @param submission the Submission
    * @return
    */
  def getFileSolutionFile(submission: Submission): File = {
    if (submission.isInBlockStorage) {
      minioStorageService.getFileFromBucket(storageBucketName.SUBMISSIONS_BUCKET, storageFileName.getSolutionFilePath(submission.id))
    } else {
      fsStorageService.openClone(fsStorageService.pathToSolutionFile(submission.id).get)
    }
  }

  /**
    * returns a String which represents the content type
    *
    * @param submission the Submission
    * @return
    */
  def getContentTypeSolutionFile(submission: Submission): String = {
    if (submission.isInBlockStorage) {
      minioService.getStatsOfObject(storageBucketName.SUBMISSIONS_BUCKET, storageFileName.getSolutionFilePath(submission.id))
    } else {
      Files.probeContentType(fsStorageService.pathToSolutionFile(submission.id).get.toFile.toPath)
    }
  }

  /**
    * returns a String which represents the content type of a checker configuration
    *
    * @param checkerConfig the Checker Configuration
    * @return
    */
  def getContentTypeCheckerConfigFile(checkerConfig: CheckrunnerConfiguration, fileName: String): String = {
    if (checkerConfig.isInBlockStorage) {
      minioService.getStatsOfObject(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getFilePath(checkerConfig.id, fileName))
    } else {
      Files.probeContentType((fileName match {
        case storageFileName.MAIN_FILE => fsStorageService.pathToMainFile(checkerConfig.id)
        case storageFileName.SECONDARY_FILE => fsStorageService.pathToSecondaryFile(checkerConfig.id)
      }).get.toFile.toPath)
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

  /**
    * Stores the Configuration File
    *
    * @param cc       the Check runner Configuration
    * @param file     the File to Store
    * @param fileName the name of the file
    */
  def storeConfigurationFile(cc: CheckrunnerConfiguration, file: MultipartFile, fileName: String): Unit = {
    if (cc.isInBlockStorage) {
      minioStorageService.storeConfigurationFileInBucket(cc.id, file, fileName)
    } else {
      val tempDesc = Files.createTempFile("fbs", ".tmp")
      file.transferTo(tempDesc)
      fsStorageService.storeConfigurationFile(cc.id, tempDesc, fileName)
    }
  }

  def deleteSolution(sid: Int): Boolean = {
    minioStorageService.deleteSolutionFileFromBucket(sid) || fsStorageService.deleteSolutionFile(sid)
  }
}
