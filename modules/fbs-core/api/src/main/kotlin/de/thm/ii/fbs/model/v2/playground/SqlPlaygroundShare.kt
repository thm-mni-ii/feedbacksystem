package de.thm.ii.fbs.model.v2.playground
import java.time.LocalDateTime
import javax.persistence.* // ktlint-disable no-wildcard-imports

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
