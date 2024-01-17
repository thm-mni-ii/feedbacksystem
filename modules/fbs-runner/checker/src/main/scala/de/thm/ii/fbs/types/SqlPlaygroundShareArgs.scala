package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.{JsonIgnoreProperties, JsonProperty}

@JsonIgnoreProperties(ignoreUnknown = true) // Ignore runner Type
case class SqlPlaygroundShareArgs(@JsonProperty("executionId") executionId: Int,
                                  @JsonProperty("user") user: User,
                                  @JsonProperty("database") database: Database,
                                  @JsonProperty("id") id: String,
                                  @JsonProperty("password") password: String,
                                 )
