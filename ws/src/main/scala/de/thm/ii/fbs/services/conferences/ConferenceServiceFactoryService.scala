package de.thm.ii.fbs.services.conferences

import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.stereotype.Service

/**
  * Factory that creates ConferenceServices
  * @param templateBuilder Request template builder.
  */
@Service
class ConferenceServiceFactoryService(private val templateBuilder: RestTemplateBuilder) {
  /**
    * Runs the factory
    * @param service The name of the service that should be constructed
    * @return A new ConferenceService
    */
  def apply(service: String): ConferenceService = {
    service match {
      case "jitsi" => new JitsiService(templateBuilder)
      case "bbb" => new BBBService(templateBuilder)
      case _: String => throw new IllegalArgumentException("unknown conference service")
    }
  }
}
