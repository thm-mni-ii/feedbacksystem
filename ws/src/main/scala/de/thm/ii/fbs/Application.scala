package de.thm.ii.fbs

import java.io.{File, FileInputStream}
import java.nio.file.{Files, Paths}
import java.security.SecureRandom
import java.security.cert.X509Certificate
import de.thm.ii.fbs.util.DB
import javax.net.ssl.{HttpsURLConnection, SSLContext, TrustManager, X509TrustManager}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.SpringApplication
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.util.ResourceUtils
import org.springframework.boot.web.servlet.MultipartConfigFactory
import org.springframework.context.annotation.Bean
import javax.servlet.MultipartConfigElement
import org.springframework.util.unit.DataSize

import scala.io.{Codec, Source}

/**
  * Class dummy for spring boot.
  *
  * @author Andrej Sajenko
  */
@SpringBootApplication
class Application {
  private val logger = LoggerFactory.getLogger(this.getClass)
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  private val initSQLPath = Paths.get("/usr/local/ws/init.sql")

  private var initSQLFile: File = null
  try {
    initSQLFile = if (Files.isRegularFile(initSQLPath)) {
      new File(initSQLPath.toString)
    } else {
      ResourceUtils.getFile("classpath:init.sql")
    }
  } catch {
    case _: java.io.FileNotFoundException => {
      logger.error("Initialization sql-file not found")
      System.exit(1)
    }
  }

  /**
    * Initialize the database schema if none exists.
    */
  @EventListener(value = Array(classOf[ApplicationReadyEvent]))
  private def ensureDBSchema(): Unit = {
    val results = DB.query("SELECT * FROM information_schema.tables WHERE table_name = 'course' LIMIT 1;", (_, _) => 1)
    if (results.isEmpty) {
      logger.info("Database schema not found -> Initialize a database schema with script: " + initSQLFile.getAbsolutePath)
      val sql = Source.fromInputStream(new FileInputStream(initSQLFile))(Codec.UTF8).mkString.split(';').filterNot(_.isBlank)
      DB.batchUpdate(sql.toSeq: _*)
    }
    logger.info("Feedbacksystem started.")
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
