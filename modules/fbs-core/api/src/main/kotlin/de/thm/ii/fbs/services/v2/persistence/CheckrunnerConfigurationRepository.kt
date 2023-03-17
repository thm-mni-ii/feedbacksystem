package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration
import org.springframework.data.jpa.repository.JpaRepository

interface CheckrunnerConfigurationRepository : JpaRepository<CheckrunnerConfiguration, Int> {
}