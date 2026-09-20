package de.thm.ii.fbs.fbs_identity_service.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class ApplicationProviderNotFoundException(id: String) :
    RuntimeException("ApplicationProvider with id '$id' was not found")
