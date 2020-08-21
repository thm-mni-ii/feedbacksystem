package de.thm.ii.fbs.util

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
  * ResourceNotFoundException 404
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
class ResourceNotFoundException(message: String = "") extends RuntimeException(message)

/**
  * BadRequestException 400
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
class BadRequestException(message: String = "") extends RuntimeException(message)

/**
  * UnauthorizedException 401
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
class UnauthorizedException(message: String = "") extends RuntimeException(message)

/**
  * ForbiddenException 403
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.FORBIDDEN)
class ForbiddenException(message: String = "") extends RuntimeException(message)