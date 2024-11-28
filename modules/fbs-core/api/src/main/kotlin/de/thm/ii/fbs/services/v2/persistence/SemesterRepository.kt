package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.Semester
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface SemesterRepository : JpaRepository<Semester, Int> {
    @Modifying
    @Transactional
    @Query("INSERT INTO semester (name) VALUES (?);", nativeQuery = true)
    fun insertIntoSemester(name: String): Int
}
