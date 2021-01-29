package de.thm.ii.fbs.services.persistance

import de.thm.ii.fbs.model.{EvaluationContainer, Task}
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import java.math.BigInteger
import java.sql.{ResultSet, SQLException}

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
      "LEFT JOIN evaluation_container_tasks using (evaluation_container_id) LEFT JOIN task as t using (task_id) " +
      "where ec.course_id = ? group by evaluation_container_id;",
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
      "LEFT JOIN evaluation_container_tasks using (evaluation_container_id) LEFT JOIN task as t using (task_id) " +
      "where ec.course_id = ? and ec.evaluation_container_id = ? group by evaluation_container_id;",
      (res, _) => parseResult(res), cid, ctid).headOption

    // If a container with this ID does not exist, the query returns a container with default values
    if (container.isDefined && container.get.id != ctid) None else container
  }

  /**
    * Add a Task to an Evaluation Container
    * @param cid Course id
    * @param ctid Evaluation container id
    * @param tid  Task id
    * @return the new Task
    */
  def addTask(cid: Integer, ctid: Integer, tid: Integer): EvaluationContainer = {
    DB.insert("insert ignore into evaluation_container_tasks(evaluation_container_id, task_id) values (?, ?);", ctid, tid)

    getOne(cid, ctid) match {
      case Some(container) => container
      case None => throw new SQLException("Task could not be added")
    }
  }

  /**
    * Delete a Task from an Evaluation Container
    * @param ctid Evaluation Container id
    * @param tid Evaluation container id
    * @return if the Task was Removed
    */
  def removeTask(ctid: Integer, tid: Integer): Boolean =
    1 == DB.update("DELETE FROM evaluation_container_tasks WHERE task_id = ? and evaluation_container_id = ?", tid, ctid)

  /**
    * Create an Evaluation Container
    * @param cid Course id
    * @param container Container to Create
    * @return the created Container
    */
  def createContainer(cid: Integer, container: EvaluationContainer): EvaluationContainer =
    DB.insert("insert into evaluation_container(to_pass, bonus_formula, hide_points, course_id) values (?, ?, ?, ?);"
      , container.toPass, container.bonusFormula, container.hidePoints, cid)
      .map(gk => gk(0).asInstanceOf[BigInteger].intValue())
      .flatMap(id => getOne(cid, id)) match {
      case Some(container) => container
      case None => throw new SQLException("Evaluation Container could not be created")
    }

  /**
    * Update an Evaluation Container
    * @param cid Course id
    * @param ctid Evaluation Container id
    * @param container Container update
    * @return was the Container Updated
    */
  def updateContainer(cid: Integer, ctid: Integer, container: EvaluationContainer): EvaluationContainer = {
    val updated =
      1 == DB.update("UPDATE evaluation_container SET to_pass = ?, bonus_formula = ?, hide_points = ? WHERE course_id = ? and evaluation_container_id = ?",
      container.toPass, container.bonusFormula, container.hidePoints, cid, ctid)

    if (!updated) throw new SQLException("Evaluation Container could not be updated")

    container
  }

  /**
    * Delete an Evaluation Container
    * @param cid Course id
    * @param ctid Course id
    * @return if the Task was Removed
    */
  def deleteContainer(cid: Integer, ctid: Integer): Boolean =
    1 == DB.update("DELETE FROM evaluation_container WHERE course_id = ? and evaluation_container_id = ?", cid, ctid)

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
      tasks.split(",").filter(s => !s.isBlank).map(parseTaskResult).toList
    }
  }

  private def parseTaskResult(task: String): Task = {
    val taskList = task.split(";")

    Task(taskList(1), if (taskList.length > 4) taskList(4) else "", taskList(2), taskList(3), Integer.parseInt(taskList(0)))
  }
}
