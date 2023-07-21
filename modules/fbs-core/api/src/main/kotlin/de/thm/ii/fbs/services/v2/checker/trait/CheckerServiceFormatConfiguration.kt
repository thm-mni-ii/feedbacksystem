package de.thm.ii.fbs.services.v2.checker.trait

import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration

interface CheckerServiceFormatConfiguration {
    fun formatConfiguration(checkrunnerConfiguration: CheckrunnerConfiguration): Any
}