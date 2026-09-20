package de.thm.ii.fbs.fbs_identity_service.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.CONFLICT)
class ApplicationProviderAlreadyExistsException(id: String) :
    RuntimeException("ApplicationProvider with id '$id' already exists")
