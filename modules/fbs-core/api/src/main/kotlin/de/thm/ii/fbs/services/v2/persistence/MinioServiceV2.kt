package de.thm.ii.fbs.services.v2.persistence

import io.minio.BucketExistsArgs
import io.minio.DownloadObjectArgs
import io.minio.GetObjectArgs
import io.minio.GetPresignedObjectUrlArgs
import io.minio.ListObjectsArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs
import io.minio.RemoveObjectArgs
import io.minio.RemoveObjectsArgs
import io.minio.http.Method
import io.minio.messages.DeleteObject
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.IOException
import kotlin.jvm.Throws

@Component
class MinioServiceV2 {
    @Value("\${minio.url}")
    lateinit var minioUrl: String
    @Value("\${minio.user}")
    lateinit var minioUser: String
    @Value("\${minio.password}")
    lateinit var minioPassword: String
    @Value("\${minio.port}")
    private var port: Int = 0

    private lateinit var minioClient: MinioClient
    private val logger = LoggerFactory.getLogger(this.javaClass)

    /**
     * initialize Minio Client
     */
    fun initialMinio() {
        minioClient = MinioClient.builder()
            .endpoint(minioUrl, port, false)
            .credentials(minioUser, minioPassword).build()
    }

    /**
     * Create a Bucket if it does exist
     *
     * @param bucketName the Name of the Bucket
     */
    fun createBucketIfNotExists(bucketName: String) {
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
    fun putObject(file: MultipartFile, objectName: String, bucket: String) {
        val inputStream = file.inputStream
        minioClient.putObject(
            PutObjectArgs.builder().contentType(file.contentType)
            .bucket(bucket).`object`(objectName).stream(inputStream, file.size, -1).build()
        )
        inputStream.close()
    }

    /**
     * Get object from minio storage as String
     *
     * @param bucketName bucket name
     * @param objectName object name
     */
    fun getObjectAsString(bucketName: String, objectName: String): String {
        return try {
            val stream = minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).`object`(objectName).build())
            stream.bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            ""
        }
    }

    /**
     * Get object from minio storage as byte Array
     *
     * @param bucketName bucket name
     * @param objectName object name
     */
    fun getObjectAsBytes(bucketName: String, objectName: String): Array<Byte> {
        return try {
            val stream = minioClient.getObject(GetObjectArgs.builder().bucket(bucketName).`object`(objectName).build())
            stream.readAllBytes().toTypedArray()
        } catch (e: Exception) {
            arrayOf()
        }
    }

    /**
     * Get object from minio storage as File
     *
     * @param bucketName the name of the Bucket to get
     * @param objectName the name of the Object to get
     * @return the file
     */
    fun getObjectAsFile(bucketName: String, objectName: String): File {
        val tmpPrefix = "${bucketName}_${objectName.replace("/", "_")}"
        val tmpFile = File.createTempFile(tmpPrefix, null)
        minioClient.downloadObject(DownloadObjectArgs.builder().bucket(bucketName).`object`(objectName).filename(tmpFile.toString()).build())
        return tmpFile
    }

    /**
     * Delete a an object from the bucket.
     * Warning: It is not possible to delete folders with this method, use `deleteFolder` instead.
     *
     * @param bucketName the name of the Bucket to delete
     * @param objectName the name of the Object to delete
     * @throws IOException If the i/o operation fails
     */
    @Throws(IOException::class)
    fun deleteObject(bucketName: String, objectName: String) {
        minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucketName).`object`(objectName).build())
    }

    /**
     * Delete a an folder from the bucket
     *
     * @param bucketName the name of the Bucket to delete
     * @param folderName the name of the folder to delete
     * @throws IOException If the i/o operation fails
     */
    @Throws(IOException::class)
    fun deleteFolder(bucketName: String, folderName: String) {
        val toDelete = minioClient.listObjects(ListObjectsArgs.builder().bucket(bucketName).prefix(folderName).recursive(true).build())
        val objects = toDelete.map { o -> DeleteObject(o.get().objectName()) }

        val results = minioClient.removeObjects(RemoveObjectsArgs.builder().bucket(bucketName).objects(objects).build())
        results.forEach { e ->
            run {
                val error = e.get()
                logger.error("Error in deleting object ${error.objectName()}; ${error.message()}")
            }
        }
    }

    fun bucketExists(bucketName: String): Boolean {
        return minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())
    }

    /**
     * generates a pre signed get url for the given object
     *
     * @param bucketName the name of the Bucket to generate a presigned url for
     * @param objectName the name of the Object to generate a presigned url for
     * @param expiry     Seconds after the URL has expired (default 24h)
     * @return a presigned url for a get request
     */
    fun generatePresignedGetUrl(bucketName: String, objectName: String, expiry: Int = 24 * 60 * 60): String {
        return minioClient.getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder().method(Method.GET)
            .bucket(bucketName).`object`(objectName).expiry(expiry).build()
        )
    }

    /**
     * generates a pre signed put url for the given object
     *
     * @param bucketName the name of the Bucket to generate a presigned url for
     * @param objectName the name of the Object to generate a presigned url for
     * @param expiry     Seconds after the URL has expired (default 24h)
     * @return a presigned url for a put request
     */
    fun generatePresignedUrlPut(bucketName: String, objectName: String, expiry: Int = 24 * 60 * 60): String {
        return minioClient.getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder().method(Method.PUT)
            .bucket(bucketName).`object`(objectName).expiry(expiry).build()
        )
    }
}
