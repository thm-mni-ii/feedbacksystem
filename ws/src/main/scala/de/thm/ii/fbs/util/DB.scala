package de.thm.ii.fbs.util

import java.sql.{Connection, ResultSet, Statement}

import org.springframework.dao.DataAccessException
import org.springframework.jdbc.core._
import org.springframework.jdbc.support.{GeneratedKeyHolder, KeyHolder}

import scala.jdk.CollectionConverters._

/**
  * Wraps the evil java spring jdbc template api into a scala conform api.
  */
object DB {
  // The timout to terminate a query after TIMEOUT_IN_SEC seconds.
  private val TIMEOUT_IN_SEC = 5;
  private val BATCH_TIMEOUT_IN_SEC = 60;

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
    jdbc.setQueryTimeout(TIMEOUT_IN_SEC)
    jdbc.query(sql, rowMapper, args.asJava.toArray: _*).asScala.toList
  }

  /**
    * See @JdbcTemplate::update
    * @param sql Prepared statement
    * @param args Arguments to fill the prepared statement
    * @param jdbc Spring JDBC Template.
    * @throws DataAccessException If data could not be accessed by query.
    * @return The generated keys
    */
  @throws[DataAccessException]
  def insert(sql: String, args: Any*)(implicit jdbc: JdbcTemplate): Option[IndexedSeq[AnyRef]] = {
    jdbc.setQueryTimeout(TIMEOUT_IN_SEC)
    jdbc.execute((conn: Connection) => {
      val ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
      val pss = new ArgumentPreparedStatementSetter(args.asJava.toArray)
      pss.setValues(ps)
      val num = ps.executeUpdate()

      if (num == 0) {
        None
      } else {
        val gk = ps.getGeneratedKeys
        if (gk.next()) {
          val columnCount = gk.getMetaData.getColumnCount
          val gka = (1 to columnCount).map(cid => gk.getObject(cid))
          Some(gka)
        } else {
          None
        }
      }
    })
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
    jdbc.setQueryTimeout(TIMEOUT_IN_SEC)
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
    jdbc.setQueryTimeout(TIMEOUT_IN_SEC)
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
    jdbc.setQueryTimeout(BATCH_TIMEOUT_IN_SEC)
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
