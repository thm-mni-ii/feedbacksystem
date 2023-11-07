package de.thm.ii.fbs.model.v2.group.api

import com.fasterxml.jackson.annotation.JsonProperty

class GroupCreation(
    @JsonProperty("name")
    var name: String,
    @JsonProperty("key")
    var key: String?,
)
