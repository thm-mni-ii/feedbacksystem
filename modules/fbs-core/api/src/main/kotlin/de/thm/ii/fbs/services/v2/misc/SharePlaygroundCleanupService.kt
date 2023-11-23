package de.thm.ii.fbs.services.v2.misc

import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundShare
import de.thm.ii.fbs.services.v2.checker.SqlPlaygroundCheckerService
import de.thm.ii.fbs.services.v2.persistence.SqlSharePlaygroundShareRepository
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class SharePlaygroundCleanupService(
    private val sqlSharePlaygroundShareRepository: SqlSharePlaygroundShareRepository,
    private val sqlPlaygroundCheckerService: SqlPlaygroundCheckerService,
) {
    @Scheduled(fixedDelayString = "PT1H") // Runs every hour
    fun cleanupExpiredShares() {
        val now = LocalDateTime.now()
        val expiredShares: List<SqlPlaygroundShare> = sqlSharePlaygroundShareRepository.findAllByCreationTimeLessThan(now.minusDays(1))
        expiredShares.forEach { share ->
            sqlPlaygroundCheckerService.deleteDatabaseShare(share)
        }
    }
}
