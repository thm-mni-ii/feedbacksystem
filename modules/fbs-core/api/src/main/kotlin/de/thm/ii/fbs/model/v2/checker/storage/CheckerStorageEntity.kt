package de.thm.ii.fbs.model.v2.checker.storage

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.utils.v2.converters.JpaJsonNodeConverter
import javax.persistence.*

@Entity
@Table(
    name = "checkrunner_storage",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["configurationId", "storageKey"]),
        UniqueConstraint(columnNames = ["configurationId", "submissionId", "storageKey"])
    ]
)
class CheckerStorageEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
    @Column(nullable = false) // TODO: define FOREIGN Key
    var configurationId: Int,
    @Column(nullable = true) // TODO: define FOREIGN Key
    var submissionId: Int? = null,
    @Column(nullable = false)
    var storageKey: String,
    @Column(nullable = false)
    @Convert(converter = JpaJsonNodeConverter::class)
    var value: JsonNode,
)
