package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.{JsonIgnoreProperties, JsonProperty}

@JsonIgnoreProperties(ignoreUnknown = true) // Ignore runner Type
case class SharePlaygroundArgs(@JsonProperty("user") user: User,
                                @JsonProperty("database") database: Database)