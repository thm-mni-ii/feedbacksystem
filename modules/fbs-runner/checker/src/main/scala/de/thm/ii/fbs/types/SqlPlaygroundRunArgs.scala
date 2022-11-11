package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.JsonValue

case class SqlPlaygroundRunArgs(@JsonValue("executionId") executionId: Int,
                                @JsonValue("user") user: User,
                                @JsonValue("statement") statement: String,
                                @JsonValue("database") database: Database)
