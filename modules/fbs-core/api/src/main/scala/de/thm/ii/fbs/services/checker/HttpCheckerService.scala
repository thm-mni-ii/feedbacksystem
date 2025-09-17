package de.thm.ii.fbs.services.checker

import de.thm.ii.fbs.services.checker.`trait`.CheckerService
import de.thm.ii.fbs.util.RestTemplateFactory
import org.springframework.web.client.RestTemplate

abstract class HttpCheckerService(insecure: Boolean) extends CheckerService {
  protected val restTemplate: RestTemplate = RestTemplateFactory.makeRestTemplate(insecure)
}
