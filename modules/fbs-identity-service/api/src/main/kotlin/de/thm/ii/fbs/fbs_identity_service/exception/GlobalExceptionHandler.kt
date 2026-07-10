package de.thm.ii.fbs.fbs_identity_service.exception

import de.thm.ii.fbs.fbs_identity_service.exception.dto.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(ex: ResponseStatusException, request: HttpServletRequest): ResponseEntity<ErrorResponse> {

        return buildErrorResponse(
            status = HttpStatus.valueOf(ex.statusCode.value()),
            ex.reason,
            request = request
        )
    }

    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleInvalidCredentialsException(ex: InvalidCredentialsException, request: HttpServletRequest): ResponseEntity<ErrorResponse> {

        return buildErrorResponse(
            status = HttpStatus.UNAUTHORIZED,
            message = ex.message,
            request = request
        )
    }

    @ExceptionHandler(InvalidFrontendRedirectPathException::class)
    fun handleInvalidFrontendRedirectPathException(
        ex: InvalidFrontendRedirectPathException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return buildErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = ex.message,
            request = request
        )
    }

    @ExceptionHandler(MissingSamlUsernameException::class)
    fun handleMissingSamlUsernameException(
        ex: MissingSamlUsernameException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return buildErrorResponse(
            status = HttpStatus.UNAUTHORIZED,
            message = ex.message,
            request = request
        )
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValidException(
        ex: MethodArgumentNotValidException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val message = ex.bindingResult.fieldErrors
            .joinToString("; ") { "${it.field}: ${it.defaultMessage}" }

        return buildErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = message,
            request = request
        )
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadableException(
        ex: HttpMessageNotReadableException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return buildErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Malformed request body",
            request = request
        )
    }

    private fun buildErrorResponse(
        status: HttpStatus,
        message: String?,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(status).body(
            ErrorResponse(
                timestamp = Instant.now(),
                status = status.value(),
                error = status.reasonPhrase,
                message = message,
                path = request.requestURI
            )
        )
    }
}
