package de.thm.ii.fbs.services.v2.checker

import de.thm.ii.fbs.model.v2.checker.RunnerDatabase
import de.thm.ii.fbs.model.v2.checker.RunnerMode
import de.thm.ii.fbs.model.v2.checker.RunnerUser
import de.thm.ii.fbs.model.v2.checker.SqlPlaygroundRunnerArguments
import de.thm.ii.fbs.model.v2.playground.SQLQuery
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class SqlPlaygroundCheckerService(
    @Value("\${services.masterRunner.insecure}")
    insecure: Boolean,
    @Value("\${services.masterRunner.url}")
    private val masterRunnerURL: String,
) : RemoteCheckerV2Service(insecure, masterRunnerURL) {

    fun submit(query: SQLQuery) {
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
}
