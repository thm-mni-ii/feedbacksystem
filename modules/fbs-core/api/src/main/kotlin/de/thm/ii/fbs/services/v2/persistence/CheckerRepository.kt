package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.common.types.checkerApi.Checker
import org.springframework.data.jpa.repository.JpaRepository

interface CheckerRepository : JpaRepository<Checker, Long>
