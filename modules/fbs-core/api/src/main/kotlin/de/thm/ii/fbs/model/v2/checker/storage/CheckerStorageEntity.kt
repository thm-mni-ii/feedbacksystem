package de.thm.ii.fbs.model.v2.checker.storage

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.utils.v2.converters.JpaJsonNodeConverter
import javax.persistence.*

@Entity
@Table(name = "checkrunner_storage")
@IdClass(CheckerStorageId::class)
class CheckerStorageEntity(
    @Id
    var configurationId: Int,
    @Id
    var storageKey: String,
    @Column(nullable = false)
    @Convert(converter = JpaJsonNodeConverter::class)
    var value: JsonNode,
)
