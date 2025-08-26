package de.thm.ii.fbs.services.persistence.storage

import de.thm.ii.fbs.model.{CheckrunnerConfiguration, storageBucketName, storageFileName}
import de.thm.ii.fbs.services.persistence.MinioService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile

import java.io.{File, IOException}

@Component
class MinioStorageService {
  @Autowired
  private val minioService: MinioService = null

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

  def getFileContentBucket(bucketName: String, id: Int, fileName: String): String = {
    minioService.getObjectAsString(bucketName, s"$id/$fileName")
  }

  def getFileContentBucketBytes(bucketName: String, id: Int, fileName: String): Array[Byte] = {
    minioService.getObjectAsBytes(bucketName, s"$id/$fileName")
  }

  def getFileFromBucket(bucketName: String, objName: String): File =
    minioService.getObjectAsFile(bucketName, objName)

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
   * Gets the Content of the main file
   *
   * @param ccid Checkrunner id
   * @return The Solution file content
   */
  def getMainFileFromBucketAsBytes(ccid: Int): Array[Byte] =
    getFileContentBucketBytes(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid, storageFileName.MAIN_FILE)

  /**
    * Gets the Content of the secondary file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getSecondaryFileFromBucket(ccid: Int): String = getFileContentBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid, storageFileName.SECONDARY_FILE)

  /**
   * Gets the Content of the secondary file
   *
   * @param ccid Checkrunner id
   * @return The Solution file content
   */
  def getSecondaryFileFromBucketAsBytes(ccid: Int): Array[Byte] =
    getFileContentBucketBytes(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid, storageFileName.SECONDARY_FILE)

  /**
    * Delete the Configuration Folder with all Files inside
    *
    * @param ccid Checker Configuration id
    * @return True if deteled, false if not Directory exists
    * @throws IOException If the i/o operation fails
    */
  def deleteConfigurationFromBucket(ccid: Int): Unit = {
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
}
