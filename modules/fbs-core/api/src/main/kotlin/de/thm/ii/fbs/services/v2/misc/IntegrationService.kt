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
        getIntegrationNames()
            .mapNotNull { name -> get(name)?.let { name to it } }
            .toMap()

    fun get(integrationName: String): Integration? =
        this.env.getProperty("integrations." + cleanName(integrationName) + ".url").let { if (it !== null) Integration(it) else null }

    private fun getIntegrationNames(): List<String> {
        val list = runCatching {
            this.env.getProperty("integrations.names", List::class.java)
        }.getOrNull()
        if (list != null) {
            return list.mapNotNull { it.toString().trim().takeIf(String::isNotEmpty) }
        }

        return this.env.getProperty("integrations.names")
            ?.split(",")
            ?.mapNotNull { it.trim().takeIf(String::isNotEmpty) }
            ?: emptyList()
    }

    private fun cleanName(input: String): String = cleanRegex.replace(input, "")
}
