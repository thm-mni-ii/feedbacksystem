package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.ac.User
import de.thm.ii.fbs.model.v2.playground.*
import de.thm.ii.fbs.services.v2.persistence.*
import de.thm.ii.fbs.utils.v2.annotations.CurrentUser
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(path = ["/api/v2/playground/{uid}/databases"])
class PlaygroundController(
        private val databaseRepository: DatabaseRepository,
        private val tableRepository: SQLTableRepository,
        private val constraintRepository: SQLConstraintRepository,
        private val viewRepository: SQLViewRepository,
        private val routineRepository: SQLRoutineRepository,
        private val triggerRepository: SQLTriggerRepository,
        ) {
    @GetMapping
    @ResponseBody
    fun index(@CurrentUser currentUser: User): List<Database> = databaseRepository.findByOwner_Id(currentUser.id!!)

    @PutMapping
    @ResponseBody
    fun create(@CurrentUser currentUser: User, @RequestBody database: DatabaseCreation): Database {
        val db = Database(database.name, "1", "PSQL", currentUser, true, 1)
        val currentActiveDb = databaseRepository.findByOwner_IdAndActive(currentUser.id!!, true)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        return databaseRepository.save(db)
    }

    @DeleteMapping("/{dbId}")
    @ResponseBody
    fun delete(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): Database {
        val db = databaseRepository.findByOwner_IdAndId(currentUser.id!!, dbId)!!
        databaseRepository.delete(db)
        return db
    }

    @GetMapping("/{dbId}")
    @ResponseBody
    fun get(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): Database? =
        databaseRepository.findByOwner_IdAndId(currentUser.id!!, dbId)

    @GetMapping("/{dbId}/activate")
    @ResponseBody
    fun activate(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): Unit {
        val db = databaseRepository.findById(dbId).orElse(null)
        db.active = true
        val currentActiveDb = databaseRepository.findByOwner_IdAndActive(currentUser.id!!, true)
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
    fun execute(@RequestBody sqlQuery: SQLQuery): SQLExecuteResponse = SQLExecuteResponse(1)

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
    fun tables(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): List<SQLTable> =
            tableRepository.findByDatabase_Owner_IdAndDatabase_Id(currentUser.id!!, dbId)

    @GetMapping("/{dbId}/tables/{taskId}")
    @ResponseBody
    fun tableDetails(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int, @RequestParam("taskId") taskId: Int): SQLTable? =
            tableRepository.findByDatabase_Owner_IdAndDatabase_IdAndId(currentUser.id!!, dbId, taskId)

    // TODO: add pagination
    @GetMapping("/{dbId}/tables/{tId}/constraints")
    @ResponseBody
    fun tableConstrains(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int, @RequestParam("taskId") taskId: Int): List<SQLConstraint> =
            constraintRepository.findByTable_Database_Owner_IdAndTable_Database_IdAndTable_Id(currentUser.id!!, dbId, taskId)

    @GetMapping("/{dbId}/views")
    @ResponseBody
    fun views(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): List<SQLView> =
            viewRepository.findByDatabase_Owner_IdAndDatabase_Id(currentUser.id!!, dbId)

    @GetMapping("/{dbId}/routines")
    @ResponseBody
    fun routines(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): List<SQLRoutine> =
            routineRepository.findByDatabase_Owner_IdAndDatabase_Id(currentUser.id!!, dbId)

    // TODO: add pagination
    @GetMapping("/{dbId}/triggers")
    @ResponseBody
    fun triggers(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): List<SQLTrigger> =
        triggerRepository.findByDatabase_Owner_IdAndDatabase_Id(currentUser.id!!, dbId)
}
