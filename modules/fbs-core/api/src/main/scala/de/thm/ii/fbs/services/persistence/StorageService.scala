package de.thm.ii.fbs.services.persistence

import java.io.{ByteArrayInputStream, File, IOException}
import java.nio.file._
import org.apache.commons.io.FileUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import io.minio.{BucketExistsArgs, GetObjectArgs, MinioClient, RemoveBucketArgs, RemoveObjectArgs}
import org.apache.commons.io.IOUtils

import java.nio.charset.StandardCharsets
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

  private def uploadDirPath: Path = Path.of(uploadDir)

  val minioClient = MinioClient.builder().endpoint(minioUrl).credentials(minioUser, minioPassword).build()

  private def tasksDir(tid: Int) = uploadDirPath.resolve("tasks").resolve(String.valueOf(tid))
  private def submissionDir(sid: Int) = uploadDirPath.resolve("submissions").resolve(String.valueOf(sid))

  private def getFileContent(bucketName: String, id: Int, fileName: String): String = {
    // gibt es bucket schon?
    // muss ein bucket angelegt werden oder geschieht dies automatisch beim hinzufügen zu einem bucketName
    if (minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
      val concat = id.toString + "/" + fileName
      get(bucketName, concat)
    } else {
      ""
    }
  }

  /**
    * Get object from minio storage
    *
    * @param bucket bucket name
    * @param id     object it
    */
  def get(bucket: String, id: String): String = {
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
  def getSolutionFile(sid: Int): String = getFileContent("submissions", sid, "solution-file")

  /**
    * Gets the Content of the main file
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getMainFile(ccid: Int): String = getFileContent("tasks", ccid, "main-file")

  /**
    * Gets the Content of the secondary file
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getSecondaryFile(ccid: Int): String = getFileContent("tasks", ccid, "secondary-file")

  /**
    * Delete a main file
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteMainFile(tid: Int): Boolean = {
    val str = getMainFile(tid)
    if (!str.equals("")) {
      // remove obj from bucket
      val path = tid.toString + "/main-file"
      deleteFile(path)
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
  def deleteSecondaryFile(tid: Int): Boolean = {
    val str = getSecondaryFile(tid)
    if (!str.equals("")) {
      // remove obj from bucket
      val path = tid.toString + "/secondary-file"
      deleteFile(path)
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
  def deleteFile(filePath: String): Unit = {
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
  def deleteConfiguration(tid: Int): Boolean = {
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
  def deleteSolutionFile(sid: Int): Boolean = {
    if (minioClient.bucketExists(BucketExistsArgs.builder().bucket("submissions").build())) {
      minioClient.removeBucket(RemoveBucketArgs.builder().bucket("submissions").build())
      true
    }
    else {
      false
    }
  }
}
