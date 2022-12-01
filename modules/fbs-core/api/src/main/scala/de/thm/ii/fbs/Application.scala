package de.thm.ii.fbs

import de.thm.ii.fbs.model.storageBucketName
import de.thm.ii.fbs.services.persistence.{DatabaseMigrationService, MinioService}
import io.minio.{BucketExistsArgs, MakeBucketArgs}

import java.nio.file.{Files, Paths}
import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.{HttpsURLConnection, SSLContext, TrustManager, X509TrustManager}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.boot.web.servlet.MultipartConfigFactory
import org.springframework.context.annotation.{Bean, ComponentScan}
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

import javax.servlet.MultipartConfigElement
import org.springframework.util.unit.DataSize

import scala.io.Source

/**
  * Class dummy for spring boot.
  *
  * @author Andrej Sajenko
  */
@SpringBootApplication
class Application {
  private val logger = LoggerFactory.getLogger(this.getClass)
  @Autowired
  private implicit val migrationService: DatabaseMigrationService = null
  @Autowired
  private implicit val minioService: MinioService = null

  /**
    * Initialize the database schema if none exists.
    */
  @EventListener(value = Array(classOf[ApplicationReadyEvent]))
  private def ensureDBSchema(): Unit = {
    migrationService.migrate()
    logger.info("Feedbacksystem started.")
  }

  /**
    * Initialize Minio Client
    */
  @EventListener(value = Array(classOf[ApplicationReadyEvent]))
  private def initializeMinio(): Unit = {
    minioService.initialMinio()
    if (!minioService.minioClient.bucketExists(BucketExistsArgs.builder().bucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET).build())) {
      minioService.minioClient.makeBucket(MakeBucketArgs.builder().bucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET).build())
    }
    if (!minioService.minioClient.bucketExists(BucketExistsArgs.builder().bucket(storageBucketName.SUBMISSIONS_BUCKET).build())) {
      minioService.minioClient.makeBucket(MakeBucketArgs.builder().bucket(storageBucketName.SUBMISSIONS_BUCKET).build())
    }
    logger.info("Minioclient connected")
  }
}
/**
  * Boot webservice to handle user comminication over a REST Service.
  *
  * @author Andrej Sajenko
  */
object Application extends App {
  private val sc = SSLContext.getInstance("SSL")
  private val managers: Array[TrustManager] = Array(new X509TrustManager {
    override def checkClientTrusted(x509Certificates: Array[X509Certificate], s: String): Unit = {}
    override def checkServerTrusted(x509Certificates: Array[X509Certificate], s: String): Unit = {}
    override def getAcceptedIssuers: Array[X509Certificate] = Array()
  })

  sc.init(null, managers, new SecureRandom())
  HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory)

  private val config = if (Files.exists(Paths.get("/usr/local/ws/conf/application.yml"))) {
    "--spring.config.location=file:/usr/local/ws/conf/application.yml" +: args
  } else {
    "--spring.config.location=classpath:/application.yml" +:args
  }

  SpringApplication.run(classOf[Application], config: _*)

  /**
    * configure upload and request size
    * @return new configuration
    */
  @Bean def multipartConfigElement: MultipartConfigElement = {
    val maxsize = 512000000L
    val factory = new MultipartConfigFactory
    factory.setMaxFileSize(DataSize.ofBytes(maxsize))
    factory.setMaxRequestSize(DataSize.ofBytes(maxsize))
    factory.createMultipartConfig
  }
}
