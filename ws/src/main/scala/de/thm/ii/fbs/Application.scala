package de.thm.ii.fbs

import java.io.FileNotFoundException
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
import org.springframework.boot.web.servlet.MultipartConfigFactory
import org.springframework.context.annotation.Bean
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
  private implicit val jdbc: JdbcTemplate = null

  private val initSQLPath = "/usr/local/ws/fbs.sql"
  private val initSQLClasspath = "fbs.sql"

  private def loadDBSchema(): (Source, String) =
    try {
      (Source.fromFile(initSQLPath), initSQLPath)
    } catch {
      case _: FileNotFoundException => try {
        (Source.fromResource(initSQLClasspath), "classpath")
      } catch {
        case _: FileNotFoundException =>
          logger.error("Initialization sql-file not found in classpath")
          System.exit(1)
          null
      }
    }

  /**
    * Initialize the database schema if none exists.
    */
  @EventListener(value = Array(classOf[ApplicationReadyEvent]))
  private def ensureDBSchema(): Unit = {
    val results = DB.query("SELECT * FROM information_schema.tables WHERE table_name = 'course' LIMIT 1;", (_, _) => 1)
    if (results.isEmpty) {
      val (sqlSource, sqlSourcePath) = loadDBSchema()
      logger.info("Database schema not found -> Initialize a database schema with script in " + sqlSourcePath)
      val sql = sqlSource.mkString.split(';').filterNot(_.isBlank)
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
