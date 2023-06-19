package de.thm.ii.fbs.services.checker.`trait`

import de.thm.ii.fbs.model.CheckrunnerConfiguration

trait CheckerServiceFormatConfiguration {
  def formatConfiguration(checkrunnerConfiguration: CheckrunnerConfiguration): Any
}
