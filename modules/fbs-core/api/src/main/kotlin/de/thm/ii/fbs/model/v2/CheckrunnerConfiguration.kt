package de.thm.ii.fbs.model.v2

import javax.json.Json
import javax.persistence.*

@Entity
@Table(name = "checkrunner_configuration")
class CheckrunnerConfiguration(
        @Id
        @Column(nullable = false, name = "configuration_id")
        var id: Int,
        @Column(nullable = false, name = "task_id")
        var taskId: Int,

        @Column(nullable = false, name = "checker_type")
        var checkerType: String,

        @Column(nullable = false, name = "main_file_uploaded")
        var mainFileUploaded: Boolean = false,

        @Column(nullable = false, name = "secondary_file_uploaded")
        var secondaryFileUploaded: Boolean = false,

        @Column(nullable = false)
        var ord: Int,

        @Column(name = "checker_type_information")
        var checkerTypeInformation: Json? = null, // TODO? json as ??

        @Column(nullable = false, name = "is_in_block_storage")
        var isInBlockStorage: Boolean = false,
)