package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.Database
import de.thm.ii.fbs.model.v2.playground.SQLQuery
import org.springframework.data.jpa.repository.JpaRepository

interface SQLQueryRepository : JpaRepository<SQLQuery, Int> {}
