package de.thm.ii.fbs.fbs_identity_service.exception

import graphql.GraphQLError
import graphql.GraphqlErrorBuilder
import graphql.schema.DataFetchingEnvironment
import jakarta.validation.ConstraintViolationException
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler
import org.springframework.graphql.execution.ErrorType
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.ControllerAdvice

@ControllerAdvice
class GraphQlExceptionHandler {

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

    @GraphQlExceptionHandler
    fun handleUsernameAlreadyExists(
        exception: UsernameAlreadyExistsException,
        environment: DataFetchingEnvironment
    ): GraphQLError {
        return GraphqlErrorBuilder.newError(environment)
            .errorType(ErrorType.BAD_REQUEST)
            .message(exception.message ?: "Username already exists")
            .extensions(
                mapOf(
                    "code" to "USERNAME_ALREADY_EXISTS"
                )
            )
            .build()
    }

    @GraphQlExceptionHandler
    fun handleAccessDeniedException(
        exception: AccessDeniedException,
        environment: DataFetchingEnvironment
    ): GraphQLError {
        return GraphqlErrorBuilder.newError(environment)
            .errorType(ErrorType.FORBIDDEN)
            .message("Access denied")
            .extensions(
                mapOf(
                    "code" to "ACCESS_DENIED"
                )
            )
            .build()
    }
}
