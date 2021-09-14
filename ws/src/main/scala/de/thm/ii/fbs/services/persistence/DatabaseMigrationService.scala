package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.util.DB
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.Resource
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.jdbc.BadSqlGrammarException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import org.springframework.util.FileCopyUtils

import java.io.InputStreamReader

@Component
/**
  * DatabaseMigrationService
  */
class DatabaseMigrationService {
  private val logger = LoggerFactory.getLogger(this.getClass)
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  private val resourceResolver = new PathMatchingResourcePatternResolver()

  private def oldStyleInstallationFallback(): Unit =
    DB.batchUpdate(
      "CREATE TABLE migration (number int, PRIMARY KEY (number))",
      "INSERT INTO migration (number) VALUES (0)",
      "INSERT INTO migration (number) VALUES (1)"
    )

  /**
    * Run Migration
    */
  def migrate(): Unit = {
    val migrationNumber = try {
      val results = DB.query("SELECT MAX(number) FROM migration", (res, _) => res.getInt(1))
      if (results.isEmpty) {
        -1
      } else {
        results.head
      }
    } catch {
      case _: BadSqlGrammarException => try {
        DB.query("SELECT * FROM `fbs`.`submission`", (_, _) => ())
        oldStyleInstallationFallback()
        1
      } catch {
        case _: BadSqlGrammarException => -1
      }
    }

    val migrations = listMigrations()

    migrations.filter(migration => migration.getFilename.split("_")(0).toInt > migrationNumber)
      .map(migration => {
        logger.info("Running migration " + migration.getFilename + "...")
        migration
      })
      .map(migration => loadMigration(migration))
      .foreach(migration => DB.batchUpdate(migration: _*))
  }

  private def listMigrations(): Array[Resource] = this.resourceResolver.getResources("migrations/*.sql")
    .sortBy(resource => resource.getFilename)

  private def loadMigration(resource: Resource): Seq[String] =
    FileCopyUtils.copyToString(new InputStreamReader(resource.getInputStream))
      .split(';').filterNot(_.isBlank).toSeq
}
