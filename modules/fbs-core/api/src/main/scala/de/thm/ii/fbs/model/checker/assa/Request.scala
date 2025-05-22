package de.thm.ii.fbs.model.checker.assa

import org.json.JSONObject

import scala.jdk.CollectionConverters.SeqHasAsJava
import scala.jdk.OptionConverters.RichOption

case class Request(
                    sqlEnvironment: String,
                    dbSchema: String,
                    task: String,
                    solutions: List[String],
                    submissions: List[String],
                    taskId: Option[String],
                    userId: Option[String]
) {
  def toJson: JSONObject = new JSONObject()
    .put("sql_environment", sqlEnvironment)
    .put("db_schema", dbSchema)
    .put("task", task)
    .put("solutions", solutions.asJava)
    .put("submissions", submissions.asJava)
    .put("task_id", taskId.toJava)
    .put("user_id", userId.toJava)
}
