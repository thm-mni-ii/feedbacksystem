package de.thm.ii.fbs.utils.v2.mongo

import de.thm.ii.fbs.model.v2.playground.api.MongoPlaygroundQueryDTO
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException

object MongoSecurityValidator {
    private val forbiddenOperations = setOf(
        "\$out",
        "\$merge",
        "\$function",
        "\$accumulator",
        "\$where"
    )
    private val allowedOperations = setOf(
        "insert",
        "find",
        "aggregate",
        "update",
        "delete",
        "deleteOne",
        "deleteMany",
        "drop",
        "createIndex",
        "dropIndex",
        "createView",
        "dropView"
    )

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
            if (operation !in setOf("createIndex", "createView"))
                checkForbiddenKeys(it, "document")
        }
    }

    fun validateShellCommand(command: String) {
        val dangerousKeywords = listOf("shutdownServer", "dropDatabase", "eval", "load", "sleep")
        val dangerousOperators = forbiddenOperations

        val lower = command.lowercase()

        for (keyword in dangerousKeywords) {
            if (lower.contains(keyword.lowercase()))
                throw ForbiddenException("Forbidden keyword used: '$keyword'")
        }

        for (op in dangerousOperators) {
            if (Regex("""\b$op\b""").containsMatchIn(command))
                throw ForbiddenException("Forbidden MongoDB operator used: '$op'")
        }
    }

    private fun checkForbiddenKeys(doc: org.bson.Document, name: String) {
        val invalid = doc.keys.filter { it in forbiddenOperations }

        if (invalid.isNotEmpty())
            throw ForbiddenException("Forbidden operators in $name: ${invalid.joinToString()}")
    }
}