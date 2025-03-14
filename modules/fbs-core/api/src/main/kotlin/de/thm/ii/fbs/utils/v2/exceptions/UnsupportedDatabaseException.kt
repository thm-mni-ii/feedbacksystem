package de.thm.ii.fbs.utils.v2.exceptions

import de.thm.ii.fbs.model.v2.playground.api.PlaygroundDatabaseType
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.UNPROCESSABLE_ENTITY)
class UnsupportedDatabaseException(dbType: PlaygroundDatabaseType) : RuntimeException("unsupported database")