package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.{JsonIgnoreProperties, JsonProperty}

@JsonIgnoreProperties(ignoreUnknown = true) // Ignore runner Type
case class SqlPlaygroundRunArgs(@JsonProperty("executionId") executionId: Int,
                                @JsonProperty("user") user: User,
                                @JsonProperty("statement") statement: String,
                                @JsonProperty("database") database: Database)
