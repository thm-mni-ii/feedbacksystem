package de.thm.ii.fbs.services

import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * NotificationService provides interaction with notification table
  * @author Benjamin Manns
  */
@Component
class NotificationService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null
  private val LABEL_SUCCESS = "success"

  /**
    * insert a simple message which can be mapped to a user
    * @author Benjamin Manns
    * @param user_id unique identification for a user
    * @param message message what happend
    * @param testsystem from where the message come
    * @return status of update
    */
  def insertNotificationForUser(user_id: Int, message: String, testsystem: String = null): Map[String, Boolean] = {
    DB.update("insert into notification (user_id,message,datetime,testsystem_id) VALUES (?,?,CURRENT_TIMESTAMP,?)",
      user_id, message, testsystem)
    Map(LABEL_SUCCESS-> true)
  }
}
