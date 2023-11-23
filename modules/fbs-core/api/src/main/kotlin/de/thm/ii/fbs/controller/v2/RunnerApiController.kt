package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.node.ArrayNode
import de.thm.ii.fbs.model.v2.checker.RunnerMode
import de.thm.ii.fbs.model.v2.checker.SqlPlaygroundRunnerResult
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundEntity
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundQuery
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundResult
import de.thm.ii.fbs.services.v2.persistence.SqlPlaygroundEntityRepository
import de.thm.ii.fbs.services.v2.persistence.SqlPlaygroundQueryRepository
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.* // ktlint-disable no-wildcard-imports

@RestController
class RunnerApiController(
    private val queryRepository: SqlPlaygroundQueryRepository,
    private val entityRepository: SqlPlaygroundEntityRepository
) {
    @PostMapping("/results/playground", "/api/v1/results")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun handlePlaygroundResult(@RequestBody result: SqlPlaygroundRunnerResult) {
        if (result.mode != RunnerMode.EXECUTE) return
        val query = queryRepository.findByIdOrNull(result.executionId) ?: throw NotFoundException()
        updateAllEntity(query, result)
        query.result = SqlPlaygroundResult(result.error, result.errorMsg, result.result)
        queryRepository.save(query)
    }

    private fun updateAllEntity(query: SqlPlaygroundQuery, result: SqlPlaygroundRunnerResult) {
        // Do not update the entity if the query had an error, as the checker will not return db information if there was an error
        if (result.error) return

        updateEntity(query, result, "tables")
        updateEntity(query, result, "constraints")
        updateEntity(query, result, "views")
        updateEntity(query, result, "routines")
        updateEntity(query, result, "triggers")
    }

    private fun updateEntity(query: SqlPlaygroundQuery, result: SqlPlaygroundRunnerResult, type: String) =
        getEntity(query, type).let { entity ->
            entity.data = result.databaseInformation.get(type) as ArrayNode
            entityRepository.save(entity)
        }

    private fun getEntity(query: SqlPlaygroundQuery, type: String) =
        entityRepository.findByDatabase_Owner_IdAndDatabase_idAndDatabase_DeletedAndType(query.runIn.owner.id!!, query.runIn.id!!, false, type)
            ?: SqlPlaygroundEntity(query.runIn, type)
}
