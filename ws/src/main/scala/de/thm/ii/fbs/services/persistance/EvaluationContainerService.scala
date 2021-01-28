package de.thm.ii.fbs.services.persistance

import de.thm.ii.fbs.model.{EvaluationContainer, Task}
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import java.sql.ResultSet

/**
  * Handles Course Evaluation
  */
@Component
class EvaluationContainerService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Get all Evaluation container from a Course
    *
    * @param cid Course Id
    * @return a List of Evaluation Containers
    */
  def getAll(cid: Integer): List[EvaluationContainer] = {
    DB.query("select evaluation_container_id, GROUP_CONCAT(CONCAT_WS(\";\", task_id, name, description, deadline, media_type)) as tasks, " +
      "to_pass, bonus_formula, hide_points from evaluation_container as ec " +
      "JOIN evaluation_container_tasks using (evaluation_container_id) JOIN task as t using (task_id) where ec.course_id = ? group by evaluation_container_id;",
      (res, _) => parseResult(res), cid)
  }

  /**
    * Get one Evaluation container
    *
    * @param cid  Course Id
    * @param ctid Evaluation container Id
    * @return the Evaluation container Id
    */
  def getOne(cid: Integer, ctid: Integer): Option[EvaluationContainer] = {
    val container = DB.query("select evaluation_container_id, GROUP_CONCAT(CONCAT_WS(\";\", task_id, name, description, deadline, media_type)) as tasks, " +
      "to_pass, bonus_formula, hide_points from evaluation_container as ec " +
      "JOIN evaluation_container_tasks using (evaluation_container_id) JOIN task as t using (task_id) " +
      "where ec.course_id = ? and ec.evaluation_container_id = ? group by evaluation_container_id;",
      (res, _) => parseResult(res), cid, ctid).head

    // If a container with this ID does not exist, the query returns a container with default values
    if (container.id != ctid) None else Option(container)
  }

  private def parseResult(res: ResultSet): EvaluationContainer = {
    EvaluationContainer(
      id = res.getInt("evaluation_container_id"),
      tasks = parseTasksResult(res.getString("tasks")),
      toPass = res.getInt("to_pass"),
      bonusFormula = res.getString("bonus_formula"),
      hidePoints = res.getBoolean("hide_points")
    )
  }

  private def parseTasksResult(tasks: String): List[Task] = {
    if (tasks == null) {
      List.empty[Task]
    } else {
      tasks.split(",").map(parseTaskResult).toList
    }
  }

  private def parseTaskResult(task: String): Task = {
    val taskList = task.split(";")
    Task(
      id = Integer.parseInt(taskList(0)),
      name = taskList(1),
      description = taskList(2),
      deadline = taskList(3),
      mediaType = if (taskList.length > 4) taskList(4) else "",
    )
  }
}
