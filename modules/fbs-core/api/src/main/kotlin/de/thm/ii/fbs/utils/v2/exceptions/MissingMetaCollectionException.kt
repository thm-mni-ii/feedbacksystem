package de.thm.ii.fbs.utils.v2.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
class MissingMetaCollectionException : RuntimeException("The meta collection 'mongo_playground_database' could not be created!")
