package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.task.{Task, TaskBatch}
import de.thm.ii.fbs.util.DB
import org.json.JSONObject
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import java.math.BigInteger
import java.sql.{ResultSet, SQLException, Timestamp}
import java.time.Instant
import java.time.format.DateTimeFormatter
import java.util.Collections

/**
 * Handles the persistence of Trace Log
 */
@Component
class TraceLogService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  def create(traceLogType: String, payload: Option[JSONObject] = None, userId: Option[Int] = None, courseId: Option[Int], taskId: Option[Int],
             checkerId: Option[Int], submissionId: Option[Int]): Boolean =
    DB.insert("INSERT INTO trace_log (type, payload, user_id, course_id, task_id, checker_id, submission_id) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?);",
        traceLogType, payload.map(j => j.toString()).orNull, userId.orNull, courseId.orNull, taskId.orNull, checkerId.orNull, submissionId.orNull
    ).map(gk => gk(0).asInstanceOf[BigInteger].intValue()) match {
        case Some(_) => true
        case None => throw new SQLException("Task could not be created")
    }
}
