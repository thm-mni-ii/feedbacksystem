package de.thm.ii.fbs.controller.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
  * BadRequestException 400
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
class InternalServerException(message: String = "") extends RuntimeException(message)
