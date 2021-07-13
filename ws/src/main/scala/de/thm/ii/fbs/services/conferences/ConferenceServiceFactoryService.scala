package de.thm.ii.fbs.services.conferences

import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.stereotype.Service

/**
  * Factory that creates ConferenceServices
  */
@Service
@deprecated
class ConferenceServiceFactoryService() {
  @Autowired
  private val templateBuilder: RestTemplateBuilder = null

  @Value("${services.bbb.service-url}")
  private val apiUrl: String = null
  @Value("${services.bbb.shared-secret}")
  private val secret: String = null
  @Value("${services.bbb.origin-name}")
  private val originName: String = null
  @Value("${services.bbb.origin-version}")
  private val originVersion: String = null

  /**
    * Runs the factory
    * @param service The name of the service that should be constructed
    * @return A new ConferenceService
    */
  def apply(service: String): ConferenceService = {
    service match {
      case "bigbluebutton" => new BBBService(templateBuilder, apiUrl, secret, originName, originVersion)
      case name: String => throw new IllegalArgumentException(s"unknown conference service: ${name}")
    }
  }
}
