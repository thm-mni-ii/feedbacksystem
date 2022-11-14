package de.thm.ii.fbs.model.v2.playground

import javax.persistence.Id
import javax.persistence.OneToOne
import javax.persistence.Query

data class SQLExecuteResponse(
    @Id
    @OneToOne(optional = false)
    var query: Query,
)
