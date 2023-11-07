package de.thm.ii.fbs.model.v2.group.api

import com.fasterxml.jackson.annotation.JsonProperty

class GroupJoining(
    @JsonProperty("key")
    var key: String,
)