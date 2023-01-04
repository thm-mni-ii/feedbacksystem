package de.thm.ii.fbs.controller.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
  * BadRequestException 400
  *
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.CONFLICT)
class ConflictException(message: String = "") extends RuntimeException(message)
