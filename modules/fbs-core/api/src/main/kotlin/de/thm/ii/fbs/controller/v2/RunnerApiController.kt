package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.node.ArrayNode
import de.thm.ii.fbs.model.v2.checker.SqlPlaygroundRunnerResult
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundEntity
import de.thm.ii.fbs.model.v2.playground.SqlPlaygroundQuery
import de.thm.ii.fbs.model.v2.playground.api.SqlPlaygroundResult
import de.thm.ii.fbs.services.v2.persistence.SqlPlaygroundEntityRepository
import de.thm.ii.fbs.services.v2.persistence.SqlPlaygroundQueryRepository
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
class RunnerApiController(
        private val queryRepository: SqlPlaygroundQueryRepository,
        private val entityRepository: SqlPlaygroundEntityRepository,
) {
    @PostMapping("/results/playground", "/api/v1/results")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun handlePlaygroundResult(@RequestBody result: SqlPlaygroundRunnerResult) {
        val query = queryRepository.findByIdOrNull(result.executionId) ?: throw NotFoundException()
        updateEntity(query, result, "tables")
        updateEntity(query, result, "constraints")
        updateEntity(query, result, "views")
        updateEntity(query, result, "routines")
        updateEntity(query, result, "triggers")
        query.result = SqlPlaygroundResult(result.error, result.errorMsg, result.result)
        queryRepository.save(query)
    }

    private fun updateEntity(query: SqlPlaygroundQuery, result: SqlPlaygroundRunnerResult, type: String) =
        getEntity(query, type).let { entity ->
            entity.data = result.databaseInformation.get(type) as ArrayNode
            entityRepository.save(entity)
        }

    private fun getEntity(query: SqlPlaygroundQuery, type: String) =
        entityRepository.findByDatabase_Owner_IdAndDatabase_idAndType(query.runIn.owner.id!!, query.runIn.id!!, type) ?:
            SqlPlaygroundEntity(query.runIn, type)
}
