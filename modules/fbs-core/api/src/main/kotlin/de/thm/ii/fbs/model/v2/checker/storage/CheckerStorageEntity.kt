package de.thm.ii.fbs.model.v2.checker.storage

import com.fasterxml.jackson.databind.node.ArrayNode
import de.thm.ii.fbs.utils.v2.converters.JpaJsonNodeConverter
import javax.persistence.*

@Entity
@Table(name = "checkrunner_storage")
class CheckerStorageEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,
    @ManyToOne(optional = false)
    @JoinTable(name = "checkrunner_configuration")
    var configurationId: Int,
    @ManyToOne(optional = true)
    @JoinTable(name = "user_task_submission")
    var submissionId: Int? = null,
    @Column(nullable = false)
    var storageKey: String,
    @Column(nullable = false)
    @Convert(converter = JpaJsonNodeConverter::class)
    var value: ArrayNode,
)
