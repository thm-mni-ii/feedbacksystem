package de.thm.ii.fbs.services.v2.checker

import de.thm.ii.fbs.model.v2.checker.* // ktlint-disable no-wildcard-imports
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundQuery
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundShare
import de.thm.ii.fbs.services.v2.misc.IdService
import de.thm.ii.fbs.services.v2.persistence.SqlSharePlaygroundShareRepository
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
    @Value("\${services.sqlPlayground.share.publicHost}")
    private val publicShareHost: String,
    @Value("\${services.sqlPlayground.share.publicPort}")
    private val publicSharePort: Int,
    private val sqlSharePlaygroundShareRepository: SqlSharePlaygroundShareRepository,
    private val idService: IdService
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

    fun shareDatabase(db: SqlPlaygroundDatabase): String {
        val id = idService.encode(db.id!!)
        val token = UUID.randomUUID().toString()
        val creationTime = LocalDateTime.now()
        this.sendToRunner(
            SqlPlaygroundShareArguments(

                RunnerUser(db.owner.id!!, db.owner.username),
                RunnerDatabase(db.id!!, db.name),
                id,
                token
            )
        )
        sqlSharePlaygroundShareRepository.save(SqlPlaygroundShare(db, creationTime, db.id!!))
        return "postgresql://$id:$token@$publicShareHost:$publicSharePort/$id"
    }

    fun deleteDatabaseShare(share: SqlPlaygroundShare) {
        /*val db = share.database
        this.sendToRunner(
            SqlPlaygroundShareDeleteArguments(
                RunnerDatabase(db.id!!, db.name),
                idService.encode(share.database.id!!),
        ))
        sqlSharePlaygroundShareRepository.delete(share)*/
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
