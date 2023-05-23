package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.utils.v2.helpers.DB
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.Resource
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.jdbc.BadSqlGrammarException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import org.springframework.util.FileCopyUtils
import java.io.InputStreamReader

/**
 * DatabaseMigrationService
 */

@Component
class DatabaseMigrationService {
    private val logger = LoggerFactory.getLogger(this.javaClass)

    @Autowired
    private val jdbc: JdbcTemplate = JdbcTemplate()
    private val resourceResolver = PathMatchingResourcePatternResolver()

    private fun oldStyleInstallationFallback() {
        DB.batchUpdate(
            jdbc,
            "CREATE TABLE migration (number int, PRIMARY KEY (number))",
            "INSERT INTO migration (number) VALUES (0)",
            "INSERT INTO migration (number) VALUES (1)"
        )
    }

    /**
     * Run Migration
     */
    fun migrate() {
        val migrationNumber = try {
            val results = DB.query(jdbc, "SELECT MAX(number) FROM migration", { rs, _ -> rs.getString(1) })
            if (results.isEmpty()) {
                -1
            } else {
                results.first().toInt()
            }
        } catch (e: BadSqlGrammarException) {
            DB.query(jdbc, "SELECT * FROM `fbs`.`submission`", { _, _ -> {} })
            oldStyleInstallationFallback()
            1
        } catch (e: Exception) {
            -1
        }

        val migrations = listMigrations().toList()
        migrations.filter { e -> e.filename.split("_")[0].toInt() > migrationNumber }
            .map { migration ->
                {
                    logger.info("Running migration " + migration.filename + "...")
                    migration
                }
            }
            .map { m -> loadMigration(m()) }
            .forEach { migration -> DB.batchUpdate(jdbc, migration) }
    }

    fun resetDatabase() {
        this.deleteAllTables()
        this.migrate()
    }

    private fun deleteAllTables() {
        val dropQueries = DB.query(
            jdbc,
            """
            |SELECT concat('DROP TABLE `', table_name, '`;')
            |FROM information_schema.tables
            |WHERE table_schema = DATABASE();
            |""".trimMargin("|"),
            { rs, _ -> rs.getString(1) }
        )
        val dropQueriesWithSet = "SET FOREIGN_KEY_CHECKS = 0;" + dropQueries + "SET FOREIGN_KEY_CHECKS = 0;"
        DB.batchUpdate(jdbc, dropQueriesWithSet)
    }

    private fun listMigrations(): Array<Resource> {
        val migrations = this.resourceResolver.getResources("migrations/*.sql")
        migrations.sortBy { resource -> resource.filename }
        return migrations
    }

    private fun loadMigration(resource: Resource): String {
        return FileCopyUtils.copyToString(InputStreamReader(resource.inputStream))
    }
}
