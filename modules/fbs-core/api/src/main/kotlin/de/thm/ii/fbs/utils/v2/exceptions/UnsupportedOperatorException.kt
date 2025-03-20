package de.thm.ii.fbs.utils.v2.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.NOT_IMPLEMENTED)
class UnsupportedOperatorException : RuntimeException("This MongoDB operator is not supported!")
