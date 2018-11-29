package de.thm.ii.submissioncheck.misc

import java.sql.Connection

import scala.collection.JavaConverters._
import org.springframework.dao.DataAccessException
import org.springframework.jdbc.core._
import org.springframework.jdbc.support.{GeneratedKeyHolder, KeyHolder}

/**
  * Wraps the evil java spring jdbc template api into a scala conform api.
  *
  * @author Andrej Sajenko
  */
object DB {
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
  @throws[DataAccessException]
  def query[T](sql: String, rowMapper: RowMapper[T], args: Any*)(implicit jdbc: JdbcTemplate): List[T] = {
    jdbc.query(sql, rowMapper, args.asJava.toArray: _*).asScala.toList
  }

  /**
    * See @JdbcTemplate::update
    * @param psc Connection handler (connection => {   })
    * @param jdbc Spring JDBC Template.
    * @throws DataAccessException If data could not be accessed by query.
    * @return Tuple of (number of updated rows, generated keys)
    */
  @throws[DataAccessException]
  def update(psc: PreparedStatementCreator)(implicit jdbc: JdbcTemplate): (Int, KeyHolder) = {
    val keyHolder = new GeneratedKeyHolder
    (jdbc.update(psc, keyHolder), keyHolder)
  }

  /**
    * See @JdbcTemplate::update
    * @param sql Prepared statement
    * @param args Arguments to fill the prepared statement
    * @param jdbc Spring JDBC Template.
    * @throws DataAccessException If data could not be accessed by query.
    * @return Number of updated rows.
    */
  @throws[DataAccessException]
  def update(sql: String, args: Any*)(implicit jdbc: JdbcTemplate): Int = {
    jdbc.update(sql, args.asJava.toArray: _*)
  }

  /**
    * Execute multiple sql statements as a batch job.
    * @param sql Multiple sql statements.
    * @param jdbc Spring JDBC Template.
    * @throws DataAccessException If data could not be accessed by query.
    * @return Number of effected elements per statement.
    */
  @throws[DataAccessException]
  def batchUpdate (sql: String*)(implicit jdbc: JdbcTemplate): Boolean = {
    jdbc.execute((conn: Connection) => {
      conn.setAutoCommit(false)
      val stmt = conn.createStatement
      sql.foreach(stmt.executeLargeUpdate)
      conn.commit()
      conn.setAutoCommit(true)
      true
    })
  }
}
