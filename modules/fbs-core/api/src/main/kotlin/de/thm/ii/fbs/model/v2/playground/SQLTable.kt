package de.thm.ii.fbs.model.v2.playground

import de.thm.ii.fbs.utils.v2.converters.JpaJsonConverter
import javax.persistence.*

@Entity
@Table(name = "sql_playground_table")
class SQLTable(
        @Column(nullable = false)
        var name: String,
        @Column(nullable = false)
        @Convert(converter = ColumnsConvert::class)
        var columns: List<SQLTableColumn>,
        @ManyToOne(optional = false)
        var database: Database,
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
)

class SQLTableColumn(val name: String, val isNullable: Boolean, val udtName: String)

class ColumnsConvert : JpaJsonConverter<SQLTableColumn>(SQLTableColumn::class)
