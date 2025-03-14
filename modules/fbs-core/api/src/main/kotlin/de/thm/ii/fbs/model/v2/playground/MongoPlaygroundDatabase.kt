package de.thm.ii.fbs.model.v2.playground

import com.fasterxml.jackson.annotation.JsonIgnore
import de.thm.ii.fbs.model.v2.group.Group
import de.thm.ii.fbs.model.v2.security.User
import jakarta.persistence.Id
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "mongo_playground_database")
class MongoPlaygroundDatabase(
    @field:NotBlank(message = "Database name must not be blank")
    var name: String,

    @field:NotBlank(message = "Database version must not be blank")
    var version: String,

    @field:NotBlank(message = "Database dbType must not be blank")
    var dbType: String,

    @field:Valid
    var owner: User,

    @field:NotNull(message = "Active state must not be null")
    var active: Boolean = false,

    @field:Valid
    var shareWithGroup: Group? = null,

    @field:NotNull(message = "Deleted state must not be null")
    @JsonIgnore
    var deleted: Boolean = false,

    @Id
    var id: String? = null,
)