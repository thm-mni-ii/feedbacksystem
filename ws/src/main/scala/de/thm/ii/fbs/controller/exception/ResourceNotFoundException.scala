package de.thm.ii.fbs.controller.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
  * ResourceNotFoundException 404
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
class ResourceNotFoundException(message: String = "") extends RuntimeException(message)
