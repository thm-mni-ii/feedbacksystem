package de.thm.ii.fbs.services.persistence

import _root_.org.springframework.beans.factory.annotation.Value
import _root_.org.springframework.stereotype.Component
import _root_.org.springframework.web.multipart.MultipartFile
import org.slf4j.LoggerFactory
import io.minio._
import io.minio.http.Method
import io.minio.messages.DeleteObject

import java.io.{File, IOException}
import scala.collection.convert.ImplicitConversions.`iterable AsScalaIterable`
import scala.jdk.CollectionConverters.IterableHasAsJava

@Component
class MinioService {
  @Value("${minio.url}") private val minioUrl: String = null
  @Value("${minio.user}") private val minioUser: String = null
  @Value("${minio.password}") private val minioPassword: String = null
  @Value("${minio.port}") private val port: Integer = null

  var minioClient: MinioClient = _
  private val logger = LoggerFactory.getLogger(this.getClass)

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
    val tmpPrefix = s"${bucketName}_${objectName.replaceAll("/", "_")}"
    val tmpFile = File.createTempFile(tmpPrefix, null)
    minioClient.downloadObject(DownloadObjectArgs.builder.bucket(bucketName).`object`(objectName).filename(tmpFile.toString).build)
    tmpFile
  }

  /**
    * Delete a an object from the bucket.
    * Warning: It is not possible to delete folders with this method, use `deleteFolder` instead.
    *
    * @param bucketName the name of the Bucket to delete
    * @param objectName the name of the Object to delete
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteObject(bucketName: String, objectName: String): Unit = {
    minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).`object`(objectName).build())
  }

  /**
    * Delete a an folder from the bucket
    *
    * @param bucketName the name of the Bucket to delete
    * @param folderName the name of the folder to delete
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteFolder(bucketName: String, folderName: String): Unit = {
    val toDelete = minioClient.listObjects(ListObjectsArgs.builder().bucket(bucketName).prefix(folderName).recursive(true).build())
    val objects = toDelete.map(o => new DeleteObject(o.get().objectName())).asJava

    val results = minioClient.removeObjects(RemoveObjectsArgs.builder().bucket(bucketName).objects(objects).build())
    results.foreach(e => {
      val error = e.get()
      logger.error(s"Error in deleting object ${error.objectName()}; ${error.message()}")
    })
  }

  def bucketExists(bucketName: String): Boolean = {
    minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())
  }

  /**
    * generates a pre signed get url for the given object
    *
    * @param bucketName the name of the Bucket to generate a presigned url for
    * @param objectName the name of the Object to generate a presigned url for
    * @param expiry     Seconds after the URL has expired (default 24h)
    * @return a presigned url for a get request
    */
  def generatePresignedGetUrl(bucketName: String, objectName: String, expiry: Int = 24 * 60 * 60): String = {
    minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder().method(Method.GET)
      .bucket(bucketName).`object`(objectName).expiry(expiry).build())
  }

  /**
    * generates a pre signed put url for the given object
    *
    * @param bucketName the name of the Bucket to generate a presigned url for
    * @param objectName the name of the Object to generate a presigned url for
    * @param expiry     Seconds after the URL has expired (default 24h)
    * @return a presigned url for a put request
    */
  def generatePresignedUrlPut(bucketName: String, objectName: String, expiry: Int = 24 * 60 * 60): String = {
    minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder().method(Method.PUT)
      .bucket(bucketName).`object`(objectName).expiry(expiry).build())
  }
}
