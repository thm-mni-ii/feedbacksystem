package de.thm.ii.fbs.services.persistance

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

  /**
    * Run Migration
    */
  def migrate(): Unit = {
    val migrationNumber = try {
      val results = DB.query("SELECT MAX(migration_number) FROM migrations", (res, _) => res.getInt(0))
      if (results.isEmpty) {
        -1
      } else {
        results.head
      }
    } catch {
      case _: BadSqlGrammarException => -1
    }

    val migrations = listMigrations()

    migrations.filter(migration => migration.getFilename.split("_")(0).toInt > migrationNumber)
      .map(migration => loadMigration(migration))
      .map(migration => {
        System.out.println(migration)
        migration})
      .foreach(migration => DB.batchUpdate(migration: _*))
  }

  private def listMigrations(): Array[Resource] = this.resourceResolver.getResources("migrations/*.sql")
    .sortBy(resource => resource.getFilename)

  private def loadMigration(resource: Resource): Seq[String] =
    FileCopyUtils.copyToString(new InputStreamReader(resource.getInputStream))
      .split(';').filterNot(_.isBlank).toSeq
}
