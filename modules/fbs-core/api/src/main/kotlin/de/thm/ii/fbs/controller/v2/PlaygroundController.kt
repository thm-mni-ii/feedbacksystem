package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.playground.*
import org.springframework.web.bind.annotation.*

// TODO: Autorisation
@RestController
@RequestMapping(path = ["/api/v2/playground/{uid}/databases"])
class PlaygroundController {
    @GetMapping
    @ResponseBody
    fun index(): List<Database> = listOf(Database("1", "Test", "8", "PSQL"))

    @PutMapping
    @ResponseBody
    fun create(@RequestBody database: DatabaseCreation): Database = Database("1", "Test", "8", "PSQL")

    @DeleteMapping("/{dbId}")
    @ResponseBody
    fun delete(): Database = Database("1", "Test", "8", "PSQL")

    @GetMapping("/{dbId}")
    @ResponseBody
    fun get(): Database = Database("1", "Test", "8", "PSQL")

    @PostMapping("/{dbId}/reset")
    @ResponseBody
    fun reset(): Unit = Unit

    // TODO: Make async
    @PostMapping("/{dbId}/execute")
    @ResponseBody
    fun execute(@RequestBody sqlQuery: SQLQuery): SQLResponse = SQLResponse(false, null, "")

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