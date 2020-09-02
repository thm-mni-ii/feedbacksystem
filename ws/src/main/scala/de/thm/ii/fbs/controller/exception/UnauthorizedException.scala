package de.thm.ii.fbs.controller.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
  * UnauthorizedException 401
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
class UnauthorizedException(message: String = "") extends RuntimeException(message)
