package de.thm.ii.fbs.controller.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
  * ConflictException 400
  * @param message A human readable String
  */
@ResponseStatus(value = HttpStatus.CONFLICT)
class MembershipExceededException(message: String = "Die Gruppe ist voll.") extends RuntimeException(message)
