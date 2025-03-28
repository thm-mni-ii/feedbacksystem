package de.thm.ii.fbs.utils.v2.mongo

import de.thm.ii.fbs.model.v2.playground.api.MongoPlaygroundQueryDTO
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException

object MongoSecurityValidator {
    private val forbiddenOperations = setOf("\$out", "\$merge", "\$function", "\$accumulator", "\$where")
    private val allowedOperations = setOf("insert", "find", "aggregate", "update", "delete")

    fun validate(operation: String, query: MongoPlaygroundQueryDTO) {
        if (!allowedOperations.contains(operation))
            throw ForbiddenException("Operation '$operation' is not allowed")

        query.pipeline?.forEach { stage ->
            val invalid = stage.keys.intersect(forbiddenOperations)
            if (invalid.isNotEmpty())
                throw ForbiddenException("Forbidden operators in pipeline: ${invalid.joinToString()}")
        }

        query.criteria?.let {
            checkForbiddenKeys(it, "criteria")
        }
        query.update?.let {
            checkForbiddenKeys(it, "update")
        }
        query.document?.let {
            checkForbiddenKeys(it, "document")
        }
    }

    private fun checkForbiddenKeys(doc: org.bson.Document, name: String) {
        val invalid = doc.keys.filter { it in forbiddenOperations }

        if (invalid.isNotEmpty())
            throw ForbiddenException("Forbidden operators in $name: ${invalid.joinToString()}")
    }
}