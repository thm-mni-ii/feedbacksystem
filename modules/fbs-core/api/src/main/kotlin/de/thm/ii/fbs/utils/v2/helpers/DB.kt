package de.thm.ii.fbs.utils.v2.helpers

import org.springframework.dao.DataAccessException
import org.springframework.jdbc.core.ArgumentPreparedStatementSetter
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.PreparedStatementCreator
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.jdbc.support.KeyHolder
import java.sql.Connection
import java.sql.Statement

/**
 * Wraps the evil java spring jdbc template api into a scala conform api.
 */

object DB {
    // The timout to terminate a query after TIMEOUT_IN_SEC seconds.
    private val TIMEOUT_IN_SEC = 5
    private val BATCH_TIMEOUT_IN_SEC = 60

    /**
     * See @JdbcTemplate::query
     *
     * @param sql Prepared statement
     * @param rowMapper Row mapper to create result.
     * @param args Arguments to fill the prepared statement
     * @param jdbc Spring JDBC Template.
     * @tparam T Type of element
     * @throws DataAccessException If data could not be accessed by query.
     * @return Mapped type
     */
    @Throws(DataAccessException::class)
    fun <T> query(jdbc: JdbcTemplate, sql: String, rowMapper: RowMapper<T>, vararg args: Any): List<T> {
        jdbc.queryTimeout = TIMEOUT_IN_SEC
        return jdbc.query(sql, rowMapper, args).toList()
    }

    /**
     * See @JdbcTemplate::update
     * @param sql Prepared statement
     * @param args Arguments to fill the prepared statement
     * @param jdbc Spring JDBC Template.
     * @throws DataAccessException If data could not be accessed by query.
     * @return The generated keys
     */
    @Throws(DataAccessException::class)
    fun insert(jdbc: JdbcTemplate, sql: String, vararg args: Any): List<Any>? {
        jdbc.queryTimeout = TIMEOUT_IN_SEC
        return jdbc.execute { conn: Connection ->
            val ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
            val pss = ArgumentPreparedStatementSetter(args)
            pss.setValues(ps)
            val num = ps.executeUpdate()

            if (num == 0) {
                null
            } else {
                val gk = ps.generatedKeys
                if (gk.next()) {
                    val columnCount = gk.metaData.columnCount
                    val gka = (1 to columnCount).toList().map { cid -> gk.getObject(cid) }
                    gka
                } else {
                    null
                }
            }
        }
    }

    /**
     * See @JdbcTemplate::update
     * @param psc Connection handler (connection => {   })
     * @param jdbc Spring JDBC Template.
     * @throws DataAccessException If data could not be accessed by query.
     * @return Tuple of (number of updated rows, generated keys)
     */
    @Throws(DataAccessException::class)
    fun update(jdbc: JdbcTemplate, psc: PreparedStatementCreator): Pair<Int, KeyHolder> {
        jdbc.queryTimeout = TIMEOUT_IN_SEC
        val keyHolder = GeneratedKeyHolder()
        return Pair(jdbc.update(psc, keyHolder), keyHolder)
    }

    /**
     * See @JdbcTemplate::update
     * @param sql Prepared statement
     * @param args Arguments to fill the prepared statement
     * @param jdbc Spring JDBC Template.
     * @throws DataAccessException If data could not be accessed by query.
     * @return Number of updated rows.
     */
    @Throws(DataAccessException::class)
    fun update(jdbc: JdbcTemplate, sql: String, vararg args: Any): Int {
        jdbc.queryTimeout = TIMEOUT_IN_SEC
        return jdbc.update(sql, args)
    }

    /**
     * Execute multiple sql statements as a batch job.
     * @param sql Multiple sql statements.
     * @param jdbc Spring JDBC Template.
     * @throws DataAccessException If data could not be accessed by query.
     * @return Number of effected elements per statement.
     */
    @Throws(DataAccessException::class)
    fun batchUpdate(jdbc: JdbcTemplate, vararg sql: String): Boolean? {
        jdbc.queryTimeout = BATCH_TIMEOUT_IN_SEC
        return jdbc.execute { conn: Connection ->
            conn.autoCommit = false
            val stmt = conn.createStatement()
            sql.forEach { el -> stmt.executeLargeUpdate(el) }
            conn.commit()
            conn.autoCommit = true
            true
        }
    }
}
