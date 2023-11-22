package de.thm.ii.fbs.services.v2.checker

import de.thm.ii.fbs.model.v2.checker.*
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundQuery
import de.thm.ii.fbs.model.v2.security.SharePlaygroundToken
import de.thm.ii.fbs.services.v2.persistence.SharePlaygroundTokenRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class SqlPlaygroundCheckerService(
    @Value("\${services.masterRunner.insecure}")
    insecure: Boolean,
    @Value("\${services.masterRunner.url}")
    private val masterRunnerURL: String,
    private val sharePlaygroundTokenRepository: SharePlaygroundTokenRepository,
) : RemoteCheckerV2Service(insecure, masterRunnerURL) {

    fun submit(query: SqlPlaygroundQuery) {
        this.sendToRunner(
            SqlPlaygroundRunnerArguments(
                query.id!!,
                RunnerUser(query.runIn.owner.id!!, query.runIn.owner.username),
                query.statement,
                RunnerDatabase(
                    query.runIn.id!!,
                    query.runIn.name
                )
            )
        )
    }

    fun createSharePlayground(db: SqlPlaygroundDatabase): String {
        val token = UUID.randomUUID().toString()
        val expiryTime = LocalDateTime.now()
        val uri = this.sendToRunner(
            SharePlaygroundArguments(
                RunnerUser(db.owner.id!!, db.owner.username),
                RunnerDatabase(db.id!!, db.name)
            ))
        sharePlaygroundTokenRepository.save(SharePlaygroundToken(token, db.owner.id!!, db.id!!, expiryTime, uri.toString()))
        return uri.toString()
    }

    fun deleteDatabase(database: SqlPlaygroundDatabase, userId: Int, username: String) {
        this.sendToRunner(
            SqlPlaygroundRunnerDeleteArguments(
                RunnerUser(userId, username),
                RunnerDatabase(database.id!!, database.name)
            )
        )
    }
}
