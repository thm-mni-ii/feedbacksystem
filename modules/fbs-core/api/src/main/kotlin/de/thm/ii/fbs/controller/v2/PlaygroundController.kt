package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.node.ArrayNode
import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.model.v2.playground.*
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundDatabaseCreation
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundQueryCreation
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundResult
import de.thm.ii.fbs.services.v2.checker.SqlPlaygroundCheckerService
import de.thm.ii.fbs.services.v2.persistence.*
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path = ["/api/v2/playground/{uid}/databases"])
class PlaygroundController(
        private val userRepository: UserRepository,
        private val databaseRepository: SqlPlaygroundDatabaseRepository,
        private val entityRepository: SqlPlaygroundEntityRepository,
        private val queryRepository: SqlPlaygroundQueryRepository,
        private val sqlPlaygroundCheckerService: SqlPlaygroundCheckerService,
) {
    @GetMapping
    @ResponseBody
    fun index(@CurrentToken currentToken: LegacyToken): List<SqlPlaygroundDatabase> = databaseRepository.findByOwner_Id(currentToken.id)

    @PostMapping
    @ResponseBody
    fun create(@CurrentToken currentToken: LegacyToken, @RequestBody database: SqlPlaygroundDatabaseCreation): SqlPlaygroundDatabase {
        val db = SqlPlaygroundDatabase(database.name, "1", "PSQL", userRepository.findById(currentToken.id).get(), true, 1)
        val currentActiveDb = databaseRepository.findByOwner_IdAndActive(currentToken.id, true)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        return databaseRepository.save(db)
    }

    @DeleteMapping("/{dbId}")
    @ResponseBody
    fun delete(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase {
        val db = databaseRepository.findByOwner_IdAndId(currentToken.id, dbId)!!
        databaseRepository.delete(db)
        return db
    }

    @GetMapping("/{dbId}")
    @ResponseBody
    fun get(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase? =
        databaseRepository.findByOwner_IdAndId(currentToken.id, dbId)

    @PostMapping("/{dbId}/activate")
    @ResponseBody
    fun activate(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int) {
        val db = databaseRepository.findById(dbId).orElse(null)
        db.active = true
        val currentActiveDb = databaseRepository.findByOwner_IdAndActive(currentToken.id, true)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        databaseRepository.save(db)
    }

    @PostMapping("/{dbId}/reset")
    @ResponseBody
    fun reset(): Unit = Unit

    @PostMapping("/{dbId}/execute")
    @ResponseBody
    @ResponseStatus(HttpStatus.ACCEPTED)
    fun execute(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @RequestBody sqlQuery: SqlPlaygroundQueryCreation): SqlPlaygroundQuery {
        val db = databaseRepository.findByOwner_IdAndId(currentToken.id, dbId) ?: throw NotFoundException()
        val query = queryRepository.save(SqlPlaygroundQuery(sqlQuery.statement, db))
        sqlPlaygroundCheckerService.submit(query)
        return query
    }

    @GetMapping("/{dbId}/results")
    @ResponseBody
    fun getResults(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): List<SqlPlaygroundResult> =
            queryRepository.findByRunIn_Owner_IdAndRunIn_id(currentToken.id, dbId).mapNotNull { it.result }

    @GetMapping("/{dbId}/results/{qId}")
    @ResponseBody
    fun getResult(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @PathVariable("qId") qId: Int): SqlPlaygroundResult? =
            queryRepository.findByRunIn_Owner_IdAndRunIn_idAndId(currentToken.id, dbId, qId)?.result

    @GetMapping("/{dbId}/tables")
    @ResponseBody
    fun getTables(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "tables")

    @GetMapping("/{dbId}/constraints")
    @ResponseBody
    fun getConstrains(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "constraints")

    @GetMapping("/{dbId}/views")
    @ResponseBody
    fun getViews(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "views")

    @GetMapping("/{dbId}/routines")
    @ResponseBody
    fun getRoutines(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "routines")

    @GetMapping("/{dbId}/triggers")
    @ResponseBody
    fun getTriggers(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "triggers")

    private fun getEntity(userId: Int, databaseId: Int, type: String) =
        entityRepository.findByDatabase_Owner_IdAndDatabase_idAndType(userId, databaseId, type)?.data ?: throw NotFoundException()
}
