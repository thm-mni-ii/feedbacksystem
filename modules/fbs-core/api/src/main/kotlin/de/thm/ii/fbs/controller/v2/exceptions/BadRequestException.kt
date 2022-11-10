package de.thm.ii.fbs.controller.v2.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

class BadRequestException(message: String) : ResponseStatusException(HttpStatus.BAD_REQUEST, message)
