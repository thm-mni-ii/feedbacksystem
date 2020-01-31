package de.thm.ii.submissioncheck

import java.io.{File, FileInputStream}
import java.nio.file.{Files, Paths}

import de.thm.ii.submissioncheck.misc.DB
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.{Autowired}
import org.springframework.boot.autoconfigure.{SpringBootApplication}
import org.springframework.boot.SpringApplication
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.{PropertySource}
import org.springframework.context.event.EventListener
import org.springframework.util.ResourceUtils
import org.springframework.boot.web.servlet.MultipartConfigFactory
import org.springframework.context.annotation.Bean
import javax.servlet.MultipartConfigElement
import scala.io.{Codec, Source}

/**
  * Class dummy for spring boot.
  *
  * @author Andrej Sajenko
  */
@SpringBootApplication
@PropertySource(value = Array("file:${confdir}/ws/application_dev.properties", "file:/usr/local/appconfig/application.properties"),
  ignoreResourceNotFound = true)
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

  logger.info("SQL ABS PATH: ")
  logger.info(initSQLFile.getAbsolutePath)

  /**
    * Initialize the database schema if none exists.
    */
  @EventListener(value = Array(classOf[ApplicationReadyEvent]))
  private def ensureDBSchema(): Unit = {
    val results = DB.query("SELECT * FROM information_schema.tables WHERE table_name = 'course' LIMIT 1;", (_, _) => 1)
    if (results.isEmpty) {
      logger.info("Database schema not found -> Initialize a database schema")
      val sql = Source.fromInputStream(new FileInputStream(initSQLFile))(Codec.UTF8).mkString.split(';')
      DB.batchUpdate(sql: _*)
    }
    logger.info("Submissionchecker started.")
  }
}
/**
  * Boot webservice to handle user comminication over a REST Service.
  *
  * @author Andrej Sajenko
  */
object Application extends App {
  SpringApplication.run(classOf[Application])

  /**
    * configure upload and request size
    * @return new configuration
    */
  @Bean def multipartConfigElement: MultipartConfigElement = {
    val maxsize = 512000000L
    val factory = new MultipartConfigFactory
    factory.setMaxFileSize(maxsize)
    factory.setMaxRequestSize(maxsize)
    factory.createMultipartConfig
  }
}
