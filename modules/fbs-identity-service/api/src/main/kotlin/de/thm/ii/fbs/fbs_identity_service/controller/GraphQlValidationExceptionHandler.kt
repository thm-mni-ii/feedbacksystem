package de.thm.ii.fbs.fbs_identity_service.controller

import graphql.GraphQLError
import graphql.GraphqlErrorBuilder
import graphql.schema.DataFetchingEnvironment
import jakarta.validation.ConstraintViolationException
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler
import org.springframework.graphql.execution.ErrorType
import org.springframework.web.bind.annotation.ControllerAdvice

@ControllerAdvice
class GraphQlValidationExceptionHandler {

    @GraphQlExceptionHandler
    fun handleConstraintViolation(
        exception: ConstraintViolationException,
        environment: DataFetchingEnvironment
    ): GraphQLError {
        val violations = exception.constraintViolations.map { violation ->
            mapOf(
                "field" to violation.propertyPath.toString().substringAfterLast("."),
                "message" to violation.message
            )
        }

        return GraphqlErrorBuilder.newError(environment)
            .errorType(ErrorType.BAD_REQUEST)
            .message("Invalid input")
            .extensions(
                mapOf(
                    "code" to "VALIDATION_ERROR",
                    "violations" to violations
                )
            )
            .build()
    }
}