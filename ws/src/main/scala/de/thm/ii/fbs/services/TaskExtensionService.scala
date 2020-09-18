package de.thm.ii.fbs.services

import de.thm.ii.fbs.model.{TaskExtension}
import de.thm.ii.fbs.util.{BadRequestException, DB}
import org.springframework.beans.factory.annotation.{Autowired}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * Enable communication with Tasks Extensions
  *
  * @author Benjamin Manns
  */
@Component
class TaskExtensionService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * save or update a task extended information by user with a given subject
    * @param taskid task ID
    * @param userid user ID
    * @param subject type / handler of information
    * @param data data encoded as string (json, base64, ...)
    * @param info_typ what kind of data is stored (string / file)
    * @return if update succeeded
    */
  def setTaskExtension(taskid: Int, userid: Int, subject: String, data: String, info_typ: String): Boolean = {
    if (!List("file", "string").contains(info_typ)) throw new BadRequestException("info_typ not allowed")
    val num = DB.update(
      "INSERT INTO task_extension (taskid, userid, subject, data, info_typ) values (?,?,?,?,?) on duplicate key update data = ?",
      taskid, userid, subject, data, info_typ, data)
    num > 0
  }

  /**
    * get list of task extension by taks and user
    * @param taskid task ID
    * @param userid user ID
    * @return list of Task Extension Models
    */
  def getAllExensionsByTask(taskid: Int, userid: Int): List[TaskExtension] = {
    DB.query("SELECT * from task_extension where taskid = ? and userid = ?",
      (res, _) => {
        new TaskExtension(res.getInt("taskid"), res.getInt("userid"), res.getString("subject"), res.getString("data"),
          res.getString("info_typ"))
      }, taskid, userid)
  }
}
