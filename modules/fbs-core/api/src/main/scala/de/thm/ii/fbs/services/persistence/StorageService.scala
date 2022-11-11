package de.thm.ii.fbs.services.persistence

import java.io.{ByteArrayInputStream, File, IOException}
import java.nio.file._
import org.apache.commons.io.FileUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import io.minio.{BucketExistsArgs, GetObjectArgs, MinioClient, RemoveBucketArgs, RemoveObjectArgs}
import org.apache.commons.io.IOUtils

import scala.io.Source

/**
  * Handles file of tasks and submissions.
  */
@Component
class StorageService extends App {
  @Value("${storage.uploadDir}")
  private val uploadDir: String = null
  @Value("${minio.url}") private val minioUrl: String = null
  @Value("${minio.user}") private val minioUser: String = null
  @Value("${minio.password}") private val minioPassword: String = null

  val minioClient: MinioClient = MinioClient.builder()
    .endpoint("http://127.0.0.1", 9000, false)
    .credentials("admin", "SqfyBWhiFGr7FK60cVR2rel").build()
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
    if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
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
    val stream = minioClient.getObject(GetObjectArgs.builder().bucket(bucket).`object`(id).build())
    val content = IOUtils.toByteArray(stream)
    content.map(_.toChar).mkString
  }

  /**
    * Gets the Content of the solution file
    * @param sid Submission id
    * @return The Solution file content
    */
  def getSolutionFileFromBucket(sid: Int): String = getFileContentBucket("submissions", sid, "solution-file")

  /**
    * Gets the Content of the main file
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getMainFileFromBucket(ccid: Int): String = getFileContentBucket("tasks", ccid, "main-file")

  /**
    * Gets the Content of the secondary file
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getSecondaryFileFromBucket(ccid: Int): String = getFileContentBucket("tasks", ccid, "secondary-file")

  /**
    * Delete a main file
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
    if (!str.equals("")) {
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
    if (minioClient.bucketExists(BucketExistsArgs.builder().bucket("tasks").build())) {
      minioClient.removeObject(RemoveObjectArgs.builder().bucket("tasks").`object`(filePath).build())
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
    if (minioClient.bucketExists(BucketExistsArgs.builder().bucket("tasks").build())) {
      minioClient.removeBucket(RemoveBucketArgs.builder().bucket("tasks").build())
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
    if (minioClient.bucketExists(BucketExistsArgs.builder().bucket("submissions").build())) {
      minioClient.removeBucket(RemoveBucketArgs.builder().bucket("submissions").build())
      true
    }
    else {
      false
    }
  }
}
