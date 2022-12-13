package de.thm.ii.fbs.services.persistence

import _root_.org.springframework.beans.factory.annotation.Value
import _root_.org.springframework.stereotype.Component
import _root_.org.springframework.web.multipart.MultipartFile
import io.minio._

import java.io.{File, IOException}

@Component
class MinioService {
  @Value("${minio.url}") private val minioUrl: String = null
  @Value("${minio.user}") private val minioUser: String = null
  @Value("${minio.password}") private val minioPassword: String = null
  @Value("${minio.port}") private val port: Integer = null

  var minioClient: MinioClient = _

  /**
    * initialize Minio Client
    */
  def initialMinio(): Unit = {
    minioClient = MinioClient.builder()
      .endpoint(minioUrl, port, false)
      .credentials(minioUser, minioPassword).build()
  }

  /**
    * Create a Bucket if it does exist
    *
    * @param bucketName the Name of the Bucket
    */
  def createBucketIfNotExists(bucketName: String): Unit = {
    if (!bucketExists(bucketName)) {
      minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build())
    }
  }

  /**
    * Upload an File to minio
    *
    * @param file       the File to upload
    * @param objectName the Name of the Object
    * @param bucket     the Name of the Bucket
    */
  def putObject(file: MultipartFile, objectName: String, bucket: String): Unit = {
    val inputStream = file.getInputStream
    minioClient.putObject(PutObjectArgs.builder().contentType(file.getContentType)
      .bucket(bucket).`object`(objectName).stream(inputStream, file.getSize, -1).build())
    inputStream.close()
  }

  /**
    * Get object from minio storage as String
    *
    * @param bucketName bucket name
    * @param objectName object name
    */
  def getObjectAsString(bucketName: String, objectName: String): String = {
    try {
      val stream = minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).`object`(objectName).build())
      val content = stream.readAllBytes()
      val t = content.map(_.toChar)
      t.mkString
    } catch {
      case e: Exception => ""
    }
  }

  /**
    * Get object from minio storage as byte Array
    *
    * @param bucketName bucket name
    * @param objectName object name
    */
  def getObjectAsBytes(bucketName: String, objectName: String): Array[Byte] = {
    try {
      val stream = minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).`object`(objectName).build())
      stream.readAllBytes()
    } catch {
      case e: Exception => Array()
    }
  }

  /**
    * Get object from minio storage as File
    *
    * @param bucketName the name of the Bucket to get
    * @param objectName the name of the Object to get
    * @return the file
    */
  def getObjectAsFile(bucketName: String, objectName: String): File = {
    val tmpFile = File.createTempFile(bucketName, objectName)
    minioClient.downloadObject(DownloadObjectArgs.builder.bucket(bucketName).`object`(objectName).filename(tmpFile.toString).build)
    tmpFile
  }

  /**
    * Delete a an object from the bucket
    *
    * @param bucketName the name of the Bucket to delete
    * @param objectName the name of the Object to delete
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteObject(bucketName: String, objectName: String): Unit = {
    if (bucketExists(bucketName)) {
      minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).`object`(objectName).build())
    }
  }

  def bucketExists(bucketName: String): Boolean = {
    minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())
  }
}
