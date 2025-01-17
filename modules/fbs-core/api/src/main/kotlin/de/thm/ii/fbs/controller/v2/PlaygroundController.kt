@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import de.thm.ii.fbs.model.v2.group.Group
import de.thm.ii.fbs.model.v2.playground.*
import de.thm.ii.fbs.model.v2.playground.api.*
import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.services.v2.checker.SqlPlaygroundCheckerService
import de.thm.ii.fbs.services.v2.persistence.*
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import kotlin.jvm.optionals.getOrNull

@RestController
@RequestMapping(path = ["/api/v2/playground/{uid}/databases"])
class PlaygroundController(
    private val userRepository: UserRepository,
    private val databaseRepository: SqlPlaygroundDatabaseRepository,
    private val entityRepository: SqlPlaygroundEntityRepository,
    private val queryRepository: SqlPlaygroundQueryRepository,
    private val sqlPlaygroundCheckerService: SqlPlaygroundCheckerService,
    private val groupRepository: GroupRepository
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
        val db = databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        sqlPlaygroundCheckerService.deleteDatabase(db, currentToken.id, currentToken.username)
        db.active = false
        db.deleted = true
        databaseRepository.save(db)
        return db
    }

    @GetMapping("/{dbId}")
    @ResponseBody
    fun get(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase =
        getDatabase(currentToken.id, dbId)

    @PostMapping("/{dbId}/activate")
    @ResponseBody
    fun activate(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase {
        val db = databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        db.active = true
        val currentActiveDb = databaseRepository.findByOwner_IdAndActiveAndDeleted(currentToken.id, true, false)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        return databaseRepository.save(db)
    }

    @PostMapping("/{dbId}/share")
    @ResponseBody
    fun createPlaygroundShare(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundShareResponse {
        val currentActiveDb = databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        val url = sqlPlaygroundCheckerService.shareDatabase(currentActiveDb)
        return SqlPlaygroundShareResponse(url)
    }

    @PutMapping("/{dbId}/share-with-group")
    @ResponseBody
    fun setPlaygroundShareWithGroup(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @RequestBody shareWithGroup: SqlPlaygroundShareWithGroupRequest): SqlPlaygroundDatabase {
        val db = databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        val group = getGroup(shareWithGroup.groupId, currentToken.id)
        db.shareWithGroup = group
        return databaseRepository.save(db)
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun getGroup(
        groupId: Int,
        userId: Int
    ): Group {
        val group = groupRepository.findById(groupId).getOrNull() ?: throw NotFoundException()
        if (group.users.find { it.userId == userId } == null) throw ForbiddenException()
        return group
    }

    @DeleteMapping("/{dbId}/share-with-group")
    @ResponseBody
    fun unsetPlaygroundShareWithGroup(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase {
        val db = databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        db.shareWithGroup = null
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
        val db = getDatabase(currentToken.id, dbId)
        val query = queryRepository.save(SqlPlaygroundQuery(sqlQuery.statement, db))
        sqlPlaygroundCheckerService.submit(query)
        return query
    }

    @GetMapping("/{dbId}/results")
    @ResponseBody
    fun getResults(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): List<SqlPlaygroundResult> {
        getDatabase(currentToken.id, dbId)
        return queryRepository.findByRunIn_id(dbId).mapNotNull { it.result }
    }

    @GetMapping("/{dbId}/results/{qId}")
    @ResponseBody
    fun getResult(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @PathVariable("qId") qId: Int): SqlPlaygroundResult {
        getDatabase(currentToken.id, dbId)
        return queryRepository.findByRunIn_idAndId(dbId, qId)?.result
            ?: throw NotFoundException()
    }

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

    @GetMapping("/shared-with-group/{groupId}")
    @ResponseBody
    fun getByGroupId(@CurrentToken currentToken: LegacyToken, @PathVariable("groupId") groupId: Int): SqlPlaygroundDatabase? {
        getGroup(groupId, currentToken.id)
        return databaseRepository.findByShareWithGroup(groupId)
    }

    private fun getEntity(userId: Int, databaseId: Int, type: String): ArrayNode {
        getDatabase(userId, databaseId)
        return entityRepository.findByDatabase_idAndDatabase_DeletedAndType(databaseId, false, type)?.data ?: throw NotFoundException()
    }

    private fun createAllEntities(database: SqlPlaygroundDatabase) = listOf("tables", "constraints", "views", "routines", "triggers").forEach { type ->
        entityRepository.save(SqlPlaygroundEntity(database, type, ArrayNode(JsonNodeFactory(false))))
    }

    private fun getDatabase(userId: Int, databaseId: Int): SqlPlaygroundDatabase {
        val database = databaseRepository.findByIdAndDeleted(databaseId, false) ?: throw NotFoundException()
        if (database.owner.id == userId) return database
        if (database.shareWithGroup?.users?.find { it.userId == userId } != null) return database
        throw NotFoundException()
    }
}
