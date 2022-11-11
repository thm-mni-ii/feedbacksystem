package de.thm.ii.fbs.services.persistence

import io.minio.MinioClient
import org.springframework.beans.factory.annotation.Value

class MinioService {
  @Value("${minio.url}") private val minioUrl: String = null
  @Value("${minio.user}") private val minioUser: String = null
  @Value("${minio.password}") private val minioPassword: String = null

  var minioClient: MinioClient

  def initialMinio(): Unit = {
    minioClient = MinioClient.builder()
      .endpoint("http://127.0.0.1", 9000, false)
      .credentials("admin", "SqfyBWhiFGr7FK60cVR2rel").build()
  }
}
