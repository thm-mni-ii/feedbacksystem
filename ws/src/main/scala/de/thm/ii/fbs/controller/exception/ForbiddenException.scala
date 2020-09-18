package de.thm.ii.fbs.controller.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
  * ForbiddenException 403
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.FORBIDDEN)
class ForbiddenException(message: String = "") extends RuntimeException(message)
