package de.thm.ii.fbs.services.v2.checker

import de.thm.ii.fbs.model.v2.checker.RunnerDatabase
import de.thm.ii.fbs.model.v2.checker.RunnerUser
import de.thm.ii.fbs.model.v2.checker.SqlPlaygroundRunnerArguments
import de.thm.ii.fbs.model.v2.checker.SqlPlaygroundRunnerDeleteArguments
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundQuery
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class SqlPlaygroundCheckerService(
    @Value("\${services.masterRunner.insecure}")
    insecure: Boolean,
    @Value("\${services.masterRunner.url}")
    private val masterRunnerURL: String,
) : RemoteCheckerV2Service(insecure, masterRunnerURL) {

    fun submit(query: SqlPlaygroundQuery) {
        this.sendToRunner(SqlPlaygroundRunnerArguments(
            query.id!!,
            RunnerUser(query.runIn.owner.id!!, query.runIn.owner.username),
            query.statement,
            RunnerDatabase(
                query.runIn.id!!,
                query.runIn.name,
            ),
        ))
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
