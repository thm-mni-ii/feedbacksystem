package de.thm.ii.fbs.model.v2.playground.api

import com.fasterxml.jackson.annotation.JsonProperty

class SqlPlaygroundDatabaseCreation(
        @JsonProperty("name")
        var name: String
)
