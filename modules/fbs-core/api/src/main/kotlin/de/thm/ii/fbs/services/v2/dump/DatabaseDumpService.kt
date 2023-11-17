package de.thm.ii.fbs.services.v2.dump
import de.thm.ii.fbs.model.v2.checker.DatabaseDumpArguments
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundDatabase
import de.thm.ii.fbs.model.v2.security.DatabaseDumpToken
import de.thm.ii.fbs.services.v2.checker.RemoteCheckerV2Service
import de.thm.ii.fbs.services.v2.persistence.DatabaseDumpTokenRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.IOException
import java.time.LocalDateTime
import java.util.UUID


@Service
class DatabaseDumpService(
    @Value("\${services.masterRunner.insecure}")
    insecure: Boolean,
    @Value("\${services.masterRunner.url}")
    private val masterRunnerURL: String,
    private val databaseDumpTokenRepository: DatabaseDumpTokenRepository
    ) : RemoteCheckerV2Service(insecure, masterRunnerURL) {

    @Throws(IOException::class, InterruptedException::class)
    fun createDump(db: SqlPlaygroundDatabase): String {
        val token = UUID.randomUUID().toString()
        val expiryTime = LocalDateTime.now().plusSeconds(30)
        val dumpArgs = DatabaseDumpArguments(db.id!!, db.name)
        val uri = this.sendDumpRequest(dumpArgs)

        databaseDumpTokenRepository.save(DatabaseDumpToken(token, db.owner.id!!, db.id!!, db.name, expiryTime, uri))

        return uri
    }
}