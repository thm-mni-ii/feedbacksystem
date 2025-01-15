package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.group.Group
import org.springframework.data.jpa.repository.JpaRepository

interface GroupRepository : JpaRepository<Group, Int>
