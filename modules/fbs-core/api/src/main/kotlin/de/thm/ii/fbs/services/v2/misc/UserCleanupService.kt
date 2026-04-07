package de.thm.ii.fbs.services.v2.misc

import de.thm.ii.fbs.services.v2.persistence.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class UserCleanupService(
    private val userRepository: UserRepository,
    @Value("\${security.userCleanup.enabled:false}")
    private val enabled: Boolean,
    @Value("\${security.userCleanup.inactiveDaysLimit:365}")
    private val inactiveDaysLimit: Long
) {
    private val logger = LoggerFactory.getLogger(UserCleanupService::class.java)

    @Scheduled(cron = "\${security.userCleanup.checkSchedule:0 0 3 * * SUN}")
    @Transactional
    fun cleanupInactiveUsers() {
        if (!enabled) {
            logger.debug("Benutzer-Cleanup ist deaktiviert.")
            return
        }

        val cutoffDate = LocalDateTime.now().minusDays(inactiveDaysLimit)
        logger.info("Starte Anonymisierung für Benutzer inaktiv seit $cutoffDate.")

        try {
            val inactiveUsers = userRepository.findByLastLoginBefore(cutoffDate)
            inactiveUsers.forEach { user ->
                userRepository.deleteUserCourseEntries(user.id!!)
            }

            val affectedRows = userRepository.anonymizeInactiveUsers(cutoffDate)
            logger.info("Cleanup erfolgreich: $affectedRows Benutzer anonymisiert.")
        } catch (e: Exception) {
            logger.error("Fehler beim Cleanup: ${e.message}", e)
        }
    }
}