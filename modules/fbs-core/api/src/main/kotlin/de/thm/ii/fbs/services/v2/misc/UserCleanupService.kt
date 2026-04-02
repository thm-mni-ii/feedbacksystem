package de.thm.ii.fbs.services.v2.misc

import de.thm.ii.fbs.services.v2.persistence.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import org.springframework.transaction.annotation.Transactional

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
        logger.info("Starte Cleanup für Benutzer, die seit $cutoffDate inaktiv sind.")

        try {
            val deletedCount = userRepository.deleteByLastLoginBefore(cutoffDate)
            logger.info("Cleanup erfolgreich: $deletedCount inaktive Benutzer wurden gelöscht.")
        } catch (e: Exception) {
            logger.error("Fehler beim Löschen inaktiver Benutzer: ${e.message}", e)
        }
    }
}