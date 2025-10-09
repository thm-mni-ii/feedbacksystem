package de.thm.ii.fbs.services.v2.misc

import de.thm.ii.fbs.services.persistence.UserService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

import java.sql.Date
import java.time.Instant

@Service
class UserCleanupService {
  @Value("${privacy.cleanUsers.enabled}")
  private val enabled: Boolean = false
  @Value("${privacy.cleanUsers.secondsAfterLastLogin}")
  private val secondsAfterLastLogin: Int = 15768000

  @Autowired
  private val userService: UserService = null

  private val logger = LoggerFactory.getLogger(this.getClass)

  @Scheduled(fixedDelayString = "PT1D") // Runs every day
  def cleanOldUsers(): Unit = {
    val now = new Date(Instant.now().minusSeconds(secondsAfterLastLogin).getEpochSecond*1000)
    val usersToDelete = userService.getUsersWithLastLoginBefore(now)
    logger.info(s"Found ${usersToDelete.length} users to delete.")
    if (usersToDelete.nonEmpty) {
      usersToDelete.foreach(u => userService.delete(u.id))
      logger.info(s"Deleted ${usersToDelete.map(u => u.username).mkString(", ")}")
    }
  }
}
