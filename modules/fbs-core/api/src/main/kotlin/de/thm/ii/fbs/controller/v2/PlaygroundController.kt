package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.model.v2.playground.*
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundDatabaseCreation
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundQueryCreation
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundResult
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundUsersCreation
import de.thm.ii.fbs.services.v2.checker.SqlPlaygroundCheckerService
import de.thm.ii.fbs.services.v2.persistence.*
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import de.thm.ii.fbs.utils.v2.exceptions.UnauthorizedException
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
        private val sqlPlaygroundUsersRepository: SqlPlaygroundUsersRepository,
) {
    @GetMapping
    @ResponseBody
    fun index(@CurrentToken currentToken: LegacyToken): List<SqlPlaygroundDatabase> = databaseRepository.findByOwner_IdAndDeleted(currentToken.id, false)

    @PostMapping
    @ResponseBody
    fun create(@CurrentToken currentToken: LegacyToken, @RequestBody database: SqlPlaygroundDatabaseCreation): SqlPlaygroundDatabase {
        val db = SqlPlaygroundDatabase(database.name, "PostgreSQL 14", "PSQL", userRepository.findById(currentToken.id).get(), true)
        val currentActiveDb = databaseRepository.findByOwner_IdAndActiveAndDeleted(currentToken.id, true, false)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        val newDb = databaseRepository.save(db)
        createAllEntities(newDb)
        return newDb
    }

    @DeleteMapping("/{dbId}")
    @ResponseBody
    fun delete(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase {
        val db = databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false)
                ?: throw NotFoundException()
        if (currentToken.id == db.owner.id) {
            sqlPlaygroundCheckerService.deleteDatabase(db, currentToken.id, currentToken.username)
            db.active = false
            db.deleted = true
            databaseRepository.save(db)
            return db
        }
        throw UnauthorizedException()
    }

    @PostMapping("/dbusers")
    @ResponseBody
    fun addUserToDB(@CurrentToken currentToken: LegacyToken, @RequestBody userCreation: SqlPlaygroundUsersCreation): SqlPlaygroundUsers {
        val db = databaseRepository.findById(userCreation.dbId).get()
        if (currentToken.id == db.owner.id) {
            return sqlPlaygroundUsersRepository.save(SqlPlaygroundUsers(user = userRepository.findById(userCreation.userId).get(), db = db));
        }
        throw UnauthorizedException()
    }

    @DeleteMapping("/dbusers/{id}")
    @ResponseBody
    fun removeUserFromDB(@CurrentToken currentToken: LegacyToken, @PathVariable id: Int, @RequestBody userCreation: SqlPlaygroundUsersCreation): Unit {
        val db = databaseRepository.findById(userCreation.dbId).get()
        if (currentToken.id == db.owner.id) {
            return sqlPlaygroundUsersRepository.deleteById(id)
        }
        throw UnauthorizedException()
    }

    @GetMapping("/dbusers/all")
    @ResponseBody
    fun getAllDBsOfUser(@CurrentToken currentToken: LegacyToken): List<SqlPlaygroundDatabase> {
        return sqlPlaygroundUsersRepository.findAllSqlPlaygroundDatabasesByUserId(currentToken.id)
    }

    @GetMapping("/{dbId}")
    @ResponseBody
    fun get(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase =
            databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()

    @PostMapping("/{dbId}/activate")
    @ResponseBody
    fun activate(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase {
        val db = databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false)
                ?: throw NotFoundException()
        db.active = true
        val currentActiveDb = databaseRepository.findByOwner_IdAndActiveAndDeleted(currentToken.id, true, false)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        return databaseRepository.save(db)
    }

    @PostMapping("/{dbId}/reset")
    @ResponseBody
    @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
    fun reset(): Unit = Unit

    @PostMapping("/{dbId}/execute")
    @ResponseBody
    @ResponseStatus(HttpStatus.ACCEPTED)
    fun execute(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @RequestBody sqlQuery: SqlPlaygroundQueryCreation): SqlPlaygroundQuery {

        val db = sqlPlaygroundUsersRepository.findSqlPlaygroundDatabasesByMemberIdAndDBId(currentToken.id, dbId)
                ?: throw NotFoundException()
        val query = queryRepository.save(SqlPlaygroundQuery(sqlQuery.statement, db, currentToken.id))
        sqlPlaygroundCheckerService.submit(query)
        return query
    }

    @GetMapping("/{dbId}/results")
    @ResponseBody
    fun getResults(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): List<SqlPlaygroundResult> =
            queryRepository.findAllByCreatorIdAndDatabaseId(currentToken.id, dbId).mapNotNull { it.result }

    @GetMapping("/{dbId}/results/{qId}")
    @ResponseBody
    fun getResult(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @PathVariable("qId") qId: Int): SqlPlaygroundResult =
            queryRepository.findByRunIn_Creator_IdAndRunIn_idAndId(currentToken.id, dbId, qId)?.result
                    ?: throw NotFoundException()

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
            entityRepository.findByDatabase_Owner_IdAndDatabase_idAndDatabase_DeletedAndType(userId, databaseId, false, type)?.data
                    ?: throw NotFoundException()

    private fun createAllEntities(database: SqlPlaygroundDatabase) = listOf("tables", "constraints", "views", "routines", "triggers").forEach { type ->
        entityRepository.save(SqlPlaygroundEntity(database, type, ArrayNode(JsonNodeFactory(false))))
    }
}