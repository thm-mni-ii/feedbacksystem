package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.common.types.checkerApi.Result
import org.springframework.data.jpa.repository.JpaRepository

interface ResultRepository : JpaRepository<Result, Long>
