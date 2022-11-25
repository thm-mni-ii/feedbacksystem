package de.thm.ii.fbs.services.persistence

import io.minio.MinioClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class MinioService {
  @Value("${minio.url}") private val minioUrl: String = null
  @Value("${minio.user}") private val minioUser: String = null
  @Value("${minio.password}") private val minioPassword: String = null
  @Value("${minio.port}") private val port: Integer = null

  var minioClient: MinioClient = null

  def initialMinio(): Unit = {
    minioClient = MinioClient.builder()
      .endpoint(minioUrl, port, false)
      .credentials(minioUser, minioPassword).build()
  }
}
