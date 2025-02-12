package de.thm.ii.fbs.services.v2.misc

import de.thm.ii.fbs.model.v2.misc.Integration
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.env.Environment
import org.springframework.stereotype.Service

@Service
class IntegrationService(
    @Autowired
    private val env: Environment
) {
    private val cleanRegex = Regex("[^A-Za-z ]")

    fun getAll(): Map<String, Integration> =
        (this.env.getProperty("integrations.names", List::class.java) as List<String>).mapNotNull { name -> get(name).let { if (it != null) name to it else null } }.toMap()

    fun get(integrationName: String): Integration? =
        this.env.getProperty("integrations." + cleanName(integrationName) + ".url").let { if (it !== null) Integration(it) else null }

    private fun cleanName(input: String): String = cleanRegex.replace(input, "")
}
