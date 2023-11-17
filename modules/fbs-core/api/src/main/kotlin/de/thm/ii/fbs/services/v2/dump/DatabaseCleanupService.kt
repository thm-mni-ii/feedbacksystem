import de.thm.ii.fbs.model.v2.security.DatabaseDumpToken
import de.thm.ii.fbs.services.v2.checker.SqlPlaygroundCheckerService
import de.thm.ii.fbs.services.v2.persistence.DatabaseDumpTokenRepository
import de.thm.ii.fbs.services.v2.persistence.SqlPlaygroundDatabaseRepository
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class DatabaseCleanupService(
    private val databaseDumpTokenRepository: DatabaseDumpTokenRepository,
    private val sqlPlaygroundCheckerService: SqlPlaygroundCheckerService,
    private val databaseRepository: SqlPlaygroundDatabaseRepository
) {
    @Scheduled(fixedDelayString = "PT24H") // Runs every 24h
    fun cleanupExpiredDumps() {
        val now = LocalDateTime.now()
        val expiredTokens: List<DatabaseDumpToken> = databaseDumpTokenRepository.findAllByExpiryTimeBefore(now)
        expiredTokens.forEach { token ->
            val db = databaseRepository.findByOwner_IdAndIdAndDeleted(token.userId, token.dbId, false)
                ?: throw NotFoundException()
            sqlPlaygroundCheckerService.deleteDatabase(db, db.id!!, db.name)
            databaseDumpTokenRepository.delete(token)
        }
    }
}
