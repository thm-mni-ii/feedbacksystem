package de.thm.ii.fbs.utils.v2.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.FORBIDDEN)
class ForbiddenException(string: String) : RuntimeException("forbidden")
