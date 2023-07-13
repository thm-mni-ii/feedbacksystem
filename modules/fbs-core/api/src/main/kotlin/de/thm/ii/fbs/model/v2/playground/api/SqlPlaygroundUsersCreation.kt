package de.thm.ii.fbs.model.v2.playground.api

import com.fasterxml.jackson.annotation.JsonProperty

class SqlPlaygroundUsersCreation(
    @JsonProperty("userId")
    var userId: Int,
    @JsonProperty("dbId")
    var dbId: Int
)
