package de.thm.ii.fbs.services.persistance

import de.thm.ii.fbs.model.Submission
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * Handles submission state
  */
@Component
class SubmissionService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    * Register a new submission
    * @param userId User id
    * @param taskId Task id
    * @return Submission
    */
  def register(userId: Int, taskId: Int): Submission = ???
}
