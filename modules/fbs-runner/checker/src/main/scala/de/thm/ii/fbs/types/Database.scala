package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.JsonProperty
import de.thm.ii.fbs.util.DBTypes

case class Database(@JsonProperty("id") id: Int,
                    @JsonProperty("name") name: String,
                    // Currently only Postgresql is supported
                    @JsonProperty("dbType") dbType: String = DBTypes.PSQL_CONFIG_KEY)
