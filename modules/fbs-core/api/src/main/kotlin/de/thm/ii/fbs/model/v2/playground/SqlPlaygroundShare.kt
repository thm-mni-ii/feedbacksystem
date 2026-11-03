@file:Suppress("ktlint:standard:no-wildcard-imports")

package de.thm.ii.fbs.model.v2.playground
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "sql_playground_share")
class SqlPlaygroundShare(
    @OneToOne(cascade = [CascadeType.ALL])
    @PrimaryKeyJoinColumn
    val database: SqlPlaygroundDatabase,
    @Column(nullable = false)
    val creationTime: LocalDateTime,
    @Id
    @Column(name = "database_id")
    val id: Int? = null
)
