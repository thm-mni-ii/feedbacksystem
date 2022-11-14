package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.model.v2.playground.*
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
    private val databaseRepository: DatabaseRepository,
    private val tableRepository: SQLTableRepository,
    private val constraintRepository: SQLConstraintRepository,
    private val viewRepository: SQLViewRepository,
    private val routineRepository: SQLRoutineRepository,
    private val triggerRepository: SQLTriggerRepository,
    private val sqlQueryRepository: SQLQueryRepository,
    private val sqlPlaygroundCheckerService: SqlPlaygroundCheckerService,
) {
    @GetMapping
    @ResponseBody
    fun index(@CurrentToken currentToken: LegacyToken): List<Database> = databaseRepository.findByOwner_Id(currentToken.id)

    @PostMapping
    @ResponseBody
    fun create(@CurrentToken currentToken: LegacyToken, @RequestBody database: DatabaseCreation): Database {
        val db = Database(database.name, "1", "PSQL", userRepository.findById(currentToken.id).get(), true, 1)
        val currentActiveDb = databaseRepository.findByOwner_IdAndActive(currentToken.id, true)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        return databaseRepository.save(db)
    }

    @DeleteMapping("/{dbId}")
    @ResponseBody
    fun delete(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): Database {
        val db = databaseRepository.findByOwner_IdAndId(currentToken.id, dbId)!!
        databaseRepository.delete(db)
        return db
    }

    @GetMapping("/{dbId}")
    @ResponseBody
    fun get(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): Database? =
        databaseRepository.findByOwner_IdAndId(currentToken.id, dbId)

    @PostMapping("/{dbId}/activate")
    @ResponseBody
    fun activate(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): Unit {
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
    fun execute(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @RequestBody sqlQuery: SqlQueryCreation): SQLQuery {
        val db = databaseRepository.findByOwner_IdAndId(currentToken.id, dbId) ?: throw NotFoundException()
        val query = sqlQueryRepository.save(SQLQuery(sqlQuery.statement, db))
        sqlPlaygroundCheckerService.submit(query);
        return query
    }

    // TODO: add pagination
    @PostMapping("/{dbId}/results")
    @ResponseBody
    fun results(): List<SQLResponse> = listOf(SQLResponse(false, null, ""))

    @PostMapping("/{dbId}/results/{rId}")
    @ResponseBody
    fun result(): SQLResponse = SQLResponse(false, null, "")

    // TODO: add pagination
    @GetMapping("/{dbId}/tables")
    @ResponseBody
    fun tables(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): List<SQLTable> =
            tableRepository.findByDatabase_Owner_IdAndDatabase_Id(currentToken.id, dbId)

    @GetMapping("/{dbId}/tables/{taskId}")
    @ResponseBody
    fun tableDetails(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @PathVariable("taskId") taskId: Int): SQLTable? =
            tableRepository.findByDatabase_Owner_IdAndDatabase_IdAndId(currentToken.id, dbId, taskId)

    // TODO: add pagination
    @GetMapping("/{dbId}/tables/{tId}/constraints")
    @ResponseBody
    fun tableConstrains(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int, @PathVariable("taskId") taskId: Int): List<SQLConstraint> =
            constraintRepository.findByTable_Database_Owner_IdAndTable_Database_IdAndTable_Id(currentToken.id, dbId, taskId)

    @GetMapping("/{dbId}/views")
    @ResponseBody
    fun views(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): List<SQLView> =
            viewRepository.findByDatabase_Owner_IdAndDatabase_Id(currentToken.id, dbId)

    @GetMapping("/{dbId}/routines")
    @ResponseBody
    fun routines(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): List<SQLRoutine> =
            routineRepository.findByDatabase_Owner_IdAndDatabase_Id(currentToken.id, dbId)

    // TODO: add pagination
    @GetMapping("/{dbId}/triggers")
    @ResponseBody
    fun triggers(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): List<SQLTrigger> =
        triggerRepository.findByDatabase_Owner_IdAndDatabase_Id(currentToken.id, dbId)
}
