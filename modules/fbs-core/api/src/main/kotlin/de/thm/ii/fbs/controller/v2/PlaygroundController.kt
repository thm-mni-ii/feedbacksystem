package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.ac.User
import de.thm.ii.fbs.model.v2.playground.*
import de.thm.ii.fbs.services.v2.persistence.DatabaseRepository
import de.thm.ii.fbs.utils.v2.annotations.CurrentUser
import org.springframework.web.bind.annotation.*
import kotlin.jvm.optionals.getOrNull

// TODO: Autorisation
@RestController
@RequestMapping(path = ["/api/v2/playground/{uid}/databases"])
class PlaygroundController(
        private val databaseRepository: DatabaseRepository,
) {
    @GetMapping
    @ResponseBody
    fun index(@CurrentUser currentUser: User): List<Database> = databaseRepository.findByOwner(currentUser)

    @PutMapping
    @ResponseBody
    fun create(@CurrentUser currentUser: User, @RequestBody database: DatabaseCreation): Database {
        val db = databaseRepository.save(Database(database.name, "1", "PSQL", currentUser, true, 1))
        val currentActiveDb = databaseRepository.findByActive(true)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        return databaseRepository.save(db)
    }

    @DeleteMapping("/{dbId}")
    @ResponseBody
    fun delete(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): Database {
        val db = databaseRepository.findById(dbId).orElse(null)!!
        databaseRepository.delete(db)
        return db
    }

    @GetMapping("/{dbId}")
    @ResponseBody
    fun get(@CurrentUser currentUser: User, @RequestParam("dbId") dbId: Int): Database? =
        databaseRepository.findById(dbId).orElse(null)

    @GetMapping("/{dbId}/activate")
    @ResponseBody
    fun activate(): Unit = Unit

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
    fun tables(): List<SQLTable> = listOf(SQLTable("Test", listOf(SQLTableColumn("Test", false, "int"))))

    @GetMapping("/{dbId}/tables/{tId}")
    @ResponseBody
    fun tableDetails(): SQLTable = SQLTable("Test", listOf(SQLTableColumn("Test", false, "int")))

    // TODO: add pagination
    @GetMapping("/{dbId}/tables/{tId}/constraints")
    @ResponseBody
    fun tableConstrains(): List<SQLConstraint> = listOf(SQLConstraint("Test", "test", "primary", null))

    // TODO: add pagination
    @GetMapping("/{dbId}/tables/{tId}/views")
    @ResponseBody
    fun tableViews(): List<SQLView> = listOf(SQLView("Test", ""))

    // TODO: add pagination
    @GetMapping("/{dbId}/tables/{tId}/routines")
    @ResponseBody
    fun tableRoutines(): List<SQLRoutine> = listOf(SQLRoutine("Test", "", ""))

    // TODO: add pagination
    @GetMapping("/{dbId}/tables/{tId}/triggers")
    @ResponseBody
    fun tableTriggers(): List<SQLTrigger> = listOf(
        SQLTrigger(
            "Test", SQLTriggerEvent("", ""),
            SQLTriggerAction("", "", "")
        )
    )
}
